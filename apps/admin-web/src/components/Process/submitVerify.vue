<template>
  <WorkflowProcessActionDialog
    ref="dialog"
    :runtime="adminWorkflowWebRuntime"
    :task-variables="taskVariables"
    width="50%"
    @completed="emit('submitCallback')"
    @cancelled="emit('cancelCallback')"
  />
</template>

<script setup lang="ts">
import { WorkflowProcessActionDialog } from '@namewta/web-domain-workflow';
import { ref, toRefs } from 'vue';
import { adminWorkflowWebRuntime } from '@/router/adminManifestRegistry';

const props = withDefaults(defineProps<{ taskVariables?: Record<string, unknown> }>(), {
  taskVariables: () => ({})
});
const { taskVariables } = toRefs(props);
const emit = defineEmits<{ cancelCallback: []; submitCallback: [] }>();
const dialog = ref<InstanceType<typeof WorkflowProcessActionDialog>>();

const openDialog = (taskId?: string | number) => (taskId === undefined ? undefined : dialog.value?.open(taskId));

defineExpose({ openDialog });
</script>
