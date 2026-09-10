import { ConceptMappingService } from '../services/ConceptMappingService';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MaterialService } from '../services/MaterialService';
import { storageService } from '../services/storage';
import { PdfProcessingService } from '../services/PdfProcessingService';
import { prisma } from '../database/prisma';


import { MaterialDeletionService } from '../services/MaterialDeletionService';

export const materialController = {
  delete: async (req: Request, res: Response) => {
    try {
      const deletionService = new MaterialDeletionService();
      const result = await deletionService.deleteMaterial(req.params.id as string);
      res.json(result);
    } catch (e: any) {
      if (e.message === 'not_found') return res.status(404).json({ error: 'not_found' });
      res.status(500).json({ error: e.message });
    }
  },
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
          title: Buffer.from(file.originalname, 'latin1').toString('utf8').replace(/\.pdf$/i, ''),
          description: '',
          fileName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
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
  
  
  mapConcepts: async (req: Request, res: Response) => {
    try {
      const mapper = new ConceptMappingService();
      mapper.mapConcepts(req.params.id as string).catch(console.error);
      res.json({ message: 'Mapping started' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  process: async (req: Request, res: Response) => {
    try {
      const processor = new PdfProcessingService();
      // Start processing asynchronously in background to not block the request
      processor.processMaterial(req.params.id as string).catch(console.error);
      res.json({ message: 'Processing started' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getProcessingStatus: async (req: Request, res: Response) => {
    try {
      const data = await prisma.material.findUnique({
        where: { id: req.params.id as string },
        select: { status: true, processingProgress: true, processingError: true, pageCount: true }
      });
      if (!data) return res.status(404).json({ error: 'Not found' });
      
      const chunkCount = await prisma.materialChunk.count({ where: { materialId: req.params.id as string } });
      res.json({ ...data, chunkCount });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getPages: async (req: Request, res: Response) => {
    try {
      const data = await prisma.materialPage.findMany({
        where: { materialId: req.params.id as string },
        orderBy: { pageNumber: 'asc' }
      });
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getChunks: async (req: Request, res: Response) => {
    try {
      const data = await prisma.materialChunk.findMany({
        where: { materialId: req.params.id as string },
        orderBy: { order: 'asc' }
      });
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
      const concepts = await prisma.concept.findMany({
        where: { materialId: req.params.id as string }
      });
      res.json(concepts);
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
