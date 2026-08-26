<template>
  <div class="workflow-task-page app-container">
    <el-card shadow="never">
      <el-form :inline="true" :model="query" @submit.prevent="load">
        <el-form-item label="流程名称"><el-input v-model="query.flowName" clearable /></el-form-item>
        <el-form-item label="任务节点"><el-input v-model="query.nodeName" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="search">搜索</el-button></el-form-item>
        <el-form-item><el-button @click="reset">重置</el-button></el-form-item>
        <el-form-item v-if="canFilterUsers"><el-button @click="userSelect?.open()">选择申请人</el-button></el-form-item>
      </el-form>
      <el-alert v-if="failure" :title="failure" type="error" show-icon :closable="false" />
      <el-table v-loading="loading" :data="rows" row-key="id" @selection-change="selection = $event">
        <el-table-column v-if="mode === 'all-waiting'" type="selection" width="48" />
        <el-table-column prop="businessCode" label="业务编号" />
        <el-table-column prop="businessTitle" label="业务标题" />
        <el-table-column prop="flowName" label="流程名称" />
        <el-table-column prop="nodeName" label="当前节点" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" fixed="right" min-width="190">
          <template #default="scope">
            <el-button link type="primary" @click="openTask(scope.row)">
              {{ mode === 'waiting' ? '办理' : '查看' }}
            </el-button>
            <el-button
              v-if="mode === 'all-waiting'"
              v-hasPermi="['workflow:task:edit']"
              link
              type="primary"
              @click="urge(scope.row)"
            >
              催办
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
        @size-change="load"
      />
      <div v-if="mode === 'all-waiting'" class="batch-actions">
        <el-button
          v-hasPermi="['workflow:task:edit']"
          :disabled="selection.length === 0"
          @click="assigneeSelect?.open()"
        >
          修改办理人
        </el-button>
      </div>
    </el-card>
    <UserSelect v-if="canFilterUsers" ref="userSelect" :service="runtime.service" @confirm="filterUsers" />
    <UserSelect ref="assigneeSelect" :service="runtime.service" :multiple="false" @confirm="assign" />
  </div>
</template>

<script setup lang="ts">
import type { TaskQuery, UserSummary, WorkflowTask } from '@namewta/domain-workflow';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { WorkflowWebRuntime } from '../runtime';
import UserSelect from '../components/UserSelect.vue';

type Mode = 'waiting' | 'finished' | 'copy' | 'all-waiting';
const props = defineProps<{ mode: Mode; runtime: WorkflowWebRuntime }>();
const router = useRouter();
const query = reactive<TaskQuery>({ pageNum: 1, pageSize: 10, flowName: '', nodeName: '' });
const rows = ref<WorkflowTask[]>([]);
const total = ref(0);
const loading = ref(false);
const failure = ref('');
const selection = ref<WorkflowTask[]>([]);
const userSelect = ref<InstanceType<typeof UserSelect>>();
const assigneeSelect = ref<InstanceType<typeof UserSelect>>();
const canFilterUsers = computed(() => props.mode !== 'copy');

const loaders = {
  waiting: props.runtime.service.pageTaskWaiting,
  finished: props.runtime.service.pageTaskFinished,
  copy: props.runtime.service.pageTaskCopies,
  'all-waiting': props.runtime.service.pageAllTaskWaiting
};

async function load() {
  loading.value = true;
  failure.value = '';
  try {
    const response = await loaders[props.mode](query);
    rows.value = response.data?.rows ?? [];
    total.value = response.data?.total ?? 0;
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : '任务查询失败';
  } finally {
    loading.value = false;
  }
}

function search() {
  query.pageNum = 1;
  void load();
}
function reset() {
  Object.assign(query, { pageNum: 1, flowName: '', nodeName: '', createByIds: undefined });
  void load();
}
function filterUsers(users: UserSummary[]) {
  query.createByIds = users.map(user => user.userId);
  search();
}
function openTask(row: unknown) {
  const task = row as WorkflowTask;
  void router.push({
    path: task.formPath,
    query: { id: task.businessId, taskId: String(task.id), type: props.mode === 'waiting' ? 'todo' : 'view' }
  });
}
async function urge(row: unknown) {
  const task = row as WorkflowTask;
  try {
    await props.runtime.service.urgeTask({ taskId: task.id });
    props.runtime.success('催办成功');
  } catch (error: unknown) {
    props.runtime.error(error instanceof Error ? error.message : '催办失败');
  }
}
async function assign(users: UserSummary[]) {
  const user = users[0];
  if (!user) return;
  try {
    await props.runtime.service.updateAssignee(
      selection.value.map(task => String(task.id)),
      user.userId
    );
    props.runtime.success('办理人修改成功');
    await load();
  } catch (error: unknown) {
    props.runtime.error(error instanceof Error ? error.message : '办理人修改失败');
  }
}

void load();
</script>

<style scoped>
.workflow-task-page .el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
.batch-actions {
  margin-top: 12px;
}
</style>
