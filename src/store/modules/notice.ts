import { defineStore } from 'pinia';
import { reactive } from 'vue';

export interface NoticeItem {
  title?: string;
  category?: string;
  type?: string;
  source?: string;
  read: boolean;
  message: string;
  content?: string;
  data?: Record<string, any> | null;
  path?: string;
  query?: Record<string, any> | null;
  time: string;
}

export const useNoticeStore = defineStore('notice', () => {
  const state = reactive({
    notices: [] as NoticeItem[]
  });

  const addNotice = (notice: NoticeItem) => {
    state.notices.push(notice);
  };

  const removeNotice = (notice: NoticeItem) => {
    state.notices.splice(state.notices.indexOf(notice), 1);
  };

  //实现全部已读
  const readAll = () => {
    state.notices.forEach((item: any) => {
      item.read = true;
    });
  };

  const clearNotice = () => {
    state.notices = [];
  };
  return {
    state,
    addNotice,
    removeNotice,
    readAll,
    clearNotice
  };
});
