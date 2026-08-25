<template>
  <el-col :lg="grid.panelSpan" :xs="24">
    <el-card v-if="!collapsed" shadow="hover">
      <template #header>
        <div @click="$emit('update:collapsed', true)">
          <h3>{{ title }}</h3>
        </div>
      </template>
      <el-input v-model="filter" :placeholder="placeholder" clearable />
      <el-tree
        ref="tree"
        :data="data"
        :node-key="nodeKey"
        :props="treeProps"
        :filter-node-method="filterNode"
        @node-click="onNodeClick"
      />
    </el-card>
    <el-button v-else @click="$emit('update:collapsed', false)">展开</el-button>
  </el-col>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { matchesTreePanelFilter, resolveTreePanelGrid } from '../tree';
const props = withDefaults(
  defineProps<{
    title: string;
    placeholder?: string;
    data: Record<string, unknown>[];
    collapsed?: boolean;
    nodeKey?: string;
    treeProps?: Record<string, string>;
    disabledField?: string;
    expandedSpan?: number;
    collapsedSpan?: number;
    filterField?: string;
    filterNodeMethod?: (value: string, data: Record<string, unknown>) => boolean;
  }>(),
  {
    placeholder: '请输入名称',
    collapsed: false,
    nodeKey: 'id',
    treeProps: () => ({ label: 'label', children: 'children' }),
    disabledField: 'disabled',
    expandedSpan: 5,
    collapsedSpan: 1,
    filterField: 'label'
  }
);
const emit = defineEmits<{ 'update:collapsed': [boolean]; 'node-click': [any, any, any] }>();
const filter = ref('');
const tree = ref<{ filter(value: string): void; setCurrentKey(key?: string): void }>();
const grid = computed(() => resolveTreePanelGrid(props.collapsed, props.expandedSpan, props.collapsedSpan));
watch(filter, value => tree.value?.filter(value));
const filterNode = (value: string, data: Record<string, unknown>) => {
  if (props.filterNodeMethod) return props.filterNodeMethod(value, data);
  return matchesTreePanelFilter(value, data, props.filterField);
};
const onNodeClick = (data: any, node: any, component: any) => {
  if (props.disabledField && data?.[props.disabledField]) return;
  emit('node-click', data, node, component);
};
defineExpose({
  treeRef: tree,
  setCurrentKey: (key?: string) => tree.value?.setCurrentKey(key),
  contentSpan: computed(() => grid.value.contentSpan)
});
</script>
