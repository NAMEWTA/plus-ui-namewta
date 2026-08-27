import type { HttpRequest } from '@namewta/platform-contracts';
import { describe, expect, it } from 'vitest';
import { createGenService, genDomainModule } from './index';

describe('gen domain', () => {
  it('publishes traceable generator metadata', () => {
    expect(genDomainModule).toEqual({
      id: 'gen',
      backendModules: ['ruoyi-gen'],
      capabilities: ['code-generator']
    });
  });

  it('preserves generator transport and delegates metadata only to public ports', async () => {
    const requests: HttpRequest[] = [];
    const dictTypes = { list: async (clientId?: string | number) => [{ name: String(clientId), type: 'status' }] };
    const menus = { options: async (clientId?: string | number) => [{ id: 1, label: String(clientId) }] };
    const service = createGenService(
      {
        request: async request => {
          requests.push(request);
          return { code: 200, data: {} } as never;
        }
      },
      { dictTypes, menus }
    );

    await service.list({
      pageNum: 1,
      pageSize: 10,
      tableName: 'sys/user',
      tableComment: '',
      dataName: 'master',
      params: { beginTime: '2026-08-01', endTime: '2026-08-26' }
    });
    await service.listDatabaseTables({
      pageNum: 2,
      pageSize: 20,
      tableName: '',
      tableComment: '用户',
      dataName: 'slave'
    });
    await service.get('table/1');
    await service.update({ tableName: 'user', tableComment: '用户', columns: [], tree: false, crud: true, params: {} });
    await service.importTables({ tables: 'sys_user,sys_role', dataName: 'master' });
    await service.preview('table 1');
    await service.delete(['table/1', 'table,2']);
    await service.sync('table/1');
    await service.dataSourceNames();

    expect(requests).toEqual([
      {
        url: '/tool/gen/list',
        method: 'get',
        params: {
          pageNum: 1,
          pageSize: 10,
          tableName: 'sys/user',
          tableComment: '',
          dataName: 'master',
          params: { beginTime: '2026-08-01', endTime: '2026-08-26' }
        }
      },
      {
        url: '/tool/gen/db/list',
        method: 'get',
        params: { pageNum: 2, pageSize: 20, tableName: '', tableComment: '用户', dataName: 'slave' }
      },
      { url: '/tool/gen/table%2F1', method: 'get' },
      {
        url: '/tool/gen',
        method: 'put',
        data: { tableName: 'user', tableComment: '用户', columns: [], tree: false, crud: true, params: {} }
      },
      { url: '/tool/gen/importTable', method: 'post', params: { tables: 'sys_user,sys_role', dataName: 'master' } },
      { url: '/tool/gen/preview/table%201', method: 'get' },
      { url: '/tool/gen/table%2F1,table%2C2', method: 'delete' },
      { url: '/tool/gen/synchDb/table%2F1', method: 'get' },
      { url: '/tool/gen/getDataNames', method: 'get' }
    ]);
    await expect(service.metadata.dictTypes('admin')).resolves.toEqual([{ name: 'admin', type: 'status' }]);
    await expect(service.metadata.menus('admin')).resolves.toEqual([{ id: 1, label: 'admin' }]);
  });

  it('creates the legacy ZIP intent and rejects empty selections', () => {
    const service = createGenService(
      { request: async () => ({}) as never },
      {
        dictTypes: { list: async () => [] },
        menus: { options: async () => [] }
      }
    );
    expect(service.downloadIntent(['table/1', 'table,2'])).toEqual({
      url: '/tool/gen/batchGenCode?tableIdStr=table%2F1,table%2C2',
      fileName: 'ruoyi.zip'
    });
    expect(() => service.downloadIntent([])).toThrow('至少选择一张数据表');
  });

  it('projects generated table rows before returning domain models', async () => {
    const service = createGenService(
      { request: async () => ({ data: { rows: [{ tableId: 3, tableName: 'sys_user' }], total: 1 } }) as never },
      { dictTypes: { list: async () => [] }, menus: { options: async () => [] } }
    );

    await expect(service.list({ pageNum: 1, pageSize: 10 } as never)).resolves.toMatchObject({
      data: {
        rows: [{ tableId: 3, tableName: 'sys_user', tplCategory: 'crud', frontendType: 'element-plus' }],
        total: 1
      }
    });
  });
});
