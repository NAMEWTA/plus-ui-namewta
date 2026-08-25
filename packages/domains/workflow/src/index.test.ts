import type { HttpRequest } from '@namewta/platform-contracts';
import { describe, expect, it } from 'vitest';
import { createWorkflowDefinitionService } from './index';

describe('workflow definition transport contract', () => {
  it('preserves every legacy category, definition and SpEL request', async () => {
    const requests: HttpRequest[] = [];
    const service = createWorkflowDefinitionService({
      request: async request => {
        requests.push(request);
        return { code: 200 } as never;
      }
    });
    const form = {};
    await service.listCategories({ categoryName: '审批' });
    await service.getCategory('1');
    await service.addCategory(form);
    await service.updateCategory(form);
    await service.deleteCategory(['1', '2']);
    await service.categoryTree(form);
    await service.listDefinitions({ category: '1', pageNum: 1, pageSize: 10 });
    await service.listUnpublishedDefinitions({ category: '1', pageNum: 1, pageSize: 10 });
    await service.legacyDefinitionXml('d1');
    await service.deleteDefinition(['d1', 'd2']);
    await service.setDefinitionActive('d1', true);
    await service.importDefinition(form);
    await service.publishDefinition('d1');
    await service.unpublishDefinition('d1');
    await service.getDefinitionXmlString('d1');
    await service.addDefinition(form);
    await service.updateDefinition(form);
    await service.getDefinition('d1');
    await service.copyDefinition('d1');
    await service.listSpel({ componentName: 'owner' });
    await service.getSpel('s1');
    await service.addSpel(form);
    await service.updateSpel(form);
    await service.deleteSpel(['s1', 's2']);

    expect(requests).toEqual([
      { url: '/workflow/category/list', method: 'get', params: { categoryName: '审批' } },
      { url: '/workflow/category/1', method: 'get' },
      { url: '/workflow/category', method: 'post', data: form },
      { url: '/workflow/category', method: 'put', data: form },
      { url: '/workflow/category/1,2', method: 'delete' },
      { url: '/workflow/category/categoryTree', method: 'get', params: form },
      { url: '/workflow/definition/list', method: 'get', params: { category: '1', pageNum: 1, pageSize: 10 } },
      {
        url: '/workflow/definition/unPublishList',
        method: 'get',
        params: { category: '1', pageNum: 1, pageSize: 10 }
      },
      { url: '/workflow/definition/definitionXml/d1', method: 'get' },
      { url: '/workflow/definition/d1,d2', method: 'delete' },
      { url: '/workflow/definition/active/d1', method: 'put', params: { active: true } },
      {
        url: '/workflow/definition/importDef',
        method: 'post',
        data: form,
        headers: { repeatSubmit: false }
      },
      { url: '/workflow/definition/publish/d1', method: 'put' },
      { url: '/workflow/definition/unPublish/d1', method: 'put' },
      { url: '/workflow/definition/xmlString/d1', method: 'get' },
      { url: '/workflow/definition', method: 'post', data: form },
      { url: '/workflow/definition', method: 'put', data: form },
      { url: '/workflow/definition/d1', method: 'get' },
      { url: '/workflow/definition/copy/d1', method: 'post' },
      { url: '/workflow/spel/list', method: 'get', params: { componentName: 'owner' } },
      { url: '/workflow/spel/s1', method: 'get' },
      { url: '/workflow/spel', method: 'post', data: form },
      { url: '/workflow/spel', method: 'put', data: form },
      { url: '/workflow/spel/s1,s2', method: 'delete' }
    ]);
  });

  it('encodes every single and batch identifier while preserving batch separators', async () => {
    const requests: HttpRequest[] = [];
    const service = createWorkflowDefinitionService({
      request: async request => {
        requests.push(request);
        return { code: 200 } as never;
      }
    });
    await service.getCategory('category/a b');
    await service.deleteCategory(['first/id', 'second id', 'comma,value']);
    await service.deleteDefinition(['definition/a', 'definition b']);
    await service.getSpel('spel?#');
    expect(requests.map(request => request.url)).toEqual([
      '/workflow/category/category%2Fa%20b',
      '/workflow/category/first%2Fid,second%20id,comma%2Cvalue',
      '/workflow/definition/definition%2Fa,definition%20b',
      '/workflow/spel/spel%3F%23'
    ]);
  });
});
