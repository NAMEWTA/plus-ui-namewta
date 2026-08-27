<template><WorkflowPage /></template>
<script setup name="myDocument" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadWorkflowRuntimePage } from '../runtime';
const WorkflowPage = defineAsyncComponent(() => loadWorkflowRuntimePage('workflow/task/myDocument'));
</script>
