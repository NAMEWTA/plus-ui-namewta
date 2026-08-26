<template><WorkflowApprovalRecord ref="record" v-bind="$attrs" :runtime="adminWorkflowWebRuntime" /></template>
<script setup lang="ts">
import { WorkflowApprovalRecord } from '@namewta/web-domain-workflow';
import { ref } from 'vue';
import { adminWorkflowWebRuntime } from '@/router/adminManifestRegistry';
defineOptions({ inheritAttrs: false });
const record = ref<InstanceType<typeof WorkflowApprovalRecord>>();
const init = (businessId: string | number) => record.value?.init(businessId);
defineExpose({ init });
</script>
