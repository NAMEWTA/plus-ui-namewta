import type { OpenApiSchema } from '@namewta/api-contracts';
import type { OperLogVO } from './types';

export type OperationLogTransport = OpenApiSchema<'SysOperLogVo'>;

export function projectOperationLogTransport(value: OperationLogTransport): OperLogVO {
  const domainFields = value as unknown as Partial<OperLogVO>;
  return {
    ...(value as unknown as OperLogVO),
    operId: value.operId ?? '',
    tenantId: domainFields.tenantId ?? '',
    title: value.title ?? '',
    businessType: value.businessType ?? 0,
    businessTypes: value.businessTypes,
    method: value.method ?? '',
    requestMethod: value.requestMethod ?? '',
    operatorType: value.operatorType ?? 0,
    operName: value.operName ?? '',
    userId: value.userId ?? '',
    deptId: value.deptId ?? '',
    deptName: value.deptName ?? '',
    clientKey: value.clientKey ?? '',
    deviceType: value.deviceType ?? '',
    browser: value.browser ?? '',
    os: value.os ?? '',
    operUrl: value.operUrl ?? '',
    operIp: value.operIp ?? '',
    operLocation: value.operLocation ?? '',
    operParam: value.operParam ?? '',
    jsonResult: value.jsonResult ?? '',
    status: value.status ?? 0,
    errorMsg: value.errorMsg ?? '',
    operTime: value.operTime ?? '',
    costTime: value.costTime ?? 0
  };
}
