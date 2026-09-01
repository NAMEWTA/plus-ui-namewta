export type Identifier = string | number;
export type ProfileType = 'ENTERPRISE' | 'PERSON';
export type MaterialScope = 'COMMON' | 'ENTERPRISE' | 'PERSON';
export type MaterialNodeType = 'CATEGORY' | 'TAG';
export type MaterialOwnerType = 'SOURCE' | 'SUBMISSION' | 'VERSION' | 'WORKING';

export interface ApiResponse<T = null> {
  code?: number;
  data: T;
  msg?: string;
}

export interface PageResult<T> {
  rows: T[];
  total: number;
}

export interface OssAccessUrl {
  accessType: string;
  expiresAt: string | null;
  fileName: string;
  url: string;
}

export interface MaterialOwnerKey {
  ownerId: Identifier;
  ownerType: MaterialOwnerType;
  profileType: ProfileType;
}

export interface MaterialNode {
  children: MaterialNode[];
  enabled: boolean;
  materialNodeId: Identifier;
  materialTagCode: string | null;
  nodeDepth: number;
  nodeName: string;
  nodeType: MaterialNodeType;
  orderNum: number;
  parentId: Identifier;
  scope: MaterialScope;
  systemRequired: boolean;
  version: number;
}

export interface MaterialNodeCommand {
  expectedVersion: number;
  materialTagCode: string | null;
  nodeName: string;
  nodeType: MaterialNodeType;
  orderNum: number;
  parentId: Identifier;
  scope: MaterialScope;
  systemRequired: boolean;
}

export interface MaterialReference {
  attached: boolean;
  attachedTime: string;
  detachedTime: string | null;
  fileExtension: string;
  fileName: string;
  fileSize: number;
  immutableEvidence: boolean;
  materialNodeId: Identifier;
  materialRefId: Identifier;
  materialTagCode: string;
  materialTagName: string;
  mimeType: string;
  ossId: Identifier;
  owner: MaterialOwnerKey;
  version: number;
}

export interface MaterialInput {
  materialNodeId: Identifier;
  ossId: Identifier;
}

export interface PersonIdentity {
  birthDate: string;
  documentNumber: string;
  documentTypeCode: string;
  fullName: string;
  gender: string;
  validFrom: string;
  validUntil: string;
}

export interface EnterpriseIdentity {
  businessScope: string;
  businessTermFrom: string;
  businessTermUntil: string;
  contactName: string;
  contactPhone: string;
  email: string;
  enterpriseName: string;
  enterpriseType: string;
  establishedDate: string;
  industryCode: string;
  legalDocumentNumber: string;
  legalDocumentTypeCode: string;
  legalRepresentativeName: string;
  registeredAddress: string;
  registeredCapital: number;
  unifiedCreditCode: string;
  website: string;
}

export interface PersonApplication extends PersonIdentity {
  finishedTime: string | null;
  personApplicationId: Identifier;
  providerCode: string;
  snapshotVersion: number;
  status: string;
  submittedTime: string | null;
  version: number;
}

export interface PersonDraftCommand extends PersonIdentity {
  expectedVersion: number;
}

export interface EnterpriseApplication extends EnterpriseIdentity {
  enterpriseApplicationId: Identifier;
  finishedTime: string | null;
  handlerIsLegalRepresentative: boolean;
  providerCode: string;
  snapshotVersion: number;
  status: string;
  submittedTime: string | null;
  version: number;
}

export interface EnterpriseDraftCommand extends EnterpriseIdentity {
  expectedVersion: number;
  handlerIsLegalRepresentative: boolean;
}

export interface StatusProbe {
  status: string;
}

export interface PersonMatchResult extends StatusProbe {
  maskedPhone: string | null;
}

export interface PersonConfirmationResult extends PersonMatchResult {
  version: number;
}

export interface PersonSubmissionResult extends StatusProbe {
  snapshotVersion: number;
  version: number;
}

export interface EnterpriseTransferResult extends StatusProbe {
  challengeId: string | null;
  expiresInSeconds: number | null;
}

export interface ProfileBinding {
  bindingId: Identifier;
  bindingVersion: number;
  boundTime: string;
  sourceId: Identifier | null;
  sourceType: string;
  status: string;
  unboundTime: string | null;
  userId: Identifier;
}

export interface ProfileSource {
  fieldSnapshotJson: string;
  occurredTime: string;
  operatorUserId: Identifier;
  reason: string;
  sourceId: Identifier;
  sourceType: string;
}

export interface ProfileAudit {
  afterStatus: string | null;
  auditId: Identifier;
  beforeStatus: string | null;
  capability: string;
  failureCategory: string | null;
  occurredTime: string;
  operationType: string;
  operatorUserId: Identifier;
  reason: string;
  result: string;
}

export interface PersonProfileSummary {
  birthDate: string;
  bindingStatus: string | null;
  bindingUserId: Identifier | null;
  createTime: string;
  documentNumber: string;
  documentTypeCode: string;
  fullName: string;
  gender: string;
  previousProfileId: Identifier | null;
  profileId: Identifier;
  status: string;
}

export interface PersonProfileVersion extends PersonIdentity {
  publishedTime: string;
  sourceId: Identifier;
  sourceType: string;
  status: string;
  versionId: Identifier;
  versionNo: number;
}

export interface EnterpriseProfileSummary {
  bindingStatus: string | null;
  bindingUserId: Identifier | null;
  createTime: string;
  enterpriseName: string;
  enterpriseType: string;
  legalRepresentativeName: string;
  previousProfileId: Identifier | null;
  profileId: Identifier;
  status: string;
  unifiedCreditCode: string;
}

export interface EnterpriseProfileVersion extends EnterpriseIdentity {
  publishedTime: string;
  sourceId: Identifier;
  sourceType: string;
  status: string;
  versionId: Identifier;
  versionNo: number;
}

export interface PersonProfileDetail {
  audits: ProfileAudit[];
  bindings: ProfileBinding[];
  currentMaterials: MaterialReference[];
  profile: PersonProfileSummary;
  sources: ProfileSource[];
  versions: PersonProfileVersion[];
}

export interface EnterpriseProfileDetail {
  audits: ProfileAudit[];
  bindings: ProfileBinding[];
  currentMaterials: MaterialReference[];
  profile: EnterpriseProfileSummary;
  sources: ProfileSource[];
  versions: EnterpriseProfileVersion[];
}

export interface ReviewContext {
  applicantUserId: Identifier;
  applicationId: Identifier;
  decisionVersion: number;
  fieldSnapshotJson: string;
  materials: MaterialReference[];
  status: string;
  submissionId: Identifier;
  submissionSeq: number;
  submittedTime: string;
  version: number;
}

export interface ProfileCommandResult extends StatusProbe {
  bindingId: Identifier | null;
  profileId: Identifier;
  version: number;
  versionId: Identifier | null;
}

export interface PersonArchiveQuery {
  documentNumber?: string;
  fullName?: string;
  pageNum?: number;
  pageSize?: number;
  status?: string;
}

export interface EnterpriseArchiveQuery {
  enterpriseName?: string;
  pageNum?: number;
  pageSize?: number;
  status?: string;
  unifiedCreditCode?: string;
}

export interface DecisionCommand {
  decision: string;
  reason: string;
}

export interface BindingCommand {
  action: 'RESUME' | 'SUSPEND' | 'UNBIND';
  expectedBindingVersion: number;
  reason: string;
}

export interface AssignCommand {
  reason: string;
  userId: Identifier;
}

export interface RevokeCommand {
  expectedVersion: number;
  reason: string;
}

export interface PersonCreateCommand {
  bindUserId: Identifier | null;
  identity: PersonIdentity;
  materials: MaterialInput[];
  reason: string;
}

export interface EnterpriseCreateCommand {
  bindUserId: Identifier | null;
  identity: EnterpriseIdentity;
  materials: MaterialInput[];
  reason: string;
}

export interface PersonReviseCommand {
  expectedVersion: number;
  identity: PersonIdentity;
  reason: string;
}

export interface EnterpriseReviseCommand {
  expectedVersion: number;
  identity: EnterpriseIdentity;
  reason: string;
}
