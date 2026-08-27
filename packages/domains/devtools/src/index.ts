import type { DictTypeCatalogPort } from '@namewta/domain-system-admin/public/dict';
import type { MenuQueryPort } from '@namewta/domain-system-admin/public/menu';
import type { DomainModule } from '@namewta/platform-app-runtime';
import type { HttpClient, HttpRequest } from '@namewta/platform-contracts';
import { projectGeneratorTableTransport, type GeneratorTableTransport } from './transport';

export * from './transport';
import type {
  ApiResponse,
  DbTableForm,
  DbTableQuery,
  DbTableVO,
  DevtoolsMetadata,
  DownloadIntent,
  GenTableDetailPayload,
  Identifier,
  ImportTableInput,
  PageResult,
  TableQuery,
  TableVO
} from './types';

export * from './types';

export interface DevtoolsService {
  list(query: TableQuery): Promise<ApiResponse<PageResult<TableVO>>>;
  listDatabaseTables(query: DbTableQuery): Promise<ApiResponse<PageResult<DbTableVO>>>;
  get(tableId: Identifier): Promise<ApiResponse<GenTableDetailPayload>>;
  update(data: DbTableForm): Promise<ApiResponse>;
  importTables(data: ImportTableInput): Promise<ApiResponse>;
  preview(tableId: Identifier): Promise<ApiResponse<Record<string, string>>>;
  delete(tableIds: Identifier | readonly Identifier[]): Promise<ApiResponse>;
  sync(tableId: Identifier): Promise<ApiResponse>;
  dataSourceNames(): Promise<ApiResponse<string[]>>;
  downloadIntent(tableIds: readonly Identifier[]): DownloadIntent;
  metadata: DevtoolsMetadata;
}

export const devtoolsDomainModule: DomainModule = Object.freeze({
  id: 'devtools',
  backendModules: Object.freeze(['ruoyi-gen', 'ruoyi-system']),
  capabilities: Object.freeze(['code-generator'])
});

const segment = (value: Identifier | readonly Identifier[]) =>
  (Array.isArray(value) ? value : [value]).map(item => encodeURIComponent(String(item))).join(',');

export function createDevtoolsService(
  http: HttpClient,
  metadataPorts: { dictTypes: DictTypeCatalogPort; menus: MenuQueryPort }
): DevtoolsService {
  const request = <T = unknown>(config: HttpRequest) => http.request<ApiResponse<T>>(config);
  return Object.freeze({
    list: async (params: TableQuery) => {
      const response = await request<PageResult<GeneratorTableTransport>>({
        url: '/tool/gen/list',
        method: 'get',
        params
      });
      if (!response.data || !Array.isArray(response.data.rows)) {
        return response as unknown as ApiResponse<PageResult<TableVO>>;
      }
      return {
        ...response,
        data: { ...response.data, rows: response.data.rows.map(projectGeneratorTableTransport) }
      };
    },
    listDatabaseTables: (params: DbTableQuery) =>
      request<PageResult<DbTableVO>>({ url: '/tool/gen/db/list', method: 'get', params }),
    get: (tableId: Identifier) =>
      request<GenTableDetailPayload>({ url: '/tool/gen/' + segment(tableId), method: 'get' }),
    update: (data: DbTableForm) => request({ url: '/tool/gen', method: 'put', data }),
    importTables: (params: ImportTableInput) => request({ url: '/tool/gen/importTable', method: 'post', params }),
    preview: (tableId: Identifier) =>
      request<Record<string, string>>({ url: '/tool/gen/preview/' + segment(tableId), method: 'get' }),
    delete: (tableIds: Identifier | readonly Identifier[]) =>
      request({ url: '/tool/gen/' + segment(tableIds), method: 'delete' }),
    sync: (tableId: Identifier) => request({ url: '/tool/gen/synchDb/' + segment(tableId), method: 'get' }),
    dataSourceNames: () => request<string[]>({ url: '/tool/gen/getDataNames', method: 'get' }),
    downloadIntent(tableIds: readonly Identifier[]) {
      if (!tableIds.length) throw new Error('至少选择一张数据表');
      return Object.freeze({ url: '/tool/gen/batchGenCode?tableIdStr=' + segment(tableIds), fileName: 'ruoyi.zip' });
    },
    metadata: Object.freeze({
      dictTypes: (clientId?: Identifier) => metadataPorts.dictTypes.list(clientId),
      menus: (clientId?: Identifier) => metadataPorts.menus.options(clientId)
    })
  });
}
