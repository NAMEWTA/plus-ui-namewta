<template><WorkflowPage /></template>
<script setup name="processInstance" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadWorkflowRuntimePage } from '../runtime';
const WorkflowPage = defineAsyncComponent(() => loadWorkflowRuntimePage('workflow/processInstance/index'));
</script>
