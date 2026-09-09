export function getGeminiModel(): string { 
  let model = process.env.GEMINI_MODEL;
  
  if (!model) {
    return 'gemini-2.5-flash';
  }
  
  model = model.trim();
  
  if (model.startsWith('"') && model.endsWith('"')) {
    model = model.slice(1, -1).trim();
  }
  if (model.startsWith("'") && model.endsWith("'")) {
    model = model.slice(1, -1).trim();
  }
  
  if (model.includes('=')) {
    throw new Error('GEMINI_MODEL deve conter apenas o nome do modelo, sem "=" (ex: gemini-2.5-flash).');
  }

  // Detect if the user accidentally put an API key instead of a model name
  if (model.startsWith('AIza') || model.startsWith('AQ.')) {
     throw new Error('Você parece ter configurado uma chave de API no secret GEMINI_MODEL. Ele deve conter apenas o nome do modelo (ex: gemini-2.5-flash).');
  }
  
  // Safe debug log for model name format issues (no API keys logged)
  console.log('[gemini_model]', JSON.stringify(model));
  return model;
}
