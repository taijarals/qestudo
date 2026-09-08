import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FileStorageService } from './FileStorageService';

export class SupabaseFileStorageService implements FileStorageService {
  private supabase: SupabaseClient | null = null;
  private bucket = 'qestudo-materials';

  private getClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided.');
      }
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    return this.supabase;
  }

  async save(buffer: Buffer, path: string, mimeType: string): Promise<string> {
    const { data, error } = await this.getClient().storage
      .from(this.bucket)
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    return data.path;
  }

  async get(path: string): Promise<Buffer> {
    const { data, error } = await this.getClient().storage
      .from(this.bucket)
      .download(path);
      
    if (error) throw error;
    return Buffer.from(await data.arrayBuffer());
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.getClient().storage
      .from(this.bucket)
      .remove([path]);

    if (error) throw error;
  }
}
