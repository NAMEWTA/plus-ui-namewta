<template>
  <TreePage />
</template>

<script setup name="Tree" lang="ts">
import { loadTreePage } from '@namewta/web-domain-demo';
import { defineAsyncComponent } from 'vue';
import { demoWebRuntime } from '@/views/demo/runtime';

const TreePage = defineAsyncComponent(() => loadTreePage(demoWebRuntime));
</script>
