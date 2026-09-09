const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPipeline() {
  console.log("Reading dummy.pdf...");
  const pdfBuffer = fs.readFileSync('dummy.pdf');
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', blob, 'dummy.pdf');

  console.log("Uploading dummy.pdf...");
  const uploadRes = await fetch('http://localhost:3000/api/materials/upload', {
    method: 'POST',
    body: formData
  });

  if (!uploadRes.ok) {
    console.error("Upload failed:", await uploadRes.text());
    return;
  }

  const material = await uploadRes.json();
  console.log("Upload success:", material);

  console.log("Starting processing...");
  const processRes = await fetch(`http://localhost:3000/api/materials/${material.id}/process`, {
    method: 'POST'
  });

  if (!processRes.ok) {
    console.error("Process failed:", await processRes.text());
    return;
  }

  console.log("Processing started. Polling status...");

  for (let i = 0; i < 20; i++) {
    await sleep(2000);
    const m = await prisma.material.findUnique({ where: { id: material.id } });
    console.log(`Status at check ${i+1}:`, m.status);
    if (['ready_for_mapping', 'error', 'processing_error', 'ready'].includes(m.status)) {
      console.log("Terminal status reached:", m.status);
      if (m.processingError) {
        console.error("Error:", m.processingError);
      }
      break;
    }
  }

  console.log("Checking extracted pages and chunks in DB...");
  const pages = await prisma.materialPage.count({ where: { materialId: material.id } });
  const chunks = await prisma.materialChunk.count({ where: { materialId: material.id } });
  console.log(`Pages: ${pages}, Chunks: ${chunks}`);
}

testPipeline()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
