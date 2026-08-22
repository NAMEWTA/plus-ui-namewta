export interface NotifyQuery extends PageQuery {
  requestId?: string;
  originalRequestId?: string;
  bizType?: string;
  bizId?: string;
  channel?: string;
  providerKey?: string;
  status?: string;
  providerMessageId?: string;
  traceId?: string;
  clientPk?: string;
  beginTime?: string;
  endTime?: string;
}

export interface NotifyListVO extends BaseEntity {
  notifyLogId: string | number;
  requestId?: string;
  originalRequestId?: string;
  bizType?: string;
  bizId?: string;
  channel?: string;
  providerKey?: string;
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  clientPk?: string | number;
  userId?: string | number;
  traceId?: string;
  maskedTargets: string[];
}

export interface NotifyLogVO extends BaseEntity {
  notifyLogId: string | number;
  requestId?: string;
  originalRequestId?: string;
  bizType?: string;
  bizId?: string;
  channel?: string;
  providerKey?: string;
  subject?: string;
  content?: string;
  contentType?: string;
  templateCode?: string;
  templateParams?: string;
  contentSnapshot?: string;
  attachmentOssIds?: string;
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  clientPk?: string | number;
  userId?: string | number;
  traceId?: string;
}

export interface NotifyDeliveryVO extends BaseEntity {
  notifyDeliveryLogId: string | number;
  notifyLogId: string | number;
  targetType?: string;
  targetRole?: string;
  targetValue?: string;
  providerKey?: string;
  providerMessageId?: string;
  attemptNo?: number;
  status?: string;
  costTime?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface NotifyDetailVO {
  notification: NotifyLogVO;
  deliveries: NotifyDeliveryVO[];
  attachmentOssIds: Array<string | number>;
}
