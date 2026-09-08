import { mockPerformance, mockErrors } from '../mocks/data';
import { ConceptPerformance, ErrorRecord } from '../types';

// For now, PerformanceService wraps the types directly as there isn't a complex repo yet.
export class PerformanceService {
  async getPerformanceData(): Promise<ConceptPerformance[]> {
    return [...mockPerformance];
  }

  async getErrorRecords(): Promise<ErrorRecord[]> {
    return [...mockErrors];
  }
}

export const performanceService = new PerformanceService();
