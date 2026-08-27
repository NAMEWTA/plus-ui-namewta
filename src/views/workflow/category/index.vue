<template><WorkflowPage /></template>
<script setup name="Category" lang="ts">
import { defineAsyncComponent } from 'vue';
import { resolveAdminWebRegistration } from '@/router/adminManifestRegistry';
const WorkflowPage = defineAsyncComponent(async () => {
  const registration = resolveAdminWebRegistration('workflow/category/index', 'workflow');
  if (!registration) throw new Error('Workflow registration is unavailable: workflow/category/index');
  return registration.load();
});
</script>
