import type {
  DbColumnForm as DomainDbColumnForm,
  DbColumnVO as DomainDbColumnVO,
  DbParamForm as DomainDbParamForm,
  DbTableForm as DomainDbTableForm,
  DbTableVO as DomainDbTableVO,
  TableVO as DomainTableVO
} from '@namewta/domain-devtools';

export * from '@namewta/domain-devtools';

// Preserve the pre-migration loose type surface until the legacy tool facade is removed in T-15.
type LegacyLooseValue = any;

export interface TableVO extends DomainTableVO {
  createDept: number | string;
  pkColumn?: LegacyLooseValue;
  columns?: LegacyLooseValue;
  options?: LegacyLooseValue;
  remark?: LegacyLooseValue;
  treeCode?: LegacyLooseValue;
  treeParentCode?: LegacyLooseValue;
  treeName?: LegacyLooseValue;
  menuIds?: LegacyLooseValue;
  parentMenuId?: LegacyLooseValue;
  parentMenuName?: LegacyLooseValue;
}

export interface DbColumnVO extends DomainDbColumnVO {
  createDept?: LegacyLooseValue;
  columnId?: LegacyLooseValue;
  tableId?: LegacyLooseValue;
  columnName?: LegacyLooseValue;
  columnComment?: LegacyLooseValue;
  columnType?: LegacyLooseValue;
  javaType?: LegacyLooseValue;
  javaField?: LegacyLooseValue;
  isPk?: LegacyLooseValue;
  isIncrement?: LegacyLooseValue;
  isRequired?: LegacyLooseValue;
  isInsert?: LegacyLooseValue;
  isEdit?: LegacyLooseValue;
  isList?: LegacyLooseValue;
  isQuery?: LegacyLooseValue;
  queryType?: LegacyLooseValue;
  htmlType?: LegacyLooseValue;
  dictType?: LegacyLooseValue;
  sort?: LegacyLooseValue;
  increment: boolean;
  capJavaField?: LegacyLooseValue;
  usableColumn: boolean;
  superColumn: boolean;
  list: boolean;
  pk: boolean;
  insert: boolean;
  edit: boolean;
  query: boolean;
  required: boolean;
}

export interface DbTableVO extends DomainDbTableVO {
  createDept?: LegacyLooseValue;
  tableId?: LegacyLooseValue;
  className?: LegacyLooseValue;
  tplCategory?: LegacyLooseValue;
  packageName?: LegacyLooseValue;
  moduleName?: LegacyLooseValue;
  businessName?: LegacyLooseValue;
  functionName?: LegacyLooseValue;
  functionAuthor?: LegacyLooseValue;
  pkColumn?: LegacyLooseValue;
  columns: DbColumnVO[];
  options?: LegacyLooseValue;
  remark?: LegacyLooseValue;
  treeCode?: LegacyLooseValue;
  treeParentCode?: LegacyLooseValue;
  treeName?: LegacyLooseValue;
  menuIds?: LegacyLooseValue;
  parentMenuId?: LegacyLooseValue;
  parentMenuName?: LegacyLooseValue;
}

export interface GenTableDetailPayload {
  info: DbTableVO;
  rows: DbColumnVO[];
}

export interface DbColumnForm extends DomainDbColumnForm {
  isInsert?: LegacyLooseValue;
  isQuery?: LegacyLooseValue;
}

export interface DbParamForm extends DomainDbParamForm {
  treeCode?: LegacyLooseValue;
  treeName?: LegacyLooseValue;
  treeParentCode?: LegacyLooseValue;
  parentMenuId: string;
  treeAncestorsField?: string;
}

export interface DbTableForm extends DomainDbTableForm {
  createDept?: LegacyLooseValue;
  tableId: string;
  pkColumn?: LegacyLooseValue;
  columns: DbColumnForm[];
  options: string;
  remark?: LegacyLooseValue;
  treeCode?: LegacyLooseValue;
  treeParentCode?: LegacyLooseValue;
  treeName?: LegacyLooseValue;
  menuIds?: LegacyLooseValue;
  parentMenuId: string;
  parentMenuName?: LegacyLooseValue;
  params: DbParamForm;
}
