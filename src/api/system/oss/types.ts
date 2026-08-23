export interface OssVO extends BaseEntity {
  ossId: string | number;
  fileName: string;
  originalName: string;
  fileSuffix: string;
  url: string;
  createByName: string;
  service: string;
  isTemp: 'Y' | 'N';
  expireTime?: string;
  deleteState: 'ACTIVE' | 'PENDING';
  referenceCount: number;
  references: Array<{ refType: string; refId: string }>;
}

export interface OssUploadVO {
  url: string;
  fileName: string;
  ossId: string;
}

export type OssUploadMode = 'SINGLE' | 'MULTIPART';

export interface OssPresignedRequest {
  method: string;
  url: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface OssUploadInitRequest {
  policy: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  fingerprint: string;
}

export interface OssUploadInitResponse {
  uploadToken: string;
  mode: OssUploadMode;
  expiresAt: string;
  presignedRequest?: OssPresignedRequest;
  partSize?: number;
  partCount?: number;
}

export interface OssSignedPart extends OssPresignedRequest {
  partNumber: number;
}

export interface OssUploadedPart {
  partNumber: number;
  eTag: string;
  size: number;
}

export interface OssUploadResumeResponse {
  uploadToken: string;
  mode: OssUploadMode;
  fileName: string;
  fileSize: number;
  contentType: string;
  partSize: number;
  partCount: number;
  expiresAt: string;
  presignedRequest?: OssPresignedRequest;
  uploadedParts: OssUploadedPart[];
}

export interface OssCompletedPart {
  partNumber: number;
  eTag: string;
}

export interface OssDownloadUrl {
  url: string;
  expiresAt: string;
  fileName: string;
}

export interface OssQuery extends PageQuery {
  fileName: string;
  originalName: string;
  fileSuffix: string;
  createTime: string;
  service: string;
  orderByColumn: string;
  isAsc: string;
}
export interface OssForm {
  file: undefined | string;
}

export interface SysOssExt {
  bizType?: string;
  fileSize?: number;
  contentType?: string;
  source?: string;
  uploadIp?: string;
  remark?: string;
  tags?: string[];
  refId?: string;
  refType?: string;
  isTemp?: boolean;
  md5?: string;
}
