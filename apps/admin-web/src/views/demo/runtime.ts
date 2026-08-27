import type { DemoWebRuntime } from '@namewta/web-domain-demo';
import type { Component } from 'vue';
import { demoDomainModule } from '@namewta/domain-demo';
import { composeAppRuntime } from '@namewta/platform-app-runtime';
import { createDemoWebDomain } from '@namewta/web-domain-demo';
import { addDemo, delDemo, getDemo, listDemo, updateDemo } from '@/api/demo/demo';
import { addTree, delTree, getTree, listTree, updateTree } from '@/api/demo/tree';
import modal from '@/plugins/modal';
import { download } from '@/utils/request';
import { createDemoRouteAdapter } from '@/views/demo/routeAdapter';

export const demoWebRuntime: DemoWebRuntime = {
  service: {
    addDemo,
    addTree,
    deleteDemo: delDemo,
    deleteTree: delTree,
    getDemo,
    getTree,
    listDemo,
    listTree,
    updateDemo,
    updateTree
  },
  confirm: message => modal.confirm(message).then(() => undefined),
  download,
  success: message => modal.msgSuccess(message)
};

const demoAppRuntime = composeAppRuntime<Component>({
  appId: 'admin-web',
  domainModules: [demoDomainModule],
  manifests: [createDemoWebDomain(demoWebRuntime)],
  selectedDomainIds: ['demo'],
  selectedManifestIds: ['web-domain-demo']
});

const demoRouteAdapter = createDemoRouteAdapter(demoAppRuntime, 'demo');

export const loadDemoRouteView = (componentKey: string): Promise<Component> => demoRouteAdapter.load(componentKey);
