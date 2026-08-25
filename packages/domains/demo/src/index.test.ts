import type { HttpClient, HttpRequest } from '@namewta/platform-contracts';
import { describe, expect, it } from 'vitest';
import { createDemoService, demoDomainModule, type DemoForm, type TreeForm } from './index';

describe('demo domain', () => {
  it('publishes traceable headless domain metadata', () => {
    expect(demoDomainModule).toEqual({
      id: 'demo',
      backendModules: ['ruoyi-demo'],
      capabilities: ['demo-table', 'demo-tree']
    });
  });

  it('preserves table and tree transport paths, methods, params, and data', async () => {
    const requests: HttpRequest[] = [];
    const client: HttpClient = {
      async request<T>(request: HttpRequest): Promise<T> {
        requests.push(request);
        return { code: 200, data: null } as T;
      }
    };
    const service = createDemoService(client);
    const demoForm: DemoForm = { id: 7, testKey: 'key' };
    const treeForm: TreeForm = { id: 8, parentId: 0, treeName: 'root' };

    await service.listDemo({ pageNum: 2, pageSize: 20, testKey: 'key' });
    await service.getDemo(7);
    await service.addDemo(demoForm);
    await service.updateDemo(demoForm);
    await service.deleteDemo([7, 8]);
    await service.listTree({ parentId: 0 });
    await service.getTree(8);
    await service.addTree(treeForm);
    await service.updateTree(treeForm);
    await service.deleteTree(8);

    expect(requests).toEqual([
      { url: '/demo/demo/list', method: 'get', params: { pageNum: 2, pageSize: 20, testKey: 'key' } },
      { url: '/demo/demo/7', method: 'get' },
      { url: '/demo/demo', method: 'post', data: demoForm },
      { url: '/demo/demo', method: 'put', data: demoForm },
      { url: '/demo/demo/7,8', method: 'delete' },
      { url: '/demo/tree/list', method: 'get', params: { parentId: 0 } },
      { url: '/demo/tree/8', method: 'get' },
      { url: '/demo/tree', method: 'post', data: treeForm },
      { url: '/demo/tree', method: 'put', data: treeForm },
      { url: '/demo/tree/8', method: 'delete' }
    ]);
  });
});
