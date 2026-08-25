import { createDemoService } from '@namewta/domain-demo';
import request from '@/utils/request';

const service = createDemoService(request);

export const listTree = service.listTree;
export const getTree = service.getTree;
export const addTree = service.addTree;
export const updateTree = service.updateTree;
export const delTree = service.deleteTree;
