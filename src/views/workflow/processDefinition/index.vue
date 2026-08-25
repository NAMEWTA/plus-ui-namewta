<template><WorkflowPage /></template>
<script setup name="processDefinition" lang="ts">
import { defineAsyncComponent } from 'vue';
import { resolveAdminWebRegistration } from '@/router/adminManifestRegistry';
const WorkflowPage = defineAsyncComponent(async () => {
  const registration = resolveAdminWebRegistration('workflow/processDefinition/index', 'workflow');
  if (!registration) throw new Error('Workflow registration is unavailable: workflow/processDefinition/index');
  return registration.load();
});
</script>

<style lang="scss">
@use '@/assets/styles/components/page-shell' as pageShell;

.workflow-process-definition-page {
  @include pageShell.tree-table-crud-page;
}
</style>
