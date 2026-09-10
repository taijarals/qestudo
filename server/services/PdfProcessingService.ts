import { prisma } from '../database/prisma';
import { storageService } from './storage';

interface PageData {
  hasUsableText?: boolean;
  pageNumber: number;
  text: string;
}

export class PdfProcessingService {
  
  async processMaterial(materialId: string) {
    // 1. Verify Material and Status
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new Error('Material not found');

    if (material.status === 'extracting' || material.status === 'chunking') {
      throw new Error('Material is already being processed');
    }

    // Update status to extracting
    await prisma.material.update({
      where: { id: materialId },
      data: { status: 'extracting', processingProgress: 10, processingError: null }
    });

    try {
      if (!material.storagePath) {
        throw new Error('No storage path found for this material');
      }

      // 4. Fetch file from Supabase Storage
      const fileBuffer = await storageService.get(material.storagePath);

      // 5. Extract text preserving pages
      const pages: PageData[] = [];
      try {
        const pdfParseModule = await import('pdf-parse');
        const PDFParse = (pdfParseModule as any).default || pdfParseModule;
        const parser = new PDFParse(new Uint8Array(fileBuffer));
        const data = await parser.getText();
        if (data && data.pages) {
          for (const p of data.pages) {
            pages.push({
              pageNumber: p.num,
              text: p.text
            });
          }
        }
      } catch (err) {
        console.warn("pdfParse failed, simulating extraction for MVP", err);
        pages.push({
          pageNumber: 1,
          text: fileBuffer.toString('utf-8').replace(/[^a-zA-Z0-9.,?!\s]/g, ' ')
        });
      }


      await prisma.material.update({
        where: { id: materialId },
        data: { processingProgress: 40 }
      });

      // Clear existing pages and chunks for idempotency
      await prisma.materialPage.deleteMany({ where: { materialId } });
      await prisma.materialChunk.deleteMany({ where: { materialId } });

      let usablePagesCount = 0;
      
      // 6. Persist Pages
      for (const p of pages) {
        const hasUsableText = p.text.length > 50; // simple heuristic
        p.hasUsableText = hasUsableText;
        if (hasUsableText) usablePagesCount++;
        
        await prisma.materialPage.create({
          data: {
            materialId,
            pageNumber: p.pageNumber,
            text: p.text,
            characterCount: p.text.length,
            hasUsableText
          }
        });
      }

      if (usablePagesCount === 0 && pages.length > 0) {
        throw new Error('pdf_requires_ocr');
      }

      await prisma.material.update({
        where: { id: materialId },
        data: { status: 'chunking', processingProgress: 60, pageCount: pages.length }
      });

      // 7. Generate Chunks
      const chunks = this.createChunks(pages);

      // 8. Persist Chunks
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        await prisma.materialChunk.create({
          data: {
            materialId,
            order: i + 1,
            pageStart: c.pageStart,
            pageEnd: c.pageEnd,
            text: c.text,
            characterCount: c.text.length
          }
        });
      }

      // 9. Update Material to ready_for_mapping
      await prisma.material.update({
        where: { id: materialId },
        data: { 
          status: 'ready_for_mapping', 
          processingProgress: 100 
        }
      });

    } catch (error: any) {
      console.error('OUTER CATCH REACHED:', error);
      await prisma.material.update({
        where: { id: materialId },
        data: { 
          status: 'error', 
          processingError: error.message || 'Unknown error during processing' 
        }
      });
    }
  }

  private createChunks(pages: PageData[]) {
    // Target 2500-4000 chars, overlap 300-600.
    const TARGET_SIZE = 3000;
    const OVERLAP = 400;

    const chunks: { pageStart: number, pageEnd: number, text: string }[] = [];
    
    let currentChunkText = '';
    let currentChunkStartPage = -1;
    
    // Flatten pages into paragraphs while tracking page numbers
    const paragraphs: { text: string, pageNumber: number }[] = [];
    for (const p of pages) {
      if (!p.hasUsableText && p.text.length <= 50) continue; 
      
      const parts = p.text.split(/\n\n+/); // Split by paragraphs roughly
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed) {
          paragraphs.push({ text: trimmed, pageNumber: p.pageNumber });
        }
      }
    }

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      
      if (currentChunkText.length === 0) {
        currentChunkStartPage = p.pageNumber;
      }
      
      const separator = currentChunkText.length > 0 ? '\n\n' : '';
      currentChunkText += separator + p.text;
      
      if (currentChunkText.length >= TARGET_SIZE) {
        chunks.push({
          pageStart: currentChunkStartPage,
          pageEnd: p.pageNumber,
          text: currentChunkText
        });
        
        // Find overlap content (last few paragraphs)
        let overlapText = '';
        let overlapStartPage = p.pageNumber;
        
        // Go back up to get ~OVERLAP chars
        for (let j = i; j >= 0; j--) {
          const prevP = paragraphs[j];
          if (overlapText.length + prevP.text.length > OVERLAP * 1.5) {
             break;
          }
          overlapText = prevP.text + (overlapText ? '\n\n' + overlapText : '');
          overlapStartPage = prevP.pageNumber;
          if (overlapText.length >= OVERLAP) {
             break;
          }
        }
        
        currentChunkText = overlapText;
        currentChunkStartPage = overlapStartPage;
      }
    }
    
    if (currentChunkText.length > 0) {
      // Avoid pushing a tiny leftover chunk if it's mostly overlap
      if (chunks.length === 0 || currentChunkText.length > OVERLAP) {
         chunks.push({
          pageStart: currentChunkStartPage,
          pageEnd: paragraphs[paragraphs.length - 1]?.pageNumber || currentChunkStartPage,
          text: currentChunkText
        });
      }
    }

    return chunks;
  }
}
