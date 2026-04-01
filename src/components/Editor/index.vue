<template>
  <div class="editor-shell">
    <EditorToolbar :editor="editorRef" :default-config="toolbarConfig" mode="default" class="editor-toolbar" />
    <div class="editor-body" :style="styles">
      <WangEditor
        v-model="content"
        :default-config="editorConfig"
        mode="default"
        class="editor-content"
        @onCreated="handleCreated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import '@wangeditor-next/editor/dist/css/style.css';

import { Editor as WangEditor, Toolbar as EditorToolbar } from '@wangeditor-next/editor-for-vue';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor-next/editor';
import { propTypes } from '@/utils/propTypes';

const props = defineProps({
  /* 编辑器的内容 */
  modelValue: propTypes.string,
  /* 高度 */
  height: propTypes.number.def(400),
  /* 最小高度 */
  minHeight: propTypes.number.def(400),
  /* 只读 */
  readOnly: propTypes.bool.def(false),
  /* 上传文件大小限制(MB) */
  fileSize: propTypes.number.def(5),
  /* 类型（base64格式、url格式） */
  type: propTypes.string.def('base64')
});

const emit = defineEmits(['update:modelValue']);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const editorRef = shallowRef<IDomEditor>();
const content = ref('');

const styles = computed(() => {
  const style: Record<string, string> = {};
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  }
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
});

const toolbarConfig = computed<Partial<IToolbarConfig>>(() => {
  const excludeKeys = ['fullScreen'];

  if (!props.type) {
    excludeKeys.push('uploadImage');
  }

  return {
    modalAppendToBody: false,
    excludeKeys
  };
});

const validateImageFile = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    proxy?.$modal.msgError('图片格式错误!');
    return false;
  }

  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy?.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }

  return true;
};

const uploadImageMenuConfig = {
  metaWithUrl: false,
  onSuccess() {},
  onFailed() {},
  onError() {},
  allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'],
  customUpload(file: File, insertFn: (url: string, poster?: string, alt?: string, href?: string) => void) {
    if (!validateImageFile(file)) {
      return;
    }

    proxy?.$modal.loading('正在上传文件，请稍候...');
    const reader = new FileReader();

    reader.onload = () => {
      insertFn(reader.result as string, undefined, file.name);
      proxy?.$modal.closeLoading();
    };

    reader.onerror = () => {
      proxy?.$modal.msgError('图片插入失败');
      proxy?.$modal.closeLoading();
    };

    reader.readAsDataURL(file);
  }
} as any;

const editorConfig = computed<Partial<IEditorConfig>>(() => ({
  placeholder: '请输入内容',
  autoFocus: false,
  MENU_CONF: {
    uploadImage: uploadImageMenuConfig
  }
}));

const syncReadOnly = () => {
  const editor = editorRef.value;
  if (!editor) {
    return;
  }

  if (props.readOnly) {
    editor.disable();
  } else {
    editor.enable();
  }
};

watch(
  () => props.modelValue,
  value => {
    const nextValue = value || '';
    if (nextValue !== content.value) {
      content.value = nextValue;
    }
  },
  { immediate: true }
);

watch(content, value => {
  if (value !== props.modelValue) {
    emit('update:modelValue', value);
  }
});

watch(
  () => props.readOnly,
  () => {
    syncReadOnly();
  }
);

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
  syncReadOnly();
};

onBeforeUnmount(() => {
  editorRef.value?.destroy();
});
</script>

<style scoped>
.editor-shell {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  background: var(--el-bg-color);
}

.editor-toolbar {
  border-bottom: 1px solid var(--el-border-color);
}

.editor-body {
  display: flex;
  flex-direction: column;
}

.editor-content {
  height: 100%;
}

.editor-shell :deep(.w-e-toolbar) {
  border: 0 !important;
  background-color: transparent;
}

.editor-shell :deep(.w-e-text-container) {
  border: 0 !important;
  background-color: transparent;
}

.editor-shell :deep(.w-e-text-container [data-slate-editor]) {
  min-height: inherit;
}
</style>
