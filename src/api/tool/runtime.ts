import { createDevtoolsService } from '@namewta/domain-devtools';
import { createDictTypeCatalogPort } from '@namewta/domain-system-admin/public/dict';
import { createMenuQueryPort } from '@namewta/domain-system-admin/public/menu';
import request from '@/utils/request';

const http = { request: <T>(config: Parameters<typeof request>[0]) => request(config) as Promise<T> };

export const devtoolsService = createDevtoolsService(http, {
  dictTypes: createDictTypeCatalogPort(http),
  menus: createMenuQueryPort(http)
});
