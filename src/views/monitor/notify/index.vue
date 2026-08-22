<template>
  <div class="p-2 app-container monitor-notify-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div>
              <span class="panel-kicker">Search Filters</span>
              <h3>筛选条件</h3>
            </div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="请求编号" prop="requestId">
            <el-input
              v-model="queryParams.requestId"
              placeholder="请输入请求编号"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="业务类型" prop="bizType">
            <el-input v-model="queryParams.bizType" placeholder="请输入业务类型" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="业务编号" prop="bizId">
            <el-input v-model="queryParams.bizId" placeholder="请输入业务编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="渠道" prop="channel">
            <el-select v-model="queryParams.channel" placeholder="请选择渠道" clearable>
              <el-option label="邮件" value="mail" />
              <el-option label="短信" value="sms" />
            </el-select>
          </el-form-item>
          <el-form-item label="Provider" prop="providerKey">
            <el-input
              v-model="queryParams.providerKey"
              placeholder="请输入 Provider"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option label="已接受" value="ACCEPTED" />
              <el-option label="部分失败" value="PARTIAL_FAILURE" />
              <el-option label="失败" value="FAILED" />
              <el-option label="幂等跳过" value="SKIPPED_DUPLICATE" />
            </el-select>
          </el-form-item>
          <el-form-item label="Provider 消息" prop="providerMessageId">
            <el-input
              v-model="queryParams.providerMessageId"
              placeholder="请输入 Provider 消息编号"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="来源 Client PK" prop="clientPk">
            <el-input
              v-model="queryParams.clientPk"
              placeholder="请输入来源 Client PK"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="发生时间" class="date-range-item">
            <el-date-picker
              v-model="dateRange"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="toolbar-shell">
          <div class="table-heading">
            <span class="panel-kicker">Notification Monitor</span>
            <h3>通知监控</h3>
          </div>
          <div class="toolbar-actions">
            <el-button
              v-hasPermi="['system:notify:remove']"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
            >
              删除
            </el-button>
            <el-button
              v-hasPermi="['system:notify:remove']"
              type="danger"
              plain
              icon="WarnTriangleFilled"
              @click="handleClean"
            >
              清空
            </el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList" />
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="notifyList"
        class="data-table"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="日志编号" prop="notifyLogId" width="180" show-overflow-tooltip />
        <el-table-column label="业务" min-width="180" show-overflow-tooltip>
          <template #default="scope">{{ businessLabel(scope.row.bizType, scope.row.bizId) }}</template>
        </el-table-column>
        <el-table-column label="渠道" prop="channel" width="90" align="center" />
        <el-table-column label="Provider" prop="providerKey" width="120" show-overflow-tooltip />
        <el-table-column label="脱敏目标" min-width="190" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.maskedTargets?.join(', ') || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="145" align="center">
          <template #default="scope">
            <el-tag :type="statusType(scope.row.status)" size="small" effect="light">
              {{ scope.row.status || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源 Client PK" prop="clientPk" width="150" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.clientPk ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="错误" min-width="180" show-overflow-tooltip>
          <template #default="scope">{{ errorLabel(scope.row.errorCode, scope.row.errorMessage) }}</template>
        </el-table-column>
        <el-table-column label="发生时间" prop="createTime" width="180">
          <template #default="scope">{{ parseTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="104" align="center" class-name="small-padding">
          <template #default="scope">
            <el-tooltip content="详情" placement="top">
              <el-button
                v-hasPermi="['system:notify:query']"
                link
                type="primary"
                icon="View"
                @click="handleView(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['system:notify:remove']"
                link
                type="danger"
                icon="Delete"
                @click="handleDelete(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <DetailDrawer ref="detailDrawerRef" />
  </div>
</template>

<script setup name="NotifyMonitor" lang="ts">
import type { NotifyListVO, NotifyQuery } from '@/api/monitor/notify/types';
import { cleanNotify, delNotify, listNotify } from '@/api/monitor/notify';
import { useLoading } from '@/hooks/async/useLoading';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { parseTime } from '@/utils/ruoyi';
import DetailDrawer from './detailDrawer.vue';

const queryFormRef = ref<ElFormInstance>();
const detailDrawerRef = ref<InstanceType<typeof DetailDrawer>>();
const notifyList = ref<NotifyListVO[]>([]);
const total = ref(0);
const dateRange = ref<string[]>([]);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const queryParams = reactive<NotifyQuery>({
  pageNum: 1,
  pageSize: 10,
  requestId: '',
  bizType: '',
  bizId: '',
  channel: '',
  providerKey: '',
  status: '',
  providerMessageId: '',
  clientPk: ''
});
const { ids, multiple, handleSelectionChange } = useTableSelection<NotifyListVO>(row => row.notifyLogId);

const getList = async () => {
  await withLoading(async () => {
    const response = await listNotify({
      ...queryParams,
      beginTime: dateRange.value[0],
      endTime: dateRange.value[1]
    });
    notifyList.value = response.data?.rows ?? [];
    total.value = response.data?.total ?? 0;
  });
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = [];
  handleQuery();
};

const handleView = (row: Partial<NotifyListVO>) => {
  if (row.notifyLogId !== undefined) {
    detailDrawerRef.value?.openDrawer(row.notifyLogId);
  }
};

const handleDelete = async (row?: Partial<NotifyListVO>) => {
  const notifyLogIds = row?.notifyLogId ?? ids.value;
  await modal.confirm(`是否确认删除通知日志 ${notifyLogIds}？`);
  await delNotify(notifyLogIds);
  await getList();
  modal.msgSuccess('删除成功');
};

const handleClean = async () => {
  await modal.confirm('是否确认清空全部通知监控数据？');
  await modal.confirm('清空后完整正文、目标和投递明细均无法恢复，是否继续？');
  await cleanNotify();
  await getList();
  modal.msgSuccess('清空成功');
};

const businessLabel = (bizType?: string, bizId?: string) => {
  if (!bizType && !bizId) return '-';
  return [bizType, bizId].filter(Boolean).join(' / ');
};

const errorLabel = (errorCode?: string, errorMessage?: string) => {
  if (!errorCode && !errorMessage) return '-';
  return [errorCode, errorMessage].filter(Boolean).join(' / ');
};

const statusType = (status?: string) => {
  if (status === 'ACCEPTED') return 'success';
  if (status === 'FAILED') return 'danger';
  if (status === 'PARTIAL_FAILURE') return 'warning';
  return 'info';
};

onMounted(getList);
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/page-shell' as pageShell;

@include pageShell.table-crud-page;

.date-range-item {
  width: 340px;
}

@media (max-width: 720px) {
  .date-range-item {
    width: 100%;
  }

  .date-range-item :deep(.el-date-editor) {
    width: 100%;
  }
}
</style>
