<template>
  <SystemRoleSelectUser ref="child" :runtime="adminSystemAdminWebRuntime" :role-id="roleId" @ok="emit('ok')" />
</template>
<script setup name="SelectUser" lang="ts">
import { SystemRoleSelectUser } from '@namewta/web-domain-system-admin/pages';
import { adminSystemAdminWebRuntime } from '@/router/adminManifestRegistry';
const { roleId } = defineProps<{ roleId: string | number }>();
const emit = defineEmits<{ ok: [] }>();
const child = ref<{ show(): void }>();
defineExpose({ show: () => child.value?.show() });
</script>
