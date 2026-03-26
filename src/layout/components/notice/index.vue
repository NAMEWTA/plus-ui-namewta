<template>
  <div v-loading="state.loading" class="layout-navbars-breadcrumb-user-news">
    <div class="head-box">
      <div class="head-box-title">通知公告</div>
      <div class="head-box-btn" @click="readAll">全部已读</div>
    </div>
    <div v-loading="state.loading" class="content-box">
      <template v-if="newsList.length > 0">
        <div v-for="(v, k) in newsList" :key="k" class="content-box-item" @click="onNewsClick(k)">
          <div class="item-conten">
            <div class="content-box-title">{{ v.title || '消息' }}</div>
            <div>{{ v.message }}</div>
            <div v-if="v.content" class="content-box-msg">{{ v.content }}</div>
            <div class="content-box-time">{{ v.time }}</div>
          </div>
          <!-- 已读/未读 -->
          <span v-if="v.read" class="el-tag el-tag--success el-tag--mini read">已读</span>
          <span v-else class="el-tag el-tag--danger el-tag--mini read">未读</span>
        </div>
      </template>
      <el-empty v-else :description="'消息为空'"></el-empty>
    </div>
    <div v-if="newsList.length > 0" class="foot-box" @click="onGoToGiteeClick">前往gitee</div>
  </div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUserNews">
import { useNoticeStore } from '@/store/modules/notice';
import router from '@/router';

const noticeStore = useNoticeStore();
const { readAll } = useNoticeStore();

// 定义变量内容
const state = reactive({
  loading: false
});
const newsList = ref([]) as any;

/**
 * 初始化数据
 * @returns
 */
const getTableData = async () => {
  state.loading = true;
  newsList.value = noticeStore.state.notices;
  state.loading = false;
};

//点击消息，写入已读
const onNewsClick = async (item: any) => {
  newsList.value[item].read = true;
  //并且写入pinia
  noticeStore.state.notices = newsList.value;
  const current = newsList.value[item];
  if (current?.path) {
    await router.push({
      path: current.path,
      query: current.query || undefined
    });
  }
};

// 前往通知中心点击
const onGoToGiteeClick = () => {
  window.open('https://gitee.com/dromara/RuoYi-Vue-Plus/tree/5.X/');
};

onMounted(() => {
  nextTick(() => {
    getTableData();
  });
});
</script>

<style lang="scss" scoped>
.layout-navbars-breadcrumb-user-news {
  display: flex;
  flex-direction: column;
  min-width: 0;

  .head-box {
    display: flex;
    border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    box-sizing: border-box;
    color: var(--app-text-title);
    justify-content: space-between;
    height: 40px;
    align-items: center;
    padding: 0 2px 10px;

    .head-box-title {
      font-size: 14px;
      font-weight: 600;
    }

    .head-box-btn {
      color: var(--app-accent-strong);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      opacity: 0.8;

      &:hover {
        opacity: 1;
      }
    }
  }

  .content-box {
    height: 300px;
    overflow: auto;
    font-size: 13px;
    padding: 8px 0;

    .content-box-item {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 12px;
      margin: 4px 0;
      border-radius: 12px;
      cursor: pointer;
      transition:
        background-color 0.2s ease,
        transform 0.2s ease;

      &:hover {
        background: var(--app-accent-soft);
        transform: translateY(-1px);
      }

      .content-box-msg {
        color: var(--el-text-color-secondary);
        margin: 2px 0 0;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .content-box-time {
        color: var(--app-text-muted);
        font-size: 12px;
      }

      .item-conten {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: var(--app-text-title);
        line-height: 1.6;
      }

      .content-box-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--app-accent-strong);
      }

      .read {
        flex-shrink: 0;
        margin-top: 2px;
      }
    }
  }

  .foot-box {
    height: 40px;
    color: var(--app-accent-strong);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid rgba(148, 163, 184, 0.14);
    margin-top: 4px;

    &:hover {
      opacity: 1;
    }
  }
  :deep(.el-empty__description p) {
    font-size: 13px;
  }
}
</style>
