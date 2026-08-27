<template>
  <AiChatPage :runtime="adminAiWebRuntime" />
</template>

<script setup name="AiChatPage" lang="ts">
import { AiChatPage } from '@namewta/web-domain-ai/pages';
import { adminAiWebRuntime } from '@/router/adminManifestRegistry';
</script>
