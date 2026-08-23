<template>
  <el-drawer
    v-model="open"
    title="通知详情"
    size="min(920px, 92vw)"
    append-to-body
    destroy-on-close
    @closed="clearDetail"
  >
    <div v-loading="loading" class="notify-detail">
      <template v-if="detail">
        <section class="detail-section">
          <div class="section-heading">
            <h3>发送概览</h3>
            <el-tag :type="statusType(detail.notification.status)" effect="light">
              {{ detail.notification.status || '-' }}
            </el-tag>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="日志编号">{{ detail.notification.notifyLogId }}</el-descriptions-item>
            <el-descriptions-item label="请求编号">{{ detail.notification.requestId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="原请求编号">
              {{ detail.notification.originalRequestId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="业务定位">
              {{ businessLabel(detail.notification.bizType, detail.notification.bizId) }}
            </el-descriptions-item>
            <el-descriptions-item label="渠道 / Provider">
              {{ detail.notification.channel || '-' }} / {{ detail.notification.providerKey || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="来源 Client PK">
              {{ detail.notification.clientPk ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="来源用户">{{ detail.notification.userId ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="发生时间">
              {{ parseTime(detail.notification.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="Trace ID" :span="2">
              <span class="break-all">{{ detail.notification.traceId || '-' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="detail-section">
          <div class="section-heading"><h3>发送内容</h3></div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="内容类型">{{ detail.notification.contentType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="主题">{{ detail.notification.subject || '-' }}</el-descriptions-item>
            <el-descriptions-item v-if="detail.notification.templateCode" label="模板编号">
              {{ detail.notification.templateCode }}
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.notification.templateParams" label="模板参数">
              <pre class="payload-text">{{ formatPayload(detail.notification.templateParams) }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="内容快照">
              <pre class="payload-text">{{
                detail.notification.contentSnapshot || detail.notification.content || '-'
              }}</pre>
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.notification.errorCode || detail.notification.errorMessage" label="错误">
              <span class="error-text">
                {{ detail.notification.errorCode || '-' }} / {{ detail.notification.errorMessage || '-' }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="detail-section">
          <div class="section-heading">
            <h3>投递明细</h3>
            <span class="section-count">{{ detail.deliveries.length }}</span>
          </div>
          <el-table :data="detail.deliveries" border empty-text="无投递明细">
            <el-table-column label="目标类型" prop="targetType" width="105" />
            <el-table-column label="角色" prop="targetRole" width="90" />
            <el-table-column label="完整目标" prop="targetValue" min-width="190" show-overflow-tooltip />
            <el-table-column label="Provider" prop="providerKey" width="120" show-overflow-tooltip />
            <el-table-column label="状态" width="110" align="center">
              <template #default="scope">
                <el-tag :type="statusType(scope.row.status)" size="small" effect="light">
                  {{ scope.row.status || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="消息编号" prop="providerMessageId" min-width="160" show-overflow-tooltip />
            <el-table-column label="耗时" width="90" align="right">
              <template #default="scope">{{ scope.row.costTime ?? 0 }} ms</template>
            </el-table-column>
            <el-table-column label="错误" min-width="180" show-overflow-tooltip>
              <template #default="scope">
                {{ deliveryError(scope.row.errorCode, scope.row.errorMessage) }}
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section v-if="detail.attachmentOssIds.length" class="detail-section">
          <div class="section-heading">
            <h3>通知附件</h3>
            <span class="section-count">{{ detail.attachmentOssIds.length }}</span>
          </div>
          <div class="attachment-list">
            <el-button
              v-for="ossId in detail.attachmentOssIds"
              :key="ossId"
              plain
              icon="Download"
              @click="downloadAttachment(ossId)"
            >
              {{ ossId }}
            </el-button>
          </div>
        </section>
      </template>
      <el-empty v-else-if="!loading" description="通知日志不存在或已删除" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import type { NotifyDetailVO } from '@/api/monitor/notify/types';
import { getNotifyAttachmentDownloadUrl, getNotifyDetail } from '@/api/monitor/notify';
import { useLoading } from '@/hooks/async/useLoading';
import { parseTime } from '@/utils/ruoyi';

const open = ref(false);
const detail = ref<NotifyDetailVO | null>(null);
const { loading, withLoading } = useLoading(false);

const openDrawer = async (notifyLogId: string | number) => {
  clearDetail();
  open.value = true;
  await withLoading(async () => {
    const response = await getNotifyDetail(notifyLogId);
    detail.value = response.data ?? null;
  });
};

const clearDetail = () => {
  detail.value = null;
};

const formatPayload = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const businessLabel = (bizType?: string, bizId?: string) => {
  if (!bizType && !bizId) return '-';
  return [bizType, bizId].filter(Boolean).join(' / ');
};

const deliveryError = (errorCode?: string, errorMessage?: string) => {
  if (!errorCode && !errorMessage) return '-';
  return [errorCode, errorMessage].filter(Boolean).join(' / ');
};

const statusType = (status?: string) => {
  if (status === 'ACCEPTED') return 'success';
  if (status === 'FAILED') return 'danger';
  if (status === 'PARTIAL_FAILURE') return 'warning';
  return 'info';
};

const downloadAttachment = async (ossId: string | number) => {
  if (!detail.value) return;
  const response = await getNotifyAttachmentDownloadUrl(detail.value.notification.notifyLogId, ossId);
  const authorization = response.data;
  if (!authorization?.url) {
    ElMessage.error('未取得附件下载授权');
    return;
  }
  const link = document.createElement('a');
  link.href = authorization.url;
  link.download = authorization.fileName;
  link.click();
};

defineExpose({ openDrawer });
</script>

<style lang="scss" scoped>
.notify-detail {
  min-height: 240px;
}

.detail-section + .detail-section {
  margin-top: 20px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  margin-bottom: 10px;
}

.section-heading h3 {
  margin: 0;
  font-size: 15px;
  letter-spacing: 0;
}

.section-count {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.payload-text {
  max-height: 280px;
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: var(--el-font-family);
  line-height: 1.65;
}

.break-all {
  overflow-wrap: anywhere;
}

.error-text {
  color: var(--el-color-danger);
  overflow-wrap: anywhere;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 680px) {
  :deep(.el-descriptions__body .el-descriptions__table) {
    table-layout: fixed;
  }
}
</style>
