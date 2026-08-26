import type { OperLogQuery } from './types';
import { operationsService } from '../runtime';
export const list = (query: OperLogQuery) => operationsService.operationLogs.list(query);
export const delOperlog = (ids: string | number | Array<string | number>) =>
  operationsService.operationLogs.delete(ids);
export const cleanOperlog = () => operationsService.operationLogs.clean();
