<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { createConversation, fetchAgentChat, fetchAgentChatSync, fetchChatMode, fetchConversationMessages } from '@/api/ai/agent';
import { ElMessage } from 'element-plus';
import ChatInput from './chat-input.vue';

interface AgentItem {
  id: number;
  name: string;
  description?: string;
  greeting?: string;
  presetQuestions?: string[];
  webSearchEnabled?: boolean;
}

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
let sendingTimer: ReturnType<typeof setTimeout> | null = null;

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

async function onSend(content: string) {
  if (!props.agent || !content.trim() || sending.value) return;
  sending.value = true;
  if (sendingTimer) clearTimeout(sendingTimer);
  sendingTimer = setTimeout(() => {
    if (sending.value) {
      sending.value = false;
      ElMessage.warning('响应超时，已恢复发送按钮，请重试');
    }
  }, 60000);
  let targetConversationId = props.conversationId;
  if (!targetConversationId) {
    messages.value = [];
    const { data } = await createConversation(props.agent.id, { title: content.slice(0, 20) });
    if (!data?.conversationId) {
      sending.value = false;
      if (sendingTimer) {
        clearTimeout(sendingTimer);
        sendingTimer = null;
      }
      ElMessage.error('创建会话失败，请稍后重试');
      return;
    }
    targetConversationId = data.conversationId;
    emit('conversationCreated', targetConversationId);
  }

  messages.value.push({ role: 'user', content });
  if (sendMode.value === 'sync') {
    try {
      const { data } = await fetchAgentChatSync(props.agent.id, {
        conversationId: targetConversationId,
        content,
        webSearchEnabled: props.agent.webSearchEnabled
      });
      const reply = extractSyncReply(data) || '（后端已返回空消息）';
      messages.value.push({ role: 'assistant', content: reply });
    } catch (error: any) {
      ElMessage.error(error?.message || '对话失败，请稍后重试');
    } finally {
      sending.value = false;
      if (sendingTimer) {
        clearTimeout(sendingTimer);
        sendingTimer = null;
      }
    }
    return;
  }

  messages.value.push({ role: 'assistant', content: '' });
  const assistantIndex = messages.value.length - 1;
  fetchAgentChat(
      props.agent.id,
      {
        conversationId: targetConversationId,
        content,
        webSearchEnabled: props.agent.webSearchEnabled
      },
      {
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
          sending.value = false;
          if (sendingTimer) {
            clearTimeout(sendingTimer);
            sendingTimer = null;
          }
        },
        onError(error) {
          messages.value.splice(assistantIndex, 1);
          sending.value = false;
          if (sendingTimer) {
            clearTimeout(sendingTimer);
            sendingTimer = null;
          }
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
    sending.value = false;
    if (sendingTimer) {
      clearTimeout(sendingTimer);
      sendingTimer = null;
    }
    if (agentId && convId) {
      await loadMessages();
    } else if (agentId && !convId) {
      messages.value = [];
    }
  },
  { immediate: true }
);

loadSendMode();
</script>

<template>
  <main class="chat-main">
    <div v-if="!agent" class="empty-state">请先选择一个智能体开始对话</div>
    <template v-else>
      <el-scrollbar class="chat-scroll">
        <div class="chat-content">
          <div v-if="showWelcome" class="welcome-card">
            <div class="card-head">
              <span class="avatar-dot" />
              <div class="title-block">
                <div class="agent-name">{{ agent.name }}</div>
              <div class="agent-desc">{{ agent.description || '暂无描述' }}</div>
            </div>
          </div>
            <div class="greeting">{{ agent.greeting || '你好，我是你的智能助手。' }}</div>
            <div v-if="displayQuestions.length" class="question-title">推荐问题</div>
            <div v-if="displayQuestions.length" class="question-list">
              <button
                v-for="q in displayQuestions"
                :key="q"
                class="question-pill"
                @click="onSend(q)"
              >
                {{ q }}
              </button>
            </div>
          </div>

          <div v-for="(msg, idx) in messages" :key="idx" class="msg-row" :class="{ user: msg.role === 'user' }">
            <div class="msg-bubble">{{ msg.content }}</div>
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
  color: #98a0af;
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
  background: #fff;
  border: 1px solid #e4e8f0;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 14px;
}

.card-head {
  display: flex;
  gap: 10px;
}

.avatar-dot {
  margin-top: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3f434b;
}

.agent-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2430;
}

.agent-desc {
  margin-top: 4px;
  color: #6f7687;
  line-height: 1.6;
}

.greeting {
  margin-top: 12px;
  color: #2b3240;
}

.question-title {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid #edf0f5;
  color: #6f7687;
  font-size: 13px;
}

.question-list {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-pill {
  border: 1px solid #e0e5ef;
  background: #fff;
  color: #3a4252;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
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
  background: #fff;
  border: 1px solid #e4e8f0;
  border-radius: 12px;
  padding: 10px 12px;
}

.msg-row.user .msg-bubble {
  background: #e9ecff;
  border-color: #d7dcff;
  color: #4552d9;
}
</style>
