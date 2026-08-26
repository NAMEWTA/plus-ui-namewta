<template>
  <div class="workflow-leave-edit-page app-container">
    <el-card shadow="never">
      <template #header>请假申请</template>
      <el-alert v-if="failure" :title="failure" type="error" show-icon :closable="false" />
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="form.leaveType" :disabled="readonly">
            <el-option label="事假" value="1" />
            <el-option label="病假" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="请假天数" prop="leaveDays">
          <el-input-number v-model="form.leaveDays" :min="1" :disabled="readonly" />
        </el-form-item>
        <el-form-item label="请假原因" prop="remark">
          <el-input v-model="form.remark" type="textarea" :disabled="readonly" />
        </el-form-item>
      </el-form>
      <div v-if="!readonly" class="actions">
        <el-button :loading="saving" @click="save">保存</el-button>
        <el-button type="primary" :loading="saving" @click="submit">提交审批</el-button>
      </div>
      <template v-if="taskId && !readonly">
        <el-divider content-position="left">审批办理</el-divider>
        <el-form label-width="100px">
          <el-form-item label="审批意见"><el-input v-model="approvalMessage" type="textarea" /></el-form-item>
          <el-form-item label="抄送人">
            <el-tag v-for="user in copyUsers" :key="String(user.userId)">{{ user.nickName }}</el-tag>
            <el-button circle @click="userSelect?.open()">+</el-button>
          </el-form-item>
        </el-form>
        <div class="actions">
          <el-button :loading="approving" type="danger" @click="rejectTask">驳回</el-button>
          <el-button :loading="approving" type="primary" @click="approveTask">同意</el-button>
        </div>
        <UserSelect ref="userSelect" :service="runtime.service" @confirm="copyUsers = $event" />
      </template>
      <el-divider v-if="id" content-position="left">流程记录</el-divider>
      <el-timeline v-if="id">
        <el-timeline-item
          v-for="item in history"
          :key="String(item.id ?? item.nodeName)"
          :timestamp="String(item.createTime ?? '')"
        >
          {{ item.nodeName ?? item.message ?? '流程记录' }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { LeaveForm, UserSummary } from '@namewta/domain-workflow';
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { WorkflowWebRuntime } from '../runtime';
import UserSelect from '../components/UserSelect.vue';

const props = defineProps<{ runtime: WorkflowWebRuntime }>();
const route = useRoute();
const id = computed(() => String(route.query.id ?? ''));
const taskId = computed(() => String(route.query.taskId ?? ''));
const readonly = computed(() => route.query.type === 'view');
const formRef = ref<{ validate: () => Promise<boolean> }>();
const form = reactive<LeaveForm>({ leaveType: '', startDate: '', endDate: '', leaveDays: 1, remark: '' });
const rules = {
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  remark: [{ required: true, message: '请输入请假原因', trigger: 'blur' }]
};
const saving = ref(false);
const failure = ref('');
const history = ref<Record<string, unknown>[]>([]);
const approvalMessage = ref('');
const approving = ref(false);
const copyUsers = ref<UserSummary[]>([]);
const userSelect = ref<InstanceType<typeof UserSelect>>();

async function load() {
  if (!id.value) return;
  try {
    const [leave, records] = await Promise.all([
      props.runtime.service.getLeave(id.value),
      props.runtime.service.flowHistory(id.value)
    ]);
    Object.assign(form, leave.data);
    history.value = records.data?.list ?? [];
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : '请假详情加载失败';
  }
}
async function persist(submitFlow: boolean) {
  await formRef.value?.validate();
  saving.value = true;
  failure.value = '';
  try {
    const response = submitFlow
      ? await props.runtime.service.submitLeave({ ...form })
      : form.id
        ? await props.runtime.service.updateLeave({ ...form })
        : await props.runtime.service.addLeave({ ...form });
    Object.assign(form, response.data);
    props.runtime.success(submitFlow ? '提交成功' : '保存成功');
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : submitFlow ? '提交失败' : '保存失败';
  } finally {
    saving.value = false;
  }
}
function save() {
  return persist(false);
}
function submit() {
  return persist(true);
}
async function handleTask(action: 'approve' | 'reject') {
  approving.value = true;
  failure.value = '';
  const payload = {
    taskId: taskId.value,
    message: approvalMessage.value,
    flowCopyList: copyUsers.value.map(({ userId, nickName }) => ({ userId, nickName }))
  };
  try {
    if (action === 'approve') await props.runtime.service.completeTask(payload);
    else await props.runtime.service.backProcess(payload);
    props.runtime.success(action === 'approve' ? '办理成功' : '驳回成功');
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : '任务办理失败';
  } finally {
    approving.value = false;
  }
}
function approveTask() {
  return handleTask('approve');
}
function rejectTask() {
  return handleTask('reject');
}
void load();
</script>

<style scoped>
.workflow-leave-edit-page .actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
