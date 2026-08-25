import type { DemoWebRuntime } from '@namewta/web-domain-demo';
import { addDemo, delDemo, getDemo, listDemo, updateDemo } from '@/api/demo/demo';
import { addTree, delTree, getTree, listTree, updateTree } from '@/api/demo/tree';
import modal from '@/plugins/modal';
import { download } from '@/utils/request';

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
