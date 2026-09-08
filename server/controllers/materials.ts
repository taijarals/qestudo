import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MaterialService } from '../services/MaterialService';
import { storageService } from '../services/storage';

export const materialController = {
  upload: async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }
      if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
        return res.status(400).json({ error: 'Apenas arquivos PDF são permitidos.' });
      }

      const materialId = uuidv4();
      const fileId = uuidv4();
      const storagePath = `materials/${materialId}/${fileId}.pdf`;

      // Upload para o Supabase Storage
      await storageService.save(file.buffer, storagePath, file.mimetype);

      try {
        const newMaterial = await MaterialService.create({
          id: materialId,
          title: file.originalname.replace(/\.pdf$/i, ''),
          description: '',
          fileName: file.originalname,
          storagePath: storagePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          status: 'uploaded',
          uploadedAt: new Date()
        });

        res.status(201).json(newMaterial);
      } catch (dbError: any) {
        // Rollback Storage se o DB falhar
        await storageService.delete(storagePath).catch(console.error);
        throw dbError;
      }

    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getAll: async (req: Request, res: Response) => {
    try {
      const data = await MaterialService.getAll();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const data = await MaterialService.getById(req.params.id as string);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getConcepts: async (req: Request, res: Response) => {
    try {
      const data = await MaterialService.getConcepts(req.params.id as string);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getQuestions: async (req: Request, res: Response) => {
    try {
      const data = await MaterialService.getQuestions(req.params.id as string);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
