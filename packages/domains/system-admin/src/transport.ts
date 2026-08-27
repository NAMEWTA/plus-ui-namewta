import type { OpenApiSchema } from '@namewta/api-contracts';
import type { UserSummary } from '../public/user/index';

export type SystemUserTransport = OpenApiSchema<'SysUserVo'>;

export function projectSystemUserTransport(value: SystemUserTransport): UserSummary {
  return {
    userId: value.userId ?? '',
    userName: value.userName,
    nickName: value.nickName ?? '',
    deptName: value.deptName,
    status: value.status
  };
}
