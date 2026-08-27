<template><SystemUserViewDrawer ref="child" :runtime="adminSystemAdminWebRuntime" /></template>
<script setup lang="ts">
import { SystemUserViewDrawer } from '@namewta/web-domain-system-admin/pages';
import { adminSystemAdminWebRuntime } from '@/router/adminManifestRegistry';
const child = ref<{ openDrawer(id: string | number): Promise<void> }>();
defineExpose({ openDrawer: (id: string | number) => child.value?.openDrawer(id) });
</script>
