import type { OpenApiSchema } from '@namewta/api-contracts';
import type { OperLogVO } from './types';

export type OperationLogTransport = OpenApiSchema<'SysOperLogVo'>;
export type OperationLogContractView = Pick<
  OperLogVO,
  'businessType' | 'costTime' | 'operId' | 'operName' | 'operTime' | 'requestMethod' | 'status' | 'title'
>;

export function projectOperationLogTransport(value: OperationLogTransport): OperationLogContractView {
  return {
    operId: value.operId ?? '',
    title: value.title ?? '',
    businessType: value.businessType ?? 0,
    requestMethod: value.requestMethod ?? '',
    operName: value.operName ?? '',
    status: value.status ?? 0,
    operTime: value.operTime ?? '',
    costTime: value.costTime ?? 0
  };
}
