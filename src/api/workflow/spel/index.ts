import { createWorkflowDefinitionService, type SpelForm, type SpelQuery } from '@namewta/domain-workflow';
import request from '@/utils/request';

const service = createWorkflowDefinitionService({ request: config => request(config) });

export const listSpel = (query?: SpelQuery) => service.listSpel(query);
export const getSpel = (id: string | number) => service.getSpel(id);
export const addSpel = (data: SpelForm) => service.addSpel(data);
export const updateSpel = (data: SpelForm) => service.updateSpel(data);
export const delSpel = (id: string | number | Array<string | number>) => service.deleteSpel(id);
