<template><WorkflowPage /></template>
<script setup name="WarmFlow" lang="ts">
import { defineAsyncComponent } from 'vue';
import { resolveAdminWebRegistration } from '@/router/adminManifestRegistry';
const WorkflowPage = defineAsyncComponent(async () => {
  const registration = resolveAdminWebRegistration('workflow/processDefinition/design', 'workflow');
  if (!registration) throw new Error('Workflow registration is unavailable: workflow/processDefinition/design');
  return registration.load();
});
</script>
