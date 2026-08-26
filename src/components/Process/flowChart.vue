<template><WorkflowFlowChart v-bind="$attrs" :runtime="adminWorkflowWebRuntime" /></template>
<script setup lang="ts">
import { WorkflowFlowChart } from '@namewta/web-domain-workflow';
import { adminWorkflowWebRuntime } from '@/router/adminManifestRegistry';
defineOptions({ inheritAttrs: false });
</script>
