import type { DomainModule } from '@namewta/platform-app-runtime';
import type { HttpClient } from '@namewta/platform-contracts';

export interface ApiResponse<T = unknown> {
  code?: number;
  data?: T;
  msg?: string;
}
export interface PageResult<T> {
  rows: T[];
  total: number;
}
export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
}
export interface BaseEntity {
  createBy?: string;
  createTime?: string;
  params?: Record<string, unknown>;
  remark?: string;
  updateBy?: string;
  updateTime?: string;
}
export interface CategoryTreeVO {
  children: CategoryTreeVO[];
  id: number | string;
  label: string;
  parentId: number | string;
  weight: number;
}
export interface CategoryVO {
  categoryId: string | number;
  categoryName: string;
  children: CategoryVO[];
  createTime: string;
  orderNum: number;
  parentId: string | number;
}
export interface CategoryForm extends BaseEntity {
  categoryId?: string | number;
  categoryName?: string;
  orderNum?: number;
  parentId?: string | number;
}
export interface CategoryQuery {
  categoryName?: string;
}
export interface FlowDefinitionQuery extends PageQuery {
  category: string | number;
  flowCode?: string;
  flowName?: string;
  isPublish?: number;
}
export interface FlowDefinitionVO {
  activityStatus: number;
  createTime: Date;
  flowCode: string;
  flowName: string;
  formPath: string;
  id: string;
  isPublish: number;
  updateTime: Date;
  version: string;
}
export interface FlowDefinitionForm {
  category: string;
  ext: string;
  flowCode: string;
  flowName: string;
  formCustom: string;
  formPath: string;
  id: string;
  modelValue: string;
}
export interface DefinitionXmlVO {
  xml: string[];
  xmlStr: string;
}
export interface SpelVO {
  componentName: string;
  id: string | number;
  methodName: string;
  methodParams: string;
  remark?: string;
  status: string;
  viewSpel: string;
}
export interface SpelForm extends BaseEntity {
  componentName?: string;
  id?: string | number;
  methodName?: string;
  methodParams?: string;
  status?: string;
  viewSpel?: string;
}
export interface SpelQuery extends PageQuery {
  componentName?: string;
  methodName?: string;
  methodParams?: string;
  params?: Record<string, unknown>;
  status?: string;
  viewSpel?: string;
}

type Identifier = string | number;
type IdentifierList = Identifier | readonly Identifier[];
const segment = (value: IdentifierList) =>
  (Array.isArray(value) ? value : [value]).map(item => encodeURIComponent(String(item))).join(',');

export interface WorkflowDefinitionService {
  addCategory(data: CategoryForm): Promise<ApiResponse>;
  addDefinition(data: FlowDefinitionForm | Record<string, unknown>): Promise<ApiResponse>;
  addSpel(data: SpelForm | Record<string, unknown>): Promise<ApiResponse>;
  categoryTree(query?: CategoryForm): Promise<ApiResponse<CategoryTreeVO[]>>;
  copyDefinition(id: string): Promise<ApiResponse>;
  deleteCategory(id: IdentifierList): Promise<ApiResponse>;
  deleteDefinition(id: string | readonly string[]): Promise<ApiResponse>;
  deleteSpel(id: IdentifierList): Promise<ApiResponse>;
  getCategory(id: Identifier): Promise<ApiResponse<CategoryVO>>;
  getDefinition(id: Identifier): Promise<ApiResponse<FlowDefinitionVO>>;
  getDefinitionXmlString(id: string): Promise<ApiResponse<string>>;
  getSpel(id: Identifier): Promise<ApiResponse<SpelVO>>;
  importDefinition(data: unknown): Promise<ApiResponse>;
  legacyDefinitionXml(id: string): Promise<ApiResponse<DefinitionXmlVO>>;
  listCategories(query?: CategoryQuery): Promise<ApiResponse<CategoryVO[]>>;
  listDefinitions(query: FlowDefinitionQuery): Promise<ApiResponse<PageResult<FlowDefinitionVO>>>;
  listSpel(query?: SpelQuery): Promise<ApiResponse<PageResult<SpelVO>>>;
  listUnpublishedDefinitions(query: FlowDefinitionQuery): Promise<ApiResponse<PageResult<FlowDefinitionVO>>>;
  publishDefinition(id: string): Promise<ApiResponse>;
  setDefinitionActive(id: string, active: boolean): Promise<ApiResponse>;
  unpublishDefinition(id: string): Promise<ApiResponse>;
  updateCategory(data: CategoryForm): Promise<ApiResponse>;
  updateDefinition(data: FlowDefinitionForm | Record<string, unknown>): Promise<ApiResponse>;
  updateSpel(data: SpelForm | Record<string, unknown>): Promise<ApiResponse>;
}

export const workflowDomainModule: DomainModule = Object.freeze({
  id: 'workflow',
  backendModules: Object.freeze(['ruoyi-workflow']),
  capabilities: Object.freeze(['category-admin', 'definition-admin', 'definition-design', 'spel-admin'])
});

export function createWorkflowDefinitionService(http: HttpClient): WorkflowDefinitionService {
  const request = <T = unknown>(config: Parameters<HttpClient['request']>[0]) => http.request<ApiResponse<T>>(config);
  return Object.freeze({
    listCategories: query => request<CategoryVO[]>({ url: '/workflow/category/list', method: 'get', params: query }),
    getCategory: id => request<CategoryVO>({ url: '/workflow/category/' + segment(id), method: 'get' }),
    addCategory: data => request({ url: '/workflow/category', method: 'post', data }),
    updateCategory: data => request({ url: '/workflow/category', method: 'put', data }),
    deleteCategory: id => request({ url: '/workflow/category/' + segment(id), method: 'delete' }),
    categoryTree: query =>
      request<CategoryTreeVO[]>({ url: '/workflow/category/categoryTree', method: 'get', params: query }),
    listDefinitions: query =>
      request<PageResult<FlowDefinitionVO>>({ url: '/workflow/definition/list', method: 'get', params: query }),
    listUnpublishedDefinitions: query =>
      request<PageResult<FlowDefinitionVO>>({
        url: '/workflow/definition/unPublishList',
        method: 'get',
        params: query
      }),
    legacyDefinitionXml: id =>
      request<DefinitionXmlVO>({ url: '/workflow/definition/definitionXml/' + segment(id), method: 'get' }),
    deleteDefinition: id => request({ url: '/workflow/definition/' + segment(id), method: 'delete' }),
    setDefinitionActive: (id, active) =>
      request({ url: '/workflow/definition/active/' + segment(id), method: 'put', params: { active } }),
    importDefinition: data =>
      request({ url: '/workflow/definition/importDef', method: 'post', data, headers: { repeatSubmit: false } }),
    publishDefinition: id => request({ url: '/workflow/definition/publish/' + segment(id), method: 'put' }),
    unpublishDefinition: id => request({ url: '/workflow/definition/unPublish/' + segment(id), method: 'put' }),
    getDefinitionXmlString: id =>
      request<string>({ url: '/workflow/definition/xmlString/' + segment(id), method: 'get' }),
    addDefinition: data => request({ url: '/workflow/definition', method: 'post', data }),
    updateDefinition: data => request({ url: '/workflow/definition', method: 'put', data }),
    getDefinition: id => request<FlowDefinitionVO>({ url: '/workflow/definition/' + segment(id), method: 'get' }),
    copyDefinition: id => request({ url: '/workflow/definition/copy/' + segment(id), method: 'post' }),
    listSpel: query => request<PageResult<SpelVO>>({ url: '/workflow/spel/list', method: 'get', params: query }),
    getSpel: id => request<SpelVO>({ url: '/workflow/spel/' + segment(id), method: 'get' }),
    addSpel: data => request({ url: '/workflow/spel', method: 'post', data }),
    updateSpel: data => request({ url: '/workflow/spel', method: 'put', data }),
    deleteSpel: id => request({ url: '/workflow/spel/' + segment(id), method: 'delete' })
  });
}
