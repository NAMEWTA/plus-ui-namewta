<template><WorkflowPage /></template>
<script setup name="allTaskWaiting" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadWorkflowRuntimePage } from '../runtime';
const WorkflowPage = defineAsyncComponent(() => loadWorkflowRuntimePage('workflow/task/allTaskWaiting'));
</script>
