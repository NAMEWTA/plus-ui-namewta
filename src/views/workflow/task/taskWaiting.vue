<template><WorkflowPage /></template>
<script setup name="taskWaiting" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadWorkflowRuntimePage } from '../runtime';
const WorkflowPage = defineAsyncComponent(() => loadWorkflowRuntimePage('workflow/task/taskWaiting'));
</script>
