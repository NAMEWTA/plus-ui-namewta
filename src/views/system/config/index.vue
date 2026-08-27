<template><SystemConfigPage :runtime="adminSystemAdminWebRuntime" /></template>
<script setup name="Config" lang="ts">
import { SystemConfigPage } from '@namewta/web-domain-system-admin/pages';
import { adminSystemAdminWebRuntime } from '@/router/adminManifestRegistry';
</script>
