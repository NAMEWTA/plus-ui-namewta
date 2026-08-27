<template><WorkflowPage /></template>
<script setup name="taskCopyList" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadWorkflowRuntimePage } from '../runtime';
const WorkflowPage = defineAsyncComponent(() => loadWorkflowRuntimePage('workflow/task/taskCopyList'));
</script>
