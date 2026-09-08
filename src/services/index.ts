import { ENV } from '../config/env';
import { MaterialService as MockMaterialService } from './MaterialService';
import { StudyService as MockStudyService } from './StudyService';
import { PerformanceService as MockPerformanceService } from './PerformanceService';

import { ApiMaterialService } from './api/ApiMaterialService';
import { ApiStudyService } from './api/ApiStudyService';
import { ApiPerformanceService } from './api/ApiPerformanceService';

export const materialService = ENV.USE_API ? new ApiMaterialService() : new MockMaterialService();
export const studyService = ENV.USE_API ? new ApiStudyService() : new MockStudyService();
export const performanceService = ENV.USE_API ? new ApiPerformanceService() : new MockPerformanceService();

export * from './MaterialService';
export * from './StudyService';
export * from './PerformanceService';

