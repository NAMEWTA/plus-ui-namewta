import type { PublicDictType } from '@namewta/domain-system/dict-type';
import type { PublicMenuOption } from '@namewta/domain-system/menu';

export type GenDictType = PublicDictType;
export type GenMenuOption = PublicMenuOption;

export type Identifier = string | number;
export interface ApiResponse<T = unknown> {
  code: number;
  msg?: string;
  data: T;
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
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface TableVO extends BaseEntity {
  tableId: Identifier;
  dataName: string;
  tableName: string;
  tableComment: string;
  className: string;
  tplCategory: string;
  frontendType: string;
  packageName: string;
  moduleName: string;
  businessName: string;
  functionName: string;
  functionAuthor: string;
  columns?: DbColumnVO[];
  parentMenuId?: Identifier;
  enableExport?: boolean;
  enableStatus?: boolean;
  statusField?: string;
  enableUnique?: boolean;
  uniqueFields?: string[];
  enableSort?: boolean;
  sortField?: string;
  treeRootValue?: string;
  treeAncestorsField?: string;
  treeOrderField?: string;
  treeCode?: string;
  treeParentCode?: string;
  treeName?: string;
  tree: boolean;
  crud: boolean;
  [key: string]: unknown;
}
export interface TableQuery extends PageQuery {
  tableName: string;
  tableComment: string;
  dataName: string;
  params?: { beginTime?: string; endTime?: string };
}
export interface DbTableQuery extends TableQuery {}
export interface DbColumnVO extends BaseEntity {
  columnId?: Identifier;
  tableId?: Identifier;
  columnName?: string;
  columnComment?: string;
  columnType?: string;
  javaType?: string;
  javaField?: string;
  isInsert?: string;
  isEdit?: string;
  isList?: string;
  isQuery?: string;
  isRequired?: string;
  queryType?: string;
  htmlType?: string;
  dictType?: string;
  sort?: number;
  [key: string]: unknown;
}
export interface DbColumnForm extends BaseEntity {
  createDept: number;
  columnId: string;
  tableId: string;
  columnName: string;
  columnComment: string;
  columnType: string;
  javaType: string;
  javaField: string;
  isPk: string;
  isIncrement: string;
  isRequired: string;
  isInsert?: string;
  isEdit: string;
  isList: string;
  isQuery?: string;
  queryType: string;
  htmlType: string;
  dictType: string;
  sort: number;
  increment: boolean;
  capJavaField: string;
  usableColumn: boolean;
  superColumn: boolean;
  list: boolean;
  pk: boolean;
  insert: boolean;
  edit: boolean;
  query: boolean;
  required: boolean;
}
export interface DbTableVO extends Partial<TableVO> {
  tableName: string;
  tableComment: string;
  columns: DbColumnVO[];
  tree: boolean;
  crud: boolean;
}
export interface GenTableDetailPayload {
  info: DbTableVO;
  rows: DbColumnVO[];
}
export interface DbParamForm {
  treeCode?: string;
  treeName?: string;
  treeParentCode?: string;
  parentMenuId?: Identifier;
  enableExport?: boolean;
  enableStatus?: boolean;
  statusField?: string;
  enableUnique?: boolean;
  uniqueFields?: string[];
  enableSort?: boolean;
  sortField?: string;
  treeRootValue?: string;
  treeAncestors?: string;
  treeOrderField?: string;
}
export interface DbTableForm extends Omit<DbTableVO, 'columns'> {
  columns: DbColumnForm[];
  params: DbParamForm;
  options?: string;
}
export interface ImportTableInput {
  tables: string;
  dataName: string;
}
export interface DownloadIntent {
  url: string;
  fileName: string;
}
export interface GenMetadata {
  dictTypes(clientId?: Identifier): Promise<PublicDictType[]>;
  menus(clientId?: Identifier): Promise<PublicMenuOption[]>;
}
