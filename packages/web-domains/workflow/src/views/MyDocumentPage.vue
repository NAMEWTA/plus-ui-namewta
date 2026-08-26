<template>
  <div class="workflow-document-page app-container">
    <el-card shadow="never">
      <el-form :inline="true" :model="query">
        <el-form-item label="流程名称"><el-input v-model="query.flowName" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="search">搜索</el-button></el-form-item>
      </el-form>
      <el-alert v-if="failure" :title="failure" type="error" show-icon :closable="false" />
      <el-table v-loading="loading" :data="rows" row-key="id">
        <el-table-column prop="businessCode" label="业务编号" />
        <el-table-column prop="businessTitle" label="业务标题" />
        <el-table-column prop="flowName" label="流程名称" />
        <el-table-column prop="flowStatusName" label="状态" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button link type="primary" @click="open(scope.row)">查看</el-button>
            <el-button v-if="scope.row.flowStatus === 'waiting'" link type="danger" @click="cancel(scope.row)">
              撤销
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="query.pageNum" :total="total" @current-change="load" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { InstanceQuery, WorkflowInstance } from '@namewta/domain-workflow';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { WorkflowWebRuntime } from '../runtime';

const props = defineProps<{ runtime: WorkflowWebRuntime }>();
const router = useRouter();
const query = reactive<InstanceQuery>({ pageNum: 1, pageSize: 10, flowName: '' });
const rows = ref<WorkflowInstance[]>([]);
const total = ref(0);
const loading = ref(false);
const failure = ref('');
async function load() {
  loading.value = true;
  failure.value = '';
  try {
    const response = await props.runtime.service.pageCurrentInstances(query);
    rows.value = response.data?.rows ?? [];
    total.value = response.data?.total ?? 0;
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : '单据查询失败';
  } finally {
    loading.value = false;
  }
}
function search() {
  query.pageNum = 1;
  void load();
}
function open(row: unknown) {
  const instance = row as WorkflowInstance;
  const task = instance.flowTaskList?.[0];
  if (task?.formPath) void router.push({ path: task.formPath, query: { id: instance.businessId, type: 'view' } });
}
async function cancel(row: unknown) {
  const instance = row as WorkflowInstance;
  try {
    await props.runtime.confirm(`确认撤销“${instance.businessTitle}”吗？`);
    await props.runtime.service.cancelProcess({ businessId: instance.businessId });
    props.runtime.success('撤销成功');
    await load();
  } catch (error: unknown) {
    if (error instanceof Error) props.runtime.error(error.message);
  }
}
void load();
</script>
