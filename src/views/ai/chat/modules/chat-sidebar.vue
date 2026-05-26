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
      <el-button class="new-btn" :disabled="!currentAgent" @click="emit('newChat')">+ 新对话</el-button>
    </div>

    <el-scrollbar class="sidebar-scroll">
      <div class="sidebar-block">
        <div class="block-title">我的智能体</div>
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
        <div
          v-for="conv in conversations"
          :key="conv.conversationId"
          class="conv-item"
          :class="{ active: currentConversationId === conv.conversationId }"
          @click="emit('selectConversation', conv.conversationId)"
        >
          {{ conv.title || '未命名会话' }}
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
  border-right: 1px solid #e5e8ef;
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
}

.sidebar-head {
  padding-bottom: 8px;
}

.new-btn {
  width: 100%;
}

.sidebar-scroll {
  flex: 1;
}

.sidebar-block {
  padding: 12px;
}

.block-title {
  margin-bottom: 10px;
  color: #8a8fa2;
  font-size: 12px;
}

.sub-title {
  margin-bottom: 6px;
  color: #9399aa;
  font-size: 13px;
}

.agent-item,
.conv-item {
  height: 36px;
  border-radius: 8px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2a2e38;
  cursor: pointer;
}

.agent-item:hover,
.conv-item:hover {
  background: #eef1f6;
}

.agent-item.active,
.conv-item.active {
  background: #e9ecff;
  color: #4d57ea;
}

.avatar-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3f434b;
}

.name {
  font-size: 14px;
}

.conv-item {
  font-size: 13px;
}

.sidebar-foot {
  border-top: 1px solid #e5e8ef;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #1dbf73;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
}

.user-status {
  color: #8f95a3;
  font-size: 12px;
}
</style>
