<template>
  <div ref="container" class="w-full h-[calc(100vh-88px)]">
    <iframe ref="iframe" :src="iframeUrl" frameborder="0" height="100%" style="height: 100%; width: inherit"></iframe>
  </div>
</template>

<script setup name="WarmFlow" lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import tab from '@/plugins/tab';
import { getToken } from '@/utils/auth';

const route = useRoute();
// definitionId为需要查询的流程定义id，
// disabled为是否可编辑, 例如：查看的时候不可编辑，不可保存
const iframeUrl = ref('');
const baseUrl = import.meta.env.VITE_APP_BASE_API;

const onDesignerMessage = (event: MessageEvent) => {
  if (event.data?.method === 'close') {
    close();
  }
};
const open = async (definitionId, disabled) => {
  const url = baseUrl + `/warm-flow-ui/index.html?id=${definitionId}&onlyDesignShow=true`;
  iframeUrl.value = url + '&Authorization=Bearer ' + getToken() + '&clientid=' + import.meta.env.VITE_APP_CLIENT_ID;
};
/** 关闭按钮 */
function close() {
  const obj = {
    path: '/workflow/processDefinition',
    query: { activeName: route.query.activeName }
  };
  tab.closeOpenPage(obj);
}

onMounted(() => {
  window.addEventListener('message', onDesignerMessage);
  open(route.query.definitionId, route.query.disabled);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', onDesignerMessage);
});
/**
 * 对外暴露子组件方法
 */
defineExpose({
  open
});
</script>
