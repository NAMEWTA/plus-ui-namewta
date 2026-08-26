<template><WorkflowPage /></template>
<script setup name="leaveEdit" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadWorkflowRuntimePage } from '../runtime';
const WorkflowPage = defineAsyncComponent(() => loadWorkflowRuntimePage('workflow/leave/leaveEdit'));
</script>
