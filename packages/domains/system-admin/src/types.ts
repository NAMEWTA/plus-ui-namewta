export interface BaseEntity {
  createBy?: string;
  createDept?: string | number;
  createTime?: string;
  params?: Record<string, unknown>;
  remark?: string;
  updateBy?: string;
  updateTime?: string;
}

export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
  orderByColumn?: string;
  isAsc?: string;
  params?: Record<string, unknown>;
}
