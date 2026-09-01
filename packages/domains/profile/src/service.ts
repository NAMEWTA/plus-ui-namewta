import type { HttpClient, HttpRequest } from '@namewta/platform-contracts';
import type {
  AccountCandidate,
  ApiResponse,
  AssignCommand,
  BindingCommand,
  DecisionCommand,
  EnterpriseApplication,
  EnterpriseArchiveQuery,
  EnterpriseCreateCommand,
  EnterpriseDraftCommand,
  EnterpriseIdentity,
  EnterpriseProfileDetail,
  EnterpriseProfileSummary,
  EnterpriseReviseCommand,
  EnterpriseTransferResult,
  Identifier,
  MaterialNode,
  MaterialNodeCommand,
  MaterialOwnerType,
  MaterialReference,
  MaterialScope,
  OssAccessUrl,
  PageResult,
  PersonApplication,
  PersonArchiveQuery,
  PersonConfirmationResult,
  PersonCreateCommand,
  PersonDraftCommand,
  PersonIdentity,
  PersonMatchResult,
  PersonProfileDetail,
  PersonProfileSummary,
  PersonReviseCommand,
  PersonSubmissionResult,
  ProfileCommandResult,
  ProfileType,
  ReviewContext,
  RevokeCommand,
  StatusProbe
} from './types';
import { projectPersonMatchResponse, projectStatusProbeResponse } from './transport';

export interface MaterialReferenceService {
  accessUrl(
    ownerType: MaterialOwnerType,
    ownerId: Identifier,
    materialRefId: Identifier
  ): Promise<ApiResponse<OssAccessUrl>>;
  attach(
    ownerType: MaterialOwnerType,
    ownerId: Identifier,
    input: { materialNodeId: Identifier; ossId: Identifier }
  ): Promise<ApiResponse<MaterialReference>>;
  detach(ownerType: MaterialOwnerType, ownerId: Identifier, materialRefId: Identifier): Promise<ApiResponse<null>>;
  list(ownerType: MaterialOwnerType, ownerId: Identifier): Promise<ApiResponse<MaterialReference[]>>;
}

export interface PersonApplicationService {
  confirmRebind(identity: PersonIdentity, expectedVersion: number): Promise<ApiResponse<PersonConfirmationResult>>;
  current(): Promise<ApiResponse<PersonApplication | null>>;
  matchRebind(identity: PersonIdentity): Promise<ApiResponse<PersonMatchResult>>;
  probeRebind(input: { documentNumber: string; documentTypeCode: string }): Promise<ApiResponse<StatusProbe>>;
  save(input: PersonDraftCommand): Promise<ApiResponse<PersonApplication>>;
  submit(expectedVersion: number): Promise<ApiResponse<PersonApplication>>;
  submitRebind(expectedVersion: number): Promise<ApiResponse<PersonSubmissionResult>>;
  unbind(): Promise<ApiResponse<StatusProbe>>;
}

export interface EnterpriseApplicationService {
  confirmTransfer(input: { challengeId: string; code: string }): Promise<ApiResponse<EnterpriseTransferResult>>;
  current(): Promise<ApiResponse<EnterpriseApplication | null>>;
  probe(unifiedCreditCode: string): Promise<ApiResponse<StatusProbe>>;
  save(input: EnterpriseDraftCommand): Promise<ApiResponse<EnterpriseApplication>>;
  sendTransfer(input: {
    documentLastFour: string;
    fullName: string;
    phone: string;
  }): Promise<ApiResponse<EnterpriseTransferResult>>;
  submit(expectedVersion: number): Promise<ApiResponse<EnterpriseApplication>>;
  unbind(): Promise<ApiResponse<EnterpriseTransferResult>>;
}

export interface PersonArchiveService {
  assign(profileId: Identifier, input: AssignCommand): Promise<ApiResponse<ProfileCommandResult>>;
  create(input: PersonCreateCommand): Promise<ApiResponse<ProfileCommandResult>>;
  decide(applicationId: Identifier, input: DecisionCommand): Promise<ApiResponse<ProfileCommandResult>>;
  detail(profileId: Identifier): Promise<ApiResponse<PersonProfileDetail>>;
  eligibleUsers(keyword: string): Promise<ApiResponse<AccountCandidate[]>>;
  material(profileId: Identifier, materialRefId: Identifier): Promise<ApiResponse<OssAccessUrl>>;
  page(query: PersonArchiveQuery): Promise<ApiResponse<PageResult<PersonProfileSummary>>>;
  review(applicationId: Identifier): Promise<ApiResponse<ReviewContext>>;
  reviewMaterial(applicationId: Identifier, materialRefId: Identifier): Promise<ApiResponse<OssAccessUrl>>;
  revise(profileId: Identifier, input: PersonReviseCommand): Promise<ApiResponse<ProfileCommandResult>>;
  manageBinding(profileId: Identifier, input: BindingCommand): Promise<ApiResponse<ProfileCommandResult>>;
  revoke(profileId: Identifier, input: RevokeCommand): Promise<ApiResponse<ProfileCommandResult>>;
}

export interface EnterpriseArchiveService {
  assign(profileId: Identifier, input: AssignCommand): Promise<ApiResponse<ProfileCommandResult>>;
  create(input: EnterpriseCreateCommand): Promise<ApiResponse<ProfileCommandResult>>;
  decide(applicationId: Identifier, input: DecisionCommand): Promise<ApiResponse<ProfileCommandResult>>;
  detail(profileId: Identifier): Promise<ApiResponse<EnterpriseProfileDetail>>;
  eligibleUsers(keyword: string): Promise<ApiResponse<AccountCandidate[]>>;
  material(profileId: Identifier, materialRefId: Identifier): Promise<ApiResponse<OssAccessUrl>>;
  page(query: EnterpriseArchiveQuery): Promise<ApiResponse<PageResult<EnterpriseProfileSummary>>>;
  review(applicationId: Identifier): Promise<ApiResponse<ReviewContext>>;
  reviewMaterial(applicationId: Identifier, materialRefId: Identifier): Promise<ApiResponse<OssAccessUrl>>;
  revise(profileId: Identifier, input: EnterpriseReviseCommand): Promise<ApiResponse<ProfileCommandResult>>;
  manageBinding(profileId: Identifier, input: BindingCommand): Promise<ApiResponse<ProfileCommandResult>>;
  revoke(profileId: Identifier, input: RevokeCommand): Promise<ApiResponse<ProfileCommandResult>>;
}

export interface ProfileService {
  readonly enterprise: {
    readonly application: EnterpriseApplicationService;
    readonly archive: EnterpriseArchiveService;
    readonly materials: MaterialReferenceService;
  };
  readonly materialTags: {
    archive(materialNodeId: Identifier, expectedVersion: number): Promise<ApiResponse<null>>;
    changeStatus(materialNodeId: Identifier, enabled: boolean, expectedVersion: number): Promise<ApiResponse<null>>;
    create(input: MaterialNodeCommand): Promise<ApiResponse<MaterialNode>>;
    tree(scope: MaterialScope, includeDisabled?: boolean): Promise<ApiResponse<MaterialNode[]>>;
    update(materialNodeId: Identifier, input: MaterialNodeCommand): Promise<ApiResponse<MaterialNode>>;
  };
  readonly person: {
    readonly application: PersonApplicationService;
    readonly archive: PersonArchiveService;
    readonly materials: MaterialReferenceService;
  };
}

const segment = (value: Identifier) => encodeURIComponent(String(value));

function createMaterialService(request: <T>(config: HttpRequest) => Promise<ApiResponse<T>>, type: ProfileType) {
  const base = type === 'PERSON' ? '/profile/person/materials' : '/profile/enterprise/materials';
  const ownerPath = (ownerType: MaterialOwnerType, ownerId: Identifier) =>
    `${base}/${segment(ownerType)}/${segment(ownerId)}`;
  return Object.freeze<MaterialReferenceService>({
    list: (ownerType, ownerId) => request({ url: ownerPath(ownerType, ownerId), method: 'get' }),
    attach: (ownerType, ownerId, data) => request({ url: ownerPath(ownerType, ownerId), method: 'post', data }),
    detach: (ownerType, ownerId, materialRefId) =>
      request({ url: `${ownerPath(ownerType, ownerId)}/${segment(materialRefId)}/detach`, method: 'post' }),
    accessUrl: (ownerType, ownerId, materialRefId) =>
      request({ url: `${ownerPath(ownerType, ownerId)}/${segment(materialRefId)}/access-url`, method: 'get' })
  });
}

function createPersonArchive(request: <T>(config: HttpRequest) => Promise<ApiResponse<T>>): PersonArchiveService {
  const base = '/profile/person/archive';
  return Object.freeze<PersonArchiveService>({
    page: query => request({ url: base, method: 'get', params: query }),
    eligibleUsers: keyword => request({ url: `${base}/eligible-users`, method: 'get', params: { keyword } }),
    detail: profileId => request({ url: `${base}/${segment(profileId)}`, method: 'get' }),
    review: applicationId =>
      request({ url: `${base}/application/${segment(applicationId)}/review-context`, method: 'get' }),
    reviewMaterial: (applicationId, materialRefId) =>
      request({
        url: `${base}/application/${segment(applicationId)}/material/${segment(materialRefId)}/access-url`,
        method: 'get'
      }),
    material: (profileId, materialRefId) =>
      request({ url: `${base}/${segment(profileId)}/material/${segment(materialRefId)}/access-url`, method: 'get' }),
    decide: (applicationId, data) =>
      request({ url: `${base}/application/${segment(applicationId)}/decision`, method: 'post', data }),
    create: data => request({ url: `${base}/admin-create`, method: 'post', data }),
    revise: (profileId, data) => request({ url: `${base}/${segment(profileId)}/revision`, method: 'post', data }),
    assign: (profileId, data) => request({ url: `${base}/${segment(profileId)}/assign`, method: 'post', data }),
    manageBinding: (profileId, data) => request({ url: `${base}/${segment(profileId)}/binding`, method: 'post', data }),
    revoke: (profileId, data) => request({ url: `${base}/${segment(profileId)}/revoke`, method: 'post', data })
  });
}

function createEnterpriseArchive(
  request: <T>(config: HttpRequest) => Promise<ApiResponse<T>>
): EnterpriseArchiveService {
  const base = '/profile/enterprise/archive';
  return Object.freeze<EnterpriseArchiveService>({
    page: query => request({ url: base, method: 'get', params: query }),
    eligibleUsers: keyword => request({ url: `${base}/eligible-users`, method: 'get', params: { keyword } }),
    detail: profileId => request({ url: `${base}/${segment(profileId)}`, method: 'get' }),
    review: applicationId =>
      request({ url: `${base}/application/${segment(applicationId)}/review-context`, method: 'get' }),
    reviewMaterial: (applicationId, materialRefId) =>
      request({
        url: `${base}/application/${segment(applicationId)}/material/${segment(materialRefId)}/access-url`,
        method: 'get'
      }),
    material: (profileId, materialRefId) =>
      request({ url: `${base}/${segment(profileId)}/material/${segment(materialRefId)}/access-url`, method: 'get' }),
    decide: (applicationId, data) =>
      request({ url: `${base}/application/${segment(applicationId)}/decision`, method: 'post', data }),
    create: data => request({ url: `${base}/admin-create`, method: 'post', data }),
    revise: (profileId, data) => request({ url: `${base}/${segment(profileId)}/revision`, method: 'post', data }),
    assign: (profileId, data) => request({ url: `${base}/${segment(profileId)}/assign`, method: 'post', data }),
    manageBinding: (profileId, data) => request({ url: `${base}/${segment(profileId)}/binding`, method: 'post', data }),
    revoke: (profileId, data) => request({ url: `${base}/${segment(profileId)}/revoke`, method: 'post', data })
  });
}

export function createProfileService(http: HttpClient): ProfileService {
  const request = <T>(config: HttpRequest) => http.request<ApiResponse<T>>(config);
  const raw = (config: HttpRequest) => http.request<unknown>(config);
  const personApplication = Object.freeze<PersonApplicationService>({
    current: () => request({ url: '/profile/person/application', method: 'get' }),
    save: data => request({ url: '/profile/person/application', method: 'post', data }),
    submit: expectedVersion =>
      request({ url: '/profile/person/application/submit', method: 'post', data: { expectedVersion } }),
    probeRebind: data =>
      raw({ url: '/profile/person/rebind/probe', method: 'post', data }).then(projectStatusProbeResponse),
    matchRebind: identity =>
      raw({ url: '/profile/person/rebind/match', method: 'post', data: { identity } }).then(projectPersonMatchResponse),
    confirmRebind: (identity, expectedVersion) =>
      request({ url: '/profile/person/rebind/confirm', method: 'post', data: { identity, expectedVersion } }),
    submitRebind: expectedVersion =>
      request({ url: '/profile/person/rebind/submit', method: 'post', data: { expectedVersion } }),
    unbind: () => request({ url: '/profile/person/rebind/unbind', method: 'post' })
  });
  const enterpriseApplication = Object.freeze<EnterpriseApplicationService>({
    current: () => request({ url: '/profile/enterprise/application', method: 'get' }),
    save: data => request({ url: '/profile/enterprise/application', method: 'post', data }),
    submit: expectedVersion =>
      request({ url: '/profile/enterprise/application/submit', method: 'post', data: { expectedVersion } }),
    probe: unifiedCreditCode =>
      raw({ url: '/profile/enterprise/application/probe', method: 'post', data: { unifiedCreditCode } }).then(
        projectStatusProbeResponse
      ),
    sendTransfer: data => request({ url: '/profile/enterprise/transfer/send', method: 'post', data }),
    confirmTransfer: data => request({ url: '/profile/enterprise/transfer/confirm', method: 'post', data }),
    unbind: () => request({ url: '/profile/enterprise/transfer/unbind', method: 'post' })
  });
  return Object.freeze<ProfileService>({
    materialTags: Object.freeze({
      tree: (scope, includeDisabled = false) =>
        request({ url: '/profile/material-tags/tree', method: 'get', params: { scope, includeDisabled } }),
      create: data => request({ url: '/profile/material-tags', method: 'post', data }),
      update: (materialNodeId, data) =>
        request({ url: `/profile/material-tags/${segment(materialNodeId)}`, method: 'post', data }),
      changeStatus: (materialNodeId, enabled, expectedVersion) =>
        request({
          url: `/profile/material-tags/${segment(materialNodeId)}/status`,
          method: 'post',
          data: { enabled, expectedVersion }
        }),
      archive: (materialNodeId, expectedVersion) =>
        request({
          url: `/profile/material-tags/${segment(materialNodeId)}/archive`,
          method: 'post',
          data: { expectedVersion }
        })
    }),
    person: Object.freeze({
      application: personApplication,
      archive: createPersonArchive(request),
      materials: createMaterialService(request, 'PERSON')
    }),
    enterprise: Object.freeze({
      application: enterpriseApplication,
      archive: createEnterpriseArchive(request),
      materials: createMaterialService(request, 'ENTERPRISE')
    })
  });
}
