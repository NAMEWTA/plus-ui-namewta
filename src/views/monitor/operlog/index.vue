<template><OperationsOperationLogPage :runtime="adminOperationsWebRuntime" /></template>
<script setup name="Operlog" lang="ts">
import { OperationsOperationLogPage } from '@namewta/web-domain-operations/pages';
import { adminOperationsWebRuntime } from '@/router/adminManifestRegistry';
</script>
