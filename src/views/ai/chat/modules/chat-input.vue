<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  send: [content: string];
}>();
defineProps<{
  sending?: boolean;
}>();

const content = ref('');

function submit() {
  const val = content.value.trim();
  if (!val) return;
  emit('send', val);
  content.value = '';
}
</script>

<template>
  <div class="chat-input-wrap">
    <div class="chat-input-box">
      <div class="input-row">
        <el-input
          v-model="content"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="给智能体发消息"
          @keydown.enter.exact.prevent="submit"
        />
        <el-button type="primary" circle :disabled="sending" @click="submit">
          <el-icon><Promotion /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-input-wrap {
  padding: 10px 18px 14px;
}

.chat-input-box {
  max-width: 920px;
  margin: 0 auto;
  border-radius: 16px;
  border: 1px solid #dde2eb;
  background: #fff;
  padding: 12px;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.input-row :deep(.el-textarea) {
  flex: 1;
}
</style>
