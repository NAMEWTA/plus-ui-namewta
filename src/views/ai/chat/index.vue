<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { deleteConversation, fetchAgentConversations, fetchMyAgents, registerCurrentSnailUser } from '@/api/ai/agent';
import type { AgentItem, ConversationSummaryItem } from '@/api/ai/agent/types';
import { ElMessage, ElMessageBox } from 'element-plus';
import ChatMain from './modules/chat-main.vue';
import ChatSidebar from './modules/chat-sidebar.vue';

defineOptions({ name: 'AiChatPage' });

const agents = ref<AgentItem[]>([]);
const conversations = ref<ConversationSummaryItem[]>([]);
const currentAgent = ref<AgentItem | null>(null);
const currentConversationId = ref('');
const currentNickname = ref('');
const loading = ref(false);

function normalizeAgentList(payload: any): AgentItem[] {
  const container = payload?.data ?? payload;
  const source =
    (Array.isArray(container) && container) ||
    (Array.isArray(container?.rows) && container.rows) ||
    (Array.isArray(container?.list) && container.list) ||
    (Array.isArray(container?.records) && container.records) ||
    [];

  return source
    .map((item: any) => ({
      id: Number(item?.id ?? item?.agentId),
      name: String(item?.name ?? item?.title ?? ''),
      description: item?.description,
      avatar: item?.avatar,
      greeting: item?.greeting,
      status: item?.status,
      presetQuestions: Array.isArray(item?.presetQuestions) ? item.presetQuestions : []
    }))
    .filter((item: AgentItem) => Number.isFinite(item.id) && !!item.name);
}

function normalizeConversationList(payload: any): ConversationSummaryItem[] {
  const container = payload?.data ?? payload;
  const source =
    (Array.isArray(container) && container) ||
    (Array.isArray(container?.rows) && container.rows) ||
    (Array.isArray(container?.list) && container.list) ||
    (Array.isArray(container?.records) && container.records) ||
    (Array.isArray(payload?.rows) && payload.rows) ||
    (Array.isArray(payload?.list) && payload.list) ||
    (Array.isArray(payload?.records) && payload.records) ||
    [];

  return source
    .map((item: any) => ({
      conversationId: String(item?.conversationId ?? item?.id ?? ''),
      title: String(item?.title ?? item?.name ?? ''),
      lastMessageDt: item?.lastMessageDt ?? item?.updateDt ?? item?.updateTime,
      createDt: item?.createDt ?? item?.createTime,
      updateDt: item?.updateDt
    }))
    .filter((item: ConversationSummaryItem) => !!item.conversationId)
    .toSorted((a: ConversationSummaryItem, b: ConversationSummaryItem) => {
      const ta = new Date(a.lastMessageDt || a.createDt || 0).getTime();
      const tb = new Date(b.lastMessageDt || b.createDt || 0).getTime();
      return tb - ta;
    });
}

async function loadAgents() {
  loading.value = true;
  try {
    const { data: user } = await registerCurrentSnailUser();
    currentNickname.value = user?.nickname || '';
    const { data } = await fetchMyAgents();
    agents.value = normalizeAgentList(data);
    currentAgent.value = agents.value.find(item => item.id === currentAgent.value?.id) || agents.value[0] || null;
  } finally {
    loading.value = false;
  }
}

async function loadConversations(agentId: number) {
  try {
    const { data } = await fetchAgentConversations(agentId, { page: 1, size: 50 });
    conversations.value = normalizeConversationList(data);
  } catch {
    conversations.value = [];
  }
}

async function onSelectAgent(agent: AgentItem) {
  currentAgent.value = agent;
  currentConversationId.value = '';
  await loadConversations(agent.id);
}

async function onDeleteConversation(conversationId: string) {
  if (!currentAgent.value) return;
  try {
    await ElMessageBox.confirm('确认删除该会话记录？', '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
  } catch {
    return;
  }
  await deleteConversation(currentAgent.value.id, conversationId);
  if (currentConversationId.value === conversationId) {
    currentConversationId.value = '';
  }
  await loadConversations(currentAgent.value.id);
  ElMessage.success('删除成功');
}

onMounted(() => {
  loadAgents().then(async () => {
    if (currentAgent.value) {
      await loadConversations(currentAgent.value.id);
    }
  });
});
</script>

<template>
  <div class="ai-chat-page">
    <header class="chat-header">
      <div class="brand">
        <div class="brand-dot" />
        <span>Snail AI</span>
      </div>
    </header>
    <div class="chat-body">
      <ChatSidebar
        v-loading="loading"
        :agents="agents"
        :conversations="conversations"
        :current-agent="currentAgent"
        :current-conversation-id="currentConversationId"
        :current-nickname="currentNickname"
        @select-agent="onSelectAgent"
        @select-conversation="currentConversationId = $event"
        @delete-conversation="onDeleteConversation"
        @new-chat="currentConversationId = ''"
      />
      <ChatMain
        :agent="currentAgent"
        :conversation-id="currentConversationId"
        @conversation-created="(id) => { currentConversationId = id; if (currentAgent) loadConversations(currentAgent.id); }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px);
  min-height: 0;
  background: var(--el-bg-color-page);
  overflow: hidden;
}

.chat-header {
  height: 46px;
  padding: 0 14px;
  border-bottom: 1px solid var(--app-surface-border);
  background: var(--app-surface-bg);
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--app-text-title);
  font-size: 18px;
  font-weight: 600;
}

.brand-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--el-color-primary);
}

.chat-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 768px) {
  .ai-chat-page {
    height: calc(100vh - 64px);
  }

  .chat-body {
    flex-direction: column;
  }
}
</style>
