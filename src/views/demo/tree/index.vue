<template>
  <TreePage />
</template>

<script setup name="Tree" lang="ts">
import { defineAsyncComponent } from 'vue';
import { loadDemoRouteView } from '@/views/demo/runtime';

const TreePage = defineAsyncComponent(() => loadDemoRouteView('demo/tree/index'));
</script>
