<template><OperationsNotificationPage :runtime="adminOperationsWebRuntime" /></template>
<script setup name="NotifyMonitor" lang="ts">
import { OperationsNotificationPage } from '@namewta/web-domain-operations/pages';
import { adminOperationsWebRuntime } from '@/router/adminManifestRegistry';
</script>
