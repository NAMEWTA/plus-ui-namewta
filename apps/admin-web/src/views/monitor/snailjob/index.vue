<template><OperationsExternalMonitorPage :runtime="adminOperationsWebRuntime" target="snail-job" /></template>
<script setup name="SnailJob" lang="ts">
import { OperationsExternalMonitorPage } from '@namewta/web-domain-operations/pages';
import { adminOperationsWebRuntime } from '@/router/adminManifestRegistry';
</script>
