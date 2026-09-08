import { ENV } from '../../config/env';
import { ConceptPerformance, ErrorRecord } from '../../types';

export class ApiPerformanceService {
  async getPerformanceData(): Promise<ConceptPerformance[]> {
    // We don't have a direct endpoint for performance yet. Returning empty or fetching masteries.
    return [];
  }

  async getErrorRecords(): Promise<ErrorRecord[]> {
    return [];
  }
}
