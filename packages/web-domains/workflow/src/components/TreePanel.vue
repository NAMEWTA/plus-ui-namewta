<template>
  <el-col :lg="collapsed ? 1 : 5" :xs="24">
    <el-card v-if="!collapsed" shadow="hover">
      <template #header>
        <div @click="$emit('update:collapsed', true)">
          <h3>{{ title }}</h3>
        </div>
      </template>
      <el-input v-model="filter" :placeholder="placeholder" clearable />
      <el-tree ref="tree" :data="data" node-key="id" :filter-node-method="filterNode" @node-click="onNodeClick" />
    </el-card>
    <el-button v-else @click="$emit('update:collapsed', false)">展开</el-button>
  </el-col>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
const props = withDefaults(
  defineProps<{ title: string; placeholder?: string; data: Record<string, unknown>[]; collapsed?: boolean }>(),
  { placeholder: '请输入名称', collapsed: false }
);
const emit = defineEmits<{ 'update:collapsed': [boolean]; 'node-click': [any] }>();
const filter = ref('');
const tree = ref<{ filter(value: string): void; setCurrentKey(key?: string): void }>();
watch(filter, value => tree.value?.filter(value));
const filterNode = (value: string, data: Record<string, unknown>) => !value || String(data.label ?? '').includes(value);
const onNodeClick = (data: any) => emit('node-click', data);
defineExpose({ setCurrentKey: (key?: string) => tree.value?.setCurrentKey(key), contentSpan: 19 });
</script>
