<template><OperationsNotificationDetailDrawer ref="drawer" :runtime="adminOperationsWebRuntime" /></template>
<script setup lang="ts">
import { OperationsNotificationDetailDrawer } from '@namewta/web-domain-operations/pages';
import { ref } from 'vue';
import { adminOperationsWebRuntime } from '@/router/adminManifestRegistry';
const drawer = ref<InstanceType<typeof OperationsNotificationDetailDrawer>>();
defineExpose({ openDrawer: (id: string | number) => drawer.value?.openDrawer(id) });
</script>
