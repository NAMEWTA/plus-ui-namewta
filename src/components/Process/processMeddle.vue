<template>
  <WorkflowProcessActionDialog
    ref="dialog"
    :runtime="adminWorkflowWebRuntime"
    :allow-complete="false"
    mode="intervention"
    :width="width"
    @completed="emit('submitCallback')"
  />
</template>

<script setup lang="ts">
import { WorkflowProcessActionDialog } from '@namewta/web-domain-workflow';
import { ref, toRefs } from 'vue';
import { adminWorkflowWebRuntime } from '@/router/adminManifestRegistry';

const props = withDefaults(defineProps<{ height?: string; width?: string }>(), {
  height: '100%',
  width: '50%'
});
const { width } = toRefs(props);
const emit = defineEmits<{ submitCallback: [] }>();
const dialog = ref<InstanceType<typeof WorkflowProcessActionDialog>>();

const open = (taskId: string | number) => dialog.value?.open(taskId);

defineExpose({ open });
</script>
