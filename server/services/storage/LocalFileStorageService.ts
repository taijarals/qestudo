import { FileStorageService } from './FileStorageService';
import fs from 'fs';
import path from 'path';

export class LocalFileStorageService implements FileStorageService {
  private baseDir: string;

  constructor(baseDir = 'uploads') {
    this.baseDir = path.resolve(process.cwd(), baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async save(buffer: Buffer, pathName: string, mimeType: string): Promise<string> {
    const fullPath = path.join(this.baseDir, pathName);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, buffer);
    return fullPath;
  }

  async get(pathName: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, pathName);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${pathName}`);
    }
    return fs.readFileSync(fullPath);
  }

  async delete(pathName: string): Promise<void> {
    const fullPath = path.join(this.baseDir, pathName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async getSignedUrl(pathName: string, expiresIn?: number): Promise<string> {
    return `/uploads/${pathName}`;
  }
}
