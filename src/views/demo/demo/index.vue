<template>
  <DemoPage />
</template>

<script setup name="Demo" lang="ts">
import { loadDemoPage } from '@namewta/web-domain-demo';
import { defineAsyncComponent } from 'vue';
import { demoWebRuntime } from '@/views/demo/runtime';

const DemoPage = defineAsyncComponent(() => loadDemoPage(demoWebRuntime));
</script>
