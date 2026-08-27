<template><OperationsExternalMonitorPage :runtime="adminOperationsWebRuntime" target="snail-ai" /></template>
<script setup name="SnailAi" lang="ts">
import { OperationsExternalMonitorPage } from '@namewta/web-domain-operations/pages';
import { adminOperationsWebRuntime } from '@/router/adminManifestRegistry';
</script>
