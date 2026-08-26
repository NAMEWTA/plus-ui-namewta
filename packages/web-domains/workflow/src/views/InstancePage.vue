<template>
  <div class="workflow-instance-page app-container">
    <el-card shadow="never">
      <el-tabs v-model="tab" @tab-change="search">
        <el-tab-pane label="运行中" name="running" />
        <el-tab-pane label="已结束" name="finished" />
      </el-tabs>
      <el-form :inline="true" :model="query">
        <el-form-item label="流程名称"><el-input v-model="query.flowName" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="search">搜索</el-button></el-form-item>
        <el-form-item><el-button @click="userSelect?.open()">选择申请人</el-button></el-form-item>
      </el-form>
      <el-alert v-if="failure" :title="failure" type="error" show-icon :closable="false" />
      <el-table v-loading="loading" :data="rows" row-key="id" @selection-change="selection = $event">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="businessCode" label="业务编号" />
        <el-table-column prop="businessTitle" label="业务标题" />
        <el-table-column prop="flowName" label="流程名称" />
        <el-table-column prop="flowStatusName" label="流程状态" />
        <el-table-column label="操作" fixed="right" min-width="170">
          <template #default="scope">
            <el-button link type="primary" @click="openInstance(scope.row)">查看</el-button>
            <el-button
              v-if="tab === 'running'"
              v-hasPermi="['workflow:instance:invalid']"
              link
              type="danger"
              @click="invalidate(scope.row)"
            >
              作废
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="load"
      />
      <el-button
        v-hasPermi="['workflow:instance:remove']"
        :disabled="selection.length === 0"
        type="danger"
        @click="removeSelected"
      >
        删除
      </el-button>
    </el-card>
    <UserSelect ref="userSelect" :service="runtime.service" @confirm="filterUsers" />
  </div>
</template>

<script setup lang="ts">
import type { InstanceQuery, UserSummary, WorkflowInstance } from '@namewta/domain-workflow';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { WorkflowWebRuntime } from '../runtime';
import UserSelect from '../components/UserSelect.vue';

const props = defineProps<{ runtime: WorkflowWebRuntime }>();
const router = useRouter();
const tab = ref<'running' | 'finished'>('running');
const query = reactive<InstanceQuery>({ pageNum: 1, pageSize: 10, flowName: '' });
const rows = ref<WorkflowInstance[]>([]);
const selection = ref<WorkflowInstance[]>([]);
const total = ref(0);
const loading = ref(false);
const failure = ref('');
const userSelect = ref<InstanceType<typeof UserSelect>>();

async function load() {
  loading.value = true;
  failure.value = '';
  try {
    const response = await (tab.value === 'running'
      ? props.runtime.service.pageRunningInstances(query)
      : props.runtime.service.pageFinishedInstances(query));
    rows.value = response.data?.rows ?? [];
    total.value = response.data?.total ?? 0;
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : '流程实例查询失败';
  } finally {
    loading.value = false;
  }
}
function search() {
  query.pageNum = 1;
  void load();
}
function filterUsers(users: UserSummary[]) {
  query.createByIds = users.map(user => user.userId);
  search();
}
function openInstance(row: unknown) {
  const instance = row as WorkflowInstance;
  const task = instance.flowTaskList?.[0];
  if (!task?.formPath) return;
  void router.push({ path: task.formPath, query: { id: instance.businessId, type: 'view' } });
}
async function invalidate(row: unknown) {
  const instance = row as WorkflowInstance;
  try {
    await props.runtime.confirm(`确认作废流程“${instance.businessTitle}”吗？`);
    await props.runtime.service.invalidateInstance({ instanceId: instance.id });
    props.runtime.success('流程已作废');
    await load();
  } catch (error: unknown) {
    if (error instanceof Error) props.runtime.error(error.message);
  }
}
async function removeSelected() {
  const ids = selection.value.map(item => item.id);
  if (!ids.length) return;
  try {
    await props.runtime.confirm('确认删除选中的流程实例吗？');
    if (tab.value === 'running') await props.runtime.service.deleteInstances(ids);
    else await props.runtime.service.deleteHistoricInstances(ids);
    props.runtime.success('删除成功');
    await load();
  } catch (error: unknown) {
    if (error instanceof Error) props.runtime.error(error.message);
  }
}
void load();
</script>

<style scoped>
.workflow-instance-page .el-pagination {
  margin: 16px 0;
  justify-content: flex-end;
}
</style>
