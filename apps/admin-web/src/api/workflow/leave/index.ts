import type { LeaveForm, LeaveQuery } from './types';
import { workflowService } from '../runtime';

export const listLeave = (query?: LeaveQuery) => workflowService.listLeaves(query);
export const getLeave = (id: string | number) => workflowService.getLeave(id);
export const addLeave = (data: LeaveForm) => workflowService.addLeave(data);
export const submitAndFlowStart = (data: LeaveForm) => workflowService.submitLeave(data);
export const updateLeave = (data: LeaveForm) => workflowService.updateLeave(data);
export const delLeave = (id: string | number | readonly (string | number)[]) => workflowService.deleteLeaves(id);
