import { createOperationsService } from '@namewta/domain-operations';
import request from '@/utils/request';
export const operationsService = createOperationsService({ request: config => request(config) });
