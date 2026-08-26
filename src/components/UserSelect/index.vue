<template>
  <WorkflowUserSelect ref="selector" :service="workflowService" :multiple="multiple" @confirm="confirm" />
</template>

<script setup lang="ts">
import type { UserSummary } from '@namewta/domain-workflow';
import { WorkflowUserSelect } from '@namewta/web-domain-workflow';
import { ref } from 'vue';
import { workflowService } from '@/api/workflow/runtime';

withDefaults(
  defineProps<{
    data?: string | number | readonly (string | number)[];
    modelValue?: UserSummary | UserSummary[];
    multiple?: boolean;
    userIds?: string | number | readonly (string | number)[];
  }>(),
  { data: undefined, modelValue: undefined, multiple: true, userIds: undefined }
);
const emit = defineEmits<{
  'confirm-call-back': [users: UserSummary[]];
  confirmCallBack: [users: UserSummary[]];
  'update:modelValue': [users: UserSummary[]];
}>();
const selector = ref<InstanceType<typeof WorkflowUserSelect>>();
function confirm(users: UserSummary[]) {
  emit('update:modelValue', users);
  emit('confirm-call-back', users);
  emit('confirmCallBack', users);
}
function open() {
  return selector.value?.open();
}
defineExpose({ open });
</script>
