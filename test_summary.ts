import { aiUsageController } from './server/controllers/aiUsage';

async function run() {
  const req = { query: { period: 'today' } } as any;
  const res = {
    json: (data: any) => console.log(JSON.stringify(data, null, 2)),
    status: (code: number) => ({ json: (data: any) => console.log(code, data) })
  } as any;
  
  await aiUsageController.getSummary(req, res);
}

run().catch(console.error).finally(() => process.exit(0));
