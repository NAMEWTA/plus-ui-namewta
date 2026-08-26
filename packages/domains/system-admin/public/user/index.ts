import type { HttpClient } from '@namewta/platform-contracts';

export interface UserSummary {
  deptName?: string;
  nickName: string;
  status?: string;
  userId: string | number;
  userName?: string;
}

export interface UserQuery {
  createTime?: readonly string[];
  deptId?: string | number;
  pageNum?: number;
  pageSize?: number;
  phoneNumber?: string;
  status?: string;
  userIds?: string | number | readonly (string | number)[];
  userName?: string;
}

export interface DepartmentSummary {
  children?: readonly DepartmentSummary[];
  disabled?: boolean;
  id: string | number;
  label: string;
}

export interface UserPage {
  rows: UserSummary[];
  total: number;
}

export interface UserQueryResponse<T> {
  code?: number;
  data: T;
  msg?: string;
}

export interface UserQueryPort {
  departmentTree(): Promise<UserQueryResponse<DepartmentSummary[]>>;
  list(query: UserQuery): Promise<UserQueryResponse<UserPage>>;
  options(userIds: readonly (string | number)[]): Promise<UserQueryResponse<UserSummary[]>>;
}

const identifiers = (values: readonly (string | number)[]) =>
  values.map(value => encodeURIComponent(String(value))).join(',');

export function createUserQueryPort(http: HttpClient): UserQueryPort {
  return Object.freeze({
    list: query =>
      http.request<UserQueryResponse<UserPage>>({ url: '/system/user/list', method: 'get', params: query }),
    options: userIds =>
      http.request<UserQueryResponse<UserSummary[]>>({
        url: '/system/user/optionselect?userIds=' + identifiers(userIds),
        method: 'get'
      }),
    departmentTree: () =>
      http.request<UserQueryResponse<DepartmentSummary[]>>({ url: '/system/user/deptTree', method: 'get' })
  });
}
