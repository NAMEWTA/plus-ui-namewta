<template>
  <DemoPage />
</template>

<script setup name="Demo" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadDemoRouteView } from '@/views/demo/runtime';

const DemoPage = defineAsyncComponent(() => loadDemoRouteView('demo/demo/index'));
</script>
