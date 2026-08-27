import { createDemoService } from '@namewta/domain-demo';
import request from '@/utils/request';

const service = createDemoService(request);

export const listDemo = service.listDemo;
export const getDemo = service.getDemo;
export const addDemo = service.addDemo;
export const updateDemo = service.updateDemo;
export const delDemo = service.deleteDemo;
