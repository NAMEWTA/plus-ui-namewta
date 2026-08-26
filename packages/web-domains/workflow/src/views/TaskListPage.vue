<template>
  <div class="workflow-task-page app-container">
    <el-card shadow="never">
      <el-tabs v-if="mode === 'all-waiting'" v-model="allTab" @tab-change="search">
        <el-tab-pane label="待办任务" name="waiting" />
        <el-tab-pane label="已办任务" name="finished" />
      </el-tabs>
      <el-form :inline="true" :model="query" @submit.prevent="load">
        <el-form-item label="流程名称"><el-input v-model="query.flowName" clearable /></el-form-item>
        <el-form-item label="任务节点"><el-input v-model="query.nodeName" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="search">搜索</el-button></el-form-item>
        <el-form-item><el-button @click="reset">重置</el-button></el-form-item>
        <el-form-item v-if="canFilterUsers"><el-button @click="userSelect?.open()">选择申请人</el-button></el-form-item>
      </el-form>
      <el-alert v-if="failure" :title="failure" type="error" show-icon :closable="false" />
      <el-table v-loading="loading" :data="rows" row-key="id" @selection-change="selection = $event">
        <el-table-column v-if="mode === 'all-waiting' && allTab === 'waiting'" type="selection" width="48" />
        <el-table-column prop="businessCode" label="业务编号" />
        <el-table-column prop="businessTitle" label="业务标题" />
        <el-table-column prop="flowName" label="流程名称" />
        <el-table-column prop="nodeName" label="当前节点" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" fixed="right" min-width="190">
          <template #default="scope">
            <el-button link type="primary" @click="openTask(scope.row)">
              {{ isActionable ? '办理' : '查看' }}
            </el-button>
            <el-button
              v-if="mode === 'all-waiting' && allTab === 'waiting'"
              v-hasPermi="['workflow:task:edit']"
              link
              type="primary"
              @click="openUrge([scope.row])"
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
      <div v-if="mode === 'all-waiting' && allTab === 'waiting'" class="batch-actions">
        <el-button
          v-hasPermi="['workflow:task:edit']"
          :disabled="selection.length === 0"
          @click="assigneeSelect?.open()"
        >
          修改办理人
        </el-button>
        <el-button v-hasPermi="['workflow:task:edit']" :disabled="selection.length === 0" @click="openUrge(selection)">
          批量催办
        </el-button>
        <el-button
          v-hasPermi="['workflow:task:edit']"
          :disabled="selection.length !== 1"
          type="warning"
          @click="openIntervention"
        >
          流程干预
        </el-button>
      </div>
    </el-card>
    <UserSelect v-if="canFilterUsers" ref="userSelect" :service="runtime.service" @confirm="filterUsers" />
    <UserSelect ref="assigneeSelect" :service="runtime.service" :multiple="false" @confirm="assign" />
    <el-dialog v-model="urgeVisible" title="任务催办" width="480px">
      <el-input v-model="urgeMessage" type="textarea" :rows="4" placeholder="请输入催办消息" />
      <template #footer>
        <el-button @click="urgeVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!urgeMessage.trim()" @click="urge">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="interventionVisible" title="流程干预" width="480px">
      <el-input v-model="interventionMessage" type="textarea" :rows="4" placeholder="请输入终止原因" />
      <template #footer>
        <el-button @click="interventionVisible = false">取消</el-button>
        <el-button type="danger" :disabled="!interventionMessage.trim()" @click="terminate">终止任务</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { TaskQuery, UserSummary, WorkflowTask } from '@namewta/domain-workflow';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { WorkflowWebRuntime } from '../runtime';
import UserSelect from '../components/UserSelect.vue';
import { createUrgePayload } from '../runtime-actions';

type Mode = 'waiting' | 'finished' | 'copy' | 'all-waiting';
const props = defineProps<{ mode: Mode; runtime: WorkflowWebRuntime }>();
const router = useRouter();
const query = reactive<TaskQuery>({ pageNum: 1, pageSize: 10, flowName: '', nodeName: '' });
const rows = ref<WorkflowTask[]>([]);
const total = ref(0);
const loading = ref(false);
const failure = ref('');
const selection = ref<WorkflowTask[]>([]);
const allTab = ref<'waiting' | 'finished'>('waiting');
const urgeVisible = ref(false);
const urgeMessage = ref('');
const urgeTasks = ref<WorkflowTask[]>([]);
const interventionVisible = ref(false);
const interventionMessage = ref('');
const userSelect = ref<InstanceType<typeof UserSelect>>();
const assigneeSelect = ref<InstanceType<typeof UserSelect>>();
const canFilterUsers = computed(() => props.mode !== 'copy');
const isActionable = computed(
  () => props.mode === 'waiting' || (props.mode === 'all-waiting' && allTab.value === 'waiting')
);

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
    const loader =
      props.mode === 'all-waiting' && allTab.value === 'finished'
        ? props.runtime.service.pageAllTaskFinished
        : loaders[props.mode];
    const response = await loader(query);
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
    query: { id: task.businessId, taskId: String(task.id), type: isActionable.value ? 'approval' : 'view' }
  });
}
function openUrge(tasks: readonly unknown[]) {
  urgeTasks.value = tasks as WorkflowTask[];
  urgeMessage.value = '';
  urgeVisible.value = true;
}
async function urge() {
  try {
    await props.runtime.service.urgeTask(
      createUrgePayload(
        urgeTasks.value.map(task => task.id),
        urgeMessage.value
      )
    );
    props.runtime.success('催办成功');
    urgeVisible.value = false;
  } catch (error: unknown) {
    props.runtime.error(error instanceof Error ? error.message : '催办失败');
  }
}
function openIntervention() {
  interventionMessage.value = '';
  interventionVisible.value = true;
}
async function terminate() {
  const task = selection.value[0];
  if (!task) return;
  try {
    await props.runtime.service.terminateTask({ taskId: task.id, message: interventionMessage.value.trim() });
    props.runtime.success('任务已终止');
    interventionVisible.value = false;
    await load();
  } catch (error: unknown) {
    props.runtime.error(error instanceof Error ? error.message : '任务终止失败');
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
