<template><WorkflowMessageType ref="message" v-bind="$attrs" /></template>
<script setup lang="ts">
import { WorkflowMessageType } from '@namewta/web-domain-workflow';
import { ref } from 'vue';
defineOptions({ inheritAttrs: false });
const message = ref<InstanceType<typeof WorkflowMessageType>>();
const open = () => message.value?.open();
const close = () => message.value?.close();
defineExpose({ open, close });
</script>
