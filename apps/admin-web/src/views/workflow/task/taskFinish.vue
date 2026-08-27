<template><WorkflowPage /></template>
<script setup name="taskFinish" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadWorkflowRuntimePage } from '../runtime';
const WorkflowPage = defineAsyncComponent(() => loadWorkflowRuntimePage('workflow/task/taskFinish'));
</script>
