<template><WorkflowPage /></template>
<script setup name="Spel" lang="ts">
import { defineAsyncComponent } from 'vue';
import { resolveAdminWebRegistration } from '@/router/adminManifestRegistry';
const WorkflowPage = defineAsyncComponent(async () => {
  const registration = resolveAdminWebRegistration('workflow/spel/index', 'workflow');
  if (!registration) throw new Error('Workflow registration is unavailable: workflow/spel/index');
  return registration.load();
});
</script>
