<template><iframe class="workflow-design-frame" :src="src" title="流程设计"></iframe></template>
<script setup name="WarmFlow" lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { WorkflowWebRuntime } from '../runtime';
const { runtime } = defineProps<{ runtime: WorkflowWebRuntime }>();
const route = useRoute();
const src = computed(() => runtime.designUrl(String(route.query.id ?? '')));
</script>
<style scoped>
.workflow-design-frame {
  width: 100%;
  height: calc(100vh - 84px);
  border: 0;
}
</style>
