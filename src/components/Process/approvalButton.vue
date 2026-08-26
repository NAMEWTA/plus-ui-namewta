<template>
  <WorkflowApprovalButton v-bind="$attrs" :runtime="adminWorkflowWebRuntime">
    <slot />
  </WorkflowApprovalButton>
</template>
<script setup lang="ts">
import { WorkflowApprovalButton } from '@namewta/web-domain-workflow';
import { adminWorkflowWebRuntime } from '@/router/adminManifestRegistry';
defineOptions({ inheritAttrs: false });
</script>
