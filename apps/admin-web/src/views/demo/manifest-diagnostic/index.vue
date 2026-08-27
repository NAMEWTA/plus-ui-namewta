<template>
  <ManifestDiagnosticPage />
</template>

<script setup name="DemoManifestDiagnostic" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadDemoRouteView } from '@/views/demo/runtime';

const ManifestDiagnosticPage = defineAsyncComponent(() => loadDemoRouteView('demo/missing/index'));
</script>
