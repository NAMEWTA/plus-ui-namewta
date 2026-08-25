import {
  createWorkflowDefinitionService,
  type FlowDefinitionForm,
  type FlowDefinitionQuery
} from '@namewta/domain-workflow';
import request from '@/utils/request';

const service = createWorkflowDefinitionService({ request: config => request(config) });

export const listDefinition = (query: FlowDefinitionQuery) => service.listDefinitions(query);
export const unPublishList = (query: FlowDefinitionQuery) => service.listUnpublishedDefinitions(query);
/** @deprecated The current backend has no matching controller; retained for legacy callers until T-15. */
export const definitionXml = (definitionId: string) => service.legacyDefinitionXml(definitionId);
export const deleteDefinition = (id: string | string[]) => service.deleteDefinition(id);
export const active = (definitionId: string, activityStatus: boolean) =>
  service.setDefinitionActive(definitionId, activityStatus);
export const importDef = (data: unknown) => service.importDefinition(data);
export const publish = (id: string) => service.publishDefinition(id);
export const unPublish = (id: string) => service.unpublishDefinition(id);
export const xmlString = (id: string) => service.getDefinitionXmlString(id);
export const add = (data: FlowDefinitionForm) => service.addDefinition(data);
export const edit = (data: FlowDefinitionForm) => service.updateDefinition(data);
export const getInfo = (id: number | string) => service.getDefinition(id);
export const copy = (id: string) => service.copyDefinition(id);
