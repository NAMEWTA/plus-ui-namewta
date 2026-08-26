<template><OperationsExternalMonitorPage :runtime="adminOperationsWebRuntime" target="monitor-admin" /></template>
<script setup name="MonitorAdmin" lang="ts">
import { OperationsExternalMonitorPage } from '@namewta/web-domain-operations/pages';
import { adminOperationsWebRuntime } from '@/router/adminManifestRegistry';
</script>
