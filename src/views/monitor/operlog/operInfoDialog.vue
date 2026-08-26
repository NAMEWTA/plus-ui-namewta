<template><OperationsOperationInfoDialog ref="dialog" :runtime="adminOperationsWebRuntime" /></template>
<script setup lang="ts">
import { OperationsOperationInfoDialog } from '@namewta/web-domain-operations/pages';
import { ref } from 'vue';
import type { OperLogForm } from '@/api/monitor/operlog/types';
import { adminOperationsWebRuntime } from '@/router/adminManifestRegistry';
const dialog = ref<InstanceType<typeof OperationsOperationInfoDialog>>();
defineExpose({
  openDialog: (row: OperLogForm) => dialog.value?.openDialog(row),
  closeDialog: () => dialog.value?.closeDialog()
});
</script>
