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

const projectUser = (value: unknown): UserSummary => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    userId: source.userId as string | number,
    userName: typeof source.userName === 'string' ? source.userName : undefined,
    nickName: typeof source.nickName === 'string' ? source.nickName : '',
    deptName: typeof source.deptName === 'string' ? source.deptName : undefined,
    status: typeof source.status === 'string' ? source.status : undefined
  };
};

export function createUserQueryPort(http: HttpClient): UserQueryPort {
  return Object.freeze({
    list: async query => {
      const response = await http.request<UserQueryResponse<UserPage>>({
        url: '/system/user/list',
        method: 'get',
        params: query
      });
      return { ...response, data: { ...response.data, rows: response.data.rows.map(projectUser) } };
    },
    options: async userIds => {
      const response = await http.request<UserQueryResponse<UserSummary[]>>({
        url: '/system/user/optionselect?userIds=' + identifiers(userIds),
        method: 'get'
      });
      return { ...response, data: response.data.map(projectUser) };
    },
    departmentTree: () =>
      http.request<UserQueryResponse<DepartmentSummary[]>>({ url: '/system/user/deptTree', method: 'get' })
  });
}
