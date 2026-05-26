<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchAgentConversations, fetchMyAgents, registerCurrentSnailUser } from '@/api/ai/agent';
import type { AgentItem, ConversationSummaryItem } from '@/api/ai/agent/types';
import ChatMain from './modules/chat-main.vue';
import ChatSidebar from './modules/chat-sidebar.vue';

defineOptions({ name: 'AiChatPage' });

const agents = ref<AgentItem[]>([]);
const conversations = ref<ConversationSummaryItem[]>([]);
const currentAgent = ref<AgentItem | null>(null);
const currentConversationId = ref('');
const currentNickname = ref('');

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
      lastMessageDt: item?.lastMessageDt ?? item?.updateTime ?? item?.updateDt,
      createDt: item?.createDt ?? item?.createTime
    }))
    .filter((item: ConversationSummaryItem) => !!item.conversationId)
    .sort((a: ConversationSummaryItem, b: ConversationSummaryItem) => {
      const ta = new Date(a.lastMessageDt || a.createDt || 0).getTime();
      const tb = new Date(b.lastMessageDt || b.createDt || 0).getTime();
      return tb - ta;
    });
}

async function loadAgents() {
  const { data: user } = await registerCurrentSnailUser();
  currentNickname.value = user?.nickname || '';
  const { data } = await fetchMyAgents();
  agents.value = Array.isArray(data) ? data : [];
  currentAgent.value = agents.value[0] || null;
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
        :agents="agents"
        :conversations="conversations"
        :current-agent="currentAgent"
        :current-conversation-id="currentConversationId"
        :current-nickname="currentNickname"
        @select-agent="onSelectAgent"
        @select-conversation="currentConversationId = $event"
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
  background: #f5f6f8;
  overflow: hidden;
}

.chat-header {
  height: 46px;
  padding: 0 14px;
  border-bottom: 1px solid #e6e8ee;
  background: #fff;
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b90a0;
  font-size: 18px;
  font-weight: 600;
}

.brand-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6f76ff;
}

.chat-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
</style>
