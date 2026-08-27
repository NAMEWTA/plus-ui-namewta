<template><OperationsOnlinePage :runtime="adminOperationsWebRuntime" /></template>
<script setup name="Online" lang="ts">
import { OperationsOnlinePage } from '@namewta/web-domain-operations/pages';
import { adminOperationsWebRuntime } from '@/router/adminManifestRegistry';
</script>
