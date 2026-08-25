<template>
  <MissingDemoPage />
</template>

<script setup name="DemoManifestMissing" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadDemoRouteView } from '@/views/demo/runtime';

const MissingDemoPage = defineAsyncComponent(() => loadDemoRouteView('demo/missing/index'));
</script>
