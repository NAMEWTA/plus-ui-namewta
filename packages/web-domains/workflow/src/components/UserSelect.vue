<template>
  <el-dialog v-model="visible" title="选择用户" width="760px" destroy-on-close>
    <el-form :inline="true" :model="query" @submit.prevent="load">
      <el-form-item label="用户名称"><el-input v-model="query.userName" clearable /></el-form-item>
      <el-form-item><el-button type="primary" @click="load">搜索</el-button></el-form-item>
    </el-form>
    <el-alert v-if="failure" :title="failure" type="error" show-icon :closable="false" />
    <el-table v-loading="loading" :data="rows" row-key="userId" @selection-change="select">
      <el-table-column type="selection" width="48" :selectable="() => multiple || selected.length === 0" />
      <el-table-column prop="userName" label="用户名称" />
      <el-table-column prop="nickName" label="用户昵称" />
      <el-table-column prop="deptName" label="部门" />
    </el-table>
    <el-pagination
      v-model:current-page="query.pageNum"
      v-model:page-size="query.pageSize"
      :total="total"
      layout="prev, pager, next, total"
      @current-change="load"
    />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="selected.length === 0" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { UserSummary, WorkflowDefinitionService } from '@namewta/domain-workflow';
import { reactive, ref } from 'vue';

const props = withDefaults(defineProps<{ multiple?: boolean; service: WorkflowDefinitionService }>(), {
  multiple: true
});
const emit = defineEmits<{ confirm: [users: UserSummary[]] }>();
const visible = ref(false);
const loading = ref(false);
const failure = ref('');
const rows = ref<UserSummary[]>([]);
const selected = ref<UserSummary[]>([]);
const total = ref(0);
const query = reactive({ pageNum: 1, pageSize: 10, userName: '' });

async function load() {
  loading.value = true;
  failure.value = '';
  try {
    const response = await props.service.users.list({ ...query });
    rows.value = response.data.rows;
    total.value = response.data.total;
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : '用户查询失败';
  } finally {
    loading.value = false;
  }
}

function select(users: UserSummary[]) {
  selected.value = props.multiple ? users : users.slice(-1);
}

function confirm() {
  emit('confirm', [...selected.value]);
  visible.value = false;
}

async function open() {
  visible.value = true;
  await load();
}

defineExpose({ open });
</script>
