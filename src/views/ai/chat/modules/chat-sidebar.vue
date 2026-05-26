<script setup lang="ts">
import { computed } from 'vue';

interface AgentItem {
  id: number;
  name: string;
}

interface ConversationItem {
  conversationId: string;
  title: string;
  lastMessageDt?: string;
  createDt?: string;
}

const emit = defineEmits<{
  selectAgent: [agent: AgentItem];
  selectConversation: [conversationId: string];
  deleteConversation: [conversationId: string];
  newChat: [];
}>();

const props = defineProps<{
  agents: AgentItem[];
  conversations: ConversationItem[];
  currentAgent: AgentItem | null;
  currentConversationId: string;
  currentNickname?: string;
}>();

const displayNickname = computed(() => props.currentNickname || '已登录用户');
const avatarText = computed(() => (displayNickname.value ? displayNickname.value.slice(0, 1) : 'U'));
</script>

<template>
  <aside class="chat-sidebar">
    <div class="sidebar-block sidebar-head">
      <el-button class="new-btn" type="primary" plain :disabled="!agents.length" @click="emit('newChat')">
        <el-icon><Plus /></el-icon>
        <span>新对话</span>
      </el-button>
    </div>

    <el-scrollbar class="sidebar-scroll">
      <div class="sidebar-block">
        <div class="block-title">我的智能体</div>
        <el-empty v-if="!agents.length" :image-size="54" description="暂无智能体" />
        <div
          v-for="agent in agents"
          :key="agent.id"
          class="agent-item"
          :class="{ active: currentAgent?.id === agent.id }"
          @click="emit('selectAgent', agent)"
        >
          <span class="avatar-dot" />
          <span class="name">{{ agent.name }}</span>
        </div>
      </div>

      <div class="sidebar-block">
        <div class="block-title">对话记录</div>
        <el-empty v-if="!conversations.length" :image-size="54" description="暂无会话" />
        <div
          v-for="conv in conversations"
          :key="conv.conversationId"
          class="conv-item"
          :class="{ active: currentConversationId === conv.conversationId }"
          @click="emit('selectConversation', conv.conversationId)"
        >
          <span class="conv-title">{{ conv.title || '未命名会话' }}</span>
          <el-button class="delete-btn" link type="danger" circle @click.stop="emit('deleteConversation', conv.conversationId)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </el-scrollbar>

    <div class="sidebar-foot">
      <div class="user-avatar">{{ avatarText }}</div>
      <div>
        <div class="user-name">{{ displayNickname }}</div>
        <div class="user-status">已登录</div>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.chat-sidebar {
  width: 234px;
  border-right: 1px solid var(--app-surface-border);
  background: var(--app-elevated-soft-bg);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sidebar-head {
  padding-bottom: 6px;
}

.new-btn {
  width: 100%;
}

.sidebar-scroll {
  flex: 1;
}

.sidebar-block {
  padding: 10px 12px;
}

.block-title {
  margin-bottom: 8px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.agent-item,
.conv-item {
  height: 32px;
  border-radius: var(--app-radius-md);
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--app-text-title);
  cursor: pointer;
}

.agent-item:hover,
.conv-item:hover {
  background: var(--el-fill-color-light);
}

.agent-item.active,
.conv-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.avatar-dot {
  width: 14px;
  height: 14px;
  border-radius: var(--el-border-radius-round);
  background: var(--el-color-primary);
}

.name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-item {
  font-size: 13px;
}

.conv-title {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  width: 24px;
  height: 24px;
  visibility: hidden;
}

.conv-item:hover .delete-btn,
.conv-item.active .delete-btn {
  visibility: visible;
}

.sidebar-foot {
  border-top: 1px solid var(--app-surface-border);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--app-surface-bg);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--el-border-radius-round);
  background: var(--el-color-success);
  color: var(--el-color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text-title);
}

.user-status {
  color: var(--app-text-muted);
  font-size: 12px;
}

:deep(.el-empty) {
  --el-empty-padding: 8px 0 12px;
}

@media (max-width: 768px) {
  .chat-sidebar {
    width: 100%;
    height: 224px;
    border-right: 0;
    border-bottom: 1px solid var(--app-surface-border);
  }

  .sidebar-foot {
    display: none;
  }
}
</style>
