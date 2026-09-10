const fs = require('fs');
let code = fs.readFileSync('server/services/ai/GeminiClient.ts', 'utf-8');

code = code.replace(
  /export class GeminiClient \{\s*private ai: GoogleGenAI;\s*constructor\(\) \{\s*this\.ai = new GoogleGenAI\(\{ apiKey: process\.env\.GEMINI_API_KEY \}\);\s*\}/,
  `export class GeminiClient {
  private _ai?: GoogleGenAI;
  private get ai(): GoogleGenAI {
    if (!this._ai) {
      this._ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return this._ai;
  }`
);

fs.writeFileSync('server/services/ai/GeminiClient.ts', code);
