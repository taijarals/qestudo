import { ApiMaterialService } from './api/ApiMaterialService';
import { ApiStudyService } from './api/ApiStudyService';
import { ApiPerformanceService } from './api/ApiPerformanceService';

export const materialService = new ApiMaterialService();
export const studyService = new ApiStudyService();
export const performanceService = new ApiPerformanceService();

export * from './MaterialService';
export * from './StudyService';
export * from './PerformanceService';