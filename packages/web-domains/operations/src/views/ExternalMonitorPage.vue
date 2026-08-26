<template>
  <div class="p-2 app-container iframe-page">
    <el-alert v-if="failure" :title="failure" type="error" :closable="false" show-icon />
    <div v-else-if="safeUrl" class="iframe-page__inner"><component :is="runtime.iframe" v-model:src="safeUrl" /></div>
  </div>
</template>
<script setup lang="ts">
import type { ExternalOperationTarget } from '@namewta/domain-operations';
import { ref } from 'vue';
import type { OperationsWebRuntime } from '../runtime';
const props = defineProps<{ runtime: OperationsWebRuntime; target: ExternalOperationTarget }>();
const failure = ref('');
const safeUrl = ref('');
try {
  safeUrl.value = props.runtime.service.externalIntent(
    props.target,
    props.runtime.externalUrls[props.target],
    props.runtime.hasPermission(
      `monitor:${props.target === 'monitor-admin' ? 'admin' : props.target.replace('-', '')}:list`
    )
  ).url;
} catch (error) {
  failure.value = error instanceof Error ? error.message : '运维入口不可用';
}
</script>
<style scoped>
.iframe-page__inner {
  overflow: hidden;
  border-radius: 8px;
  background: var(--app-surface-bg);
  box-shadow: var(--app-shadow-sm);
}
</style>
