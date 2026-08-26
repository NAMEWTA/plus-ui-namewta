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

  it('preserves task, instance and leave runtime transport contracts', async () => {
    const requests: HttpRequest[] = [];
    const service = createWorkflowDefinitionService({
      request: async request => {
        requests.push(request);
        return { code: 200 } as never;
      }
    });
    const query = { pageNum: 1, pageSize: 10 };
    const data = { taskId: 'task/1' };
    await service.pageTaskWaiting(query);
    await service.pageTaskFinished(query);
    await service.pageTaskCopies(query);
    await service.pageAllTaskWaiting(query);
    await service.pageAllTaskFinished(query);
    await service.startWorkflow(data);
    await service.completeTask(data);
    await service.backProcess(data);
    await service.getTask('task/1');
    await service.updateAssignee(['task/1'], 'user/1');
    await service.terminateTask(data);
    await service.getBackTaskNodes('task/1', 'node/a');
    await service.operateTask(data, 'transferTask');
    await service.currentTaskUsers('task/1');
    await service.getNextNodes(data);
    await service.urgeTask(data);
    await service.pageRunningInstances(query);
    await service.pageFinishedInstances(query);
    await service.pageCurrentInstances(query);
    await service.flowHistory('business/1');
    await service.cancelProcess(data);
    await service.instanceVariables('instance/1');
    await service.deleteInstances(['instance/1', 'instance 2']);
    await service.deleteHistoricInstances('instance/1');
    await service.invalidateInstance(data);
    await service.updateInstanceVariables(data);
    await service.listLeaves(query);
    await service.getLeave('leave/1');
    await service.addLeave(data);
    await service.submitLeave(data);
    await service.updateLeave(data);
    await service.deleteLeaves(['leave/1', 'leave 2']);

    expect(requests.map(({ url, method }) => `${method} ${url}`)).toEqual([
      'get /workflow/task/pageByTaskWait',
      'get /workflow/task/pageByTaskFinish',
      'get /workflow/task/pageByTaskCopy',
      'get /workflow/task/pageByAllTaskWait',
      'get /workflow/task/pageByAllTaskFinish',
      'post /workflow/task/startWorkFlow',
      'post /workflow/task/completeTask',
      'post /workflow/task/backProcess',
      'get /workflow/task/getTask/task%2F1',
      'put /workflow/task/updateAssignee/user%2F1',
      'post /workflow/task/terminationTask',
      'get /workflow/task/getBackTaskNode/task%2F1/node%2Fa',
      'post /workflow/task/taskOperation/transferTask',
      'get /workflow/task/currentTaskAllUser/task%2F1',
      'post /workflow/task/getNextNodeList',
      'post /workflow/task/urgeTask',
      'get /workflow/instance/pageByRunning',
      'get /workflow/instance/pageByFinish',
      'get /workflow/instance/pageByCurrent',
      'get /workflow/instance/flowHisTaskList/business%2F1',
      'put /workflow/instance/cancelProcessApply',
      'get /workflow/instance/instanceVariable/instance%2F1',
      'delete /workflow/instance/deleteByInstanceIds/instance%2F1,instance%202',
      'delete /workflow/instance/deleteHisByInstanceIds/instance%2F1',
      'post /workflow/instance/invalid',
      'put /workflow/instance/updateVariable',
      'get /workflow/leave/list',
      'get /workflow/leave/leave%2F1',
      'post /workflow/leave',
      'post /workflow/leave/submitAndFlowStart',
      'put /workflow/leave',
      'delete /workflow/leave/leave%2F1,leave%202'
    ]);
  });
});
