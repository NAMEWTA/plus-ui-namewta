<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { createConversation, fetchAgentChat, fetchAgentChatSync, fetchChatMode, fetchConversationMessages } from '@/api/ai/agent';
import type { AgentItem } from '@/api/ai/agent/types';
import { ElMessage } from 'element-plus';
import ChatInput from './chat-input.vue';

const props = defineProps<{
  agent: AgentItem | null;
  conversationId: string;
}>();
const emit = defineEmits<{
  conversationCreated: [conversationId: string];
}>();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const messages = ref<ChatMessage[]>([]);
const sending = ref(false);
const sendMode = ref<'stream' | 'sync'>('stream');
const streamTimeout = 300000;
let sendingTimer: ReturnType<typeof setTimeout> | null = null;
let activeController: AbortController | null = null;

const showWelcome = computed(() => !!props.agent && !props.conversationId && !messages.value.length);
const displayQuestions = computed(() => {
  return (props.agent?.presetQuestions || []).filter(Boolean);
});

function normalizeMessageList(payload: any): ChatMessage[] {
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
    .map((item: any) => {
      const role = String(item?.role || item?.messageType || item?.senderType || '').toLowerCase();
      return {
        role: role === 'user' ? 'user' : 'assistant',
        content: String(item?.content ?? item?.message ?? item?.text ?? '')
      } as ChatMessage;
    })
    .filter(item => !!item.content);
}

function normalizeStreamChunk(chunk: string): string {
  const text = String(chunk ?? '');
  if (!text.trim()) return '';

  const tryParseJsonContent = (raw: string): string | null => {
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object' && typeof obj.content === 'string') {
        return obj.content;
      }
    } catch {}
    return null;
  };

  const single = tryParseJsonContent(text);
  if (single !== null) return single;

  const normalized = text.replace(/}\s*{/g, '}\n{');
  const lines = normalized
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (!lines.length) return text;
  let merged = '';
  for (const line of lines) {
    const parsed = tryParseJsonContent(line);
    if (parsed === null) return text;
    merged += parsed;
  }
  return merged;
}

function extractSyncReply(payload: any): string {
  const container = payload?.data ?? payload;
  const normalizeChunkedJsonText = (raw: string): string => {
    const text = String(raw || '').trim();
    if (!text) return '';
    if (!text.includes('\n') && !(text.startsWith('{') && text.endsWith('}'))) {
      return text;
    }

    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    if (!lines.length) return text;

    let merged = '';
    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item?.type === 'text' || typeof item?.content === 'string') {
          merged += String(item.content ?? '');
        }
      } catch {
        return text;
      }
    }
    return merged || text;
  };

  const candidates = [
    container?.content,
    container?.text,
    container?.message,
    container?.answer,
    container?.reply,
    container?.outputText,
    container?.result
  ];
  const hit = candidates.find(item => typeof item === 'string' && item.trim());
  if (hit) return normalizeChunkedJsonText(String(hit));
  if (Array.isArray(container?.messages)) {
    const list = normalizeMessageList(container.messages).filter(item => item.role === 'assistant');
    return list[list.length - 1]?.content || '';
  }
  return '';
}

async function loadSendMode() {
  try {
    const { data } = await fetchChatMode();
    sendMode.value = data?.mode === 'sync' ? 'sync' : 'stream';
  } catch {
    sendMode.value = 'stream';
  }
}

async function loadMessages() {
  if (!props.agent || !props.conversationId) {
    messages.value = [];
    return;
  }
  const { data } = await fetchConversationMessages(props.agent.id, props.conversationId);
  messages.value = normalizeMessageList(data);
}

function clearSendingTimer() {
  if (sendingTimer) {
    clearTimeout(sendingTimer);
    sendingTimer = null;
  }
}

function finishSending() {
  sending.value = false;
  clearSendingTimer();
  activeController = null;
}

async function onSend(content: string) {
  if (!props.agent || !content.trim() || sending.value) return;
  sending.value = true;
  clearSendingTimer();
  sendingTimer = setTimeout(() => {
    if (sending.value) {
      activeController?.abort();
      finishSending();
      ElMessage.warning('响应超时，已恢复发送按钮，请重试');
    }
  }, streamTimeout);
  let targetConversationId = props.conversationId;
  if (!targetConversationId) {
    messages.value = [];
    try {
      const { data } = await createConversation(props.agent.id, { title: content.slice(0, 20) });
      if (!data?.conversationId) {
        finishSending();
        ElMessage.error('创建会话失败，请稍后重试');
        return;
      }
      targetConversationId = data.conversationId;
      emit('conversationCreated', targetConversationId);
    } catch (error: any) {
      finishSending();
      ElMessage.error(error?.message || '创建会话失败，请稍后重试');
      return;
    }
  }

  messages.value.push({ role: 'user', content });
  if (sendMode.value === 'sync') {
    try {
      const { data } = await fetchAgentChatSync(props.agent.id, {
        conversationId: targetConversationId,
        content
      });
      const reply = extractSyncReply(data) || '（后端已返回空消息）';
      messages.value.push({ role: 'assistant', content: reply });
    } catch (error: any) {
      ElMessage.error(error?.message || '对话失败，请稍后重试');
    } finally {
      finishSending();
    }
    return;
  }

  messages.value.push({ role: 'assistant', content: '' });
  const assistantIndex = messages.value.length - 1;
  activeController?.abort();
  activeController = new AbortController();
  void fetchAgentChat(
    props.agent.id,
    {
      conversationId: targetConversationId,
      content
    },
    {
      signal: activeController.signal,
      onMessage(chunk) {
        const msg = messages.value[assistantIndex];
        if (msg) msg.content += normalizeStreamChunk(chunk);
      },
      onThinking() {},
      onDone() {
        const msg = messages.value[assistantIndex];
        if (msg && !msg.content.trim()) {
          msg.content = '（后端已返回空消息）';
        }
        finishSending();
      },
      onError(error) {
        messages.value.splice(assistantIndex, 1);
        finishSending();
        ElMessage.error(error.message || '对话失败，请稍后重试');
      }
    }
  );
}

watch(
  () => [props.agent?.id, props.conversationId] as const,
  async ([agentId, convId]) => {
    if (sending.value && convId) {
      return;
    }
    activeController?.abort();
    finishSending();
    if (agentId && convId) {
      await loadMessages();
    } else if (agentId && !convId) {
      messages.value = [];
    }
  },
  { immediate: true }
);

loadSendMode();

onBeforeUnmount(() => {
  activeController?.abort();
  clearSendingTimer();
});
</script>

<template>
  <main class="chat-main">
    <div v-if="!agent" class="empty-state">请先选择一个智能体开始对话</div>
    <template v-else>
      <el-scrollbar class="chat-scroll">
        <div class="chat-content">
          <div v-if="showWelcome" class="welcome-card">
            <div class="card-head">
              <el-avatar class="agent-avatar" :size="36" :src="agent.avatar">{{ agent.name.slice(0, 1) }}</el-avatar>
              <div class="title-block">
                <div class="agent-name">{{ agent.name }}</div>
                <div class="agent-desc">{{ agent.description || '暂无描述' }}</div>
              </div>
            </div>
            <div class="greeting">{{ agent.greeting || '你好，我是你的智能助手。' }}</div>
            <div v-if="displayQuestions.length" class="question-title">推荐问题</div>
            <div v-if="displayQuestions.length" class="question-list">
              <button v-for="q in displayQuestions" :key="q" class="question-pill" @click="onSend(q)">
                {{ q }}
              </button>
            </div>
          </div>

          <div v-for="(msg, idx) in messages" :key="idx" class="msg-row" :class="{ user: msg.role === 'user' }">
            <div class="msg-bubble" :class="{ pending: msg.role === 'assistant' && !msg.content }">{{ msg.content || '正在生成...' }}</div>
          </div>
        </div>
      </el-scrollbar>
      <ChatInput :sending="sending" @send="onSend" />
    </template>
  </main>
</template>

<style scoped lang="scss">
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-muted);
}

.chat-scroll {
  flex: 1;
  padding: 16px 18px 0;
  min-height: 0;
}

.chat-content {
  max-width: 920px;
  margin: 0 auto;
  width: 100%;
}

.welcome-card {
  background: var(--app-surface-bg);
  border: 1px solid var(--app-surface-border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: var(--app-shadow-sm);
}

.card-head {
  display: flex;
  gap: 10px;
}

.agent-avatar {
  flex-shrink: 0;
  background: var(--el-color-primary);
}

.agent-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--app-text-title);
}

.agent-desc {
  margin-top: 4px;
  color: var(--app-text-muted);
  line-height: 1.6;
}

.greeting {
  margin-top: 12px;
  color: var(--app-text-title);
}

.question-title {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid var(--app-surface-border);
  color: var(--app-text-muted);
  font-size: 13px;
}

.question-list {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-pill {
  border: 1px solid var(--app-surface-border);
  background: var(--app-surface-bg);
  color: var(--app-text-title);
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
}

.question-pill:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.msg-row {
  display: flex;
  margin-bottom: 12px;
}

.msg-row.user {
  justify-content: flex-end;
}

.msg-bubble {
  max-width: 80%;
  white-space: pre-wrap;
  line-height: 1.7;
  background: var(--app-surface-bg);
  border: 1px solid var(--app-surface-border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--app-text-title);
  box-shadow: var(--app-shadow-sm);
}

.msg-row.user .msg-bubble {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
}

.msg-bubble.pending {
  color: var(--app-text-muted);
}

@media (max-width: 768px) {
  .chat-scroll {
    padding: 12px 12px 0;
  }

  .msg-bubble {
    max-width: 92%;
  }
}
</style>
