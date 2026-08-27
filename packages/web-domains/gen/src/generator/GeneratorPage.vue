<template>
  <div class="gen-generator-page app-container">
    <el-card shadow="never">
      <el-form ref="queryFormRef" :model="query" :inline="true" v-show="showSearch">
        <el-form-item label="数据源" prop="dataName">
          <el-select v-model="query.dataName" clearable filterable placeholder="全部数据源">
            <el-option v-for="item in dataSources" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="表名称" prop="tableName">
          <el-input v-model="query.tableName" clearable @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="表描述" prop="tableComment">
          <el-input v-model="query.tableComment" clearable @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="search">搜索</el-button>
          <el-button icon="Refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-alert v-if="dataSourceError" type="warning" :closable="false" show-icon>
        <template #title>
          数据源列表加载失败，表格仍可使用。
          <el-button link type="primary" @click="loadDataSources">重新加载</el-button>
        </template>
      </el-alert>

      <div class="toolbar">
        <div>
          <strong>代码生成</strong>
          <span>{{ total }} 张数据表</span>
        </div>
        <div class="actions">
          <el-button
            v-hasPermi="['tool:gen:code']"
            type="primary"
            plain
            icon="Download"
            :disabled="!selected.length"
            @click="downloadSelected"
          >
            生成
          </el-button>
          <el-button
            v-hasPermi="['tool:gen:import']"
            type="info"
            plain
            icon="Upload"
            @click="importRef?.show(query.dataName)"
          >
            导入
          </el-button>
          <el-button
            v-hasPermi="['tool:gen:edit']"
            type="success"
            plain
            icon="Edit"
            :disabled="selected.length !== 1"
            @click="edit(selected[0])"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['tool:gen:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="!selected.length"
            @click="remove()"
          >
            删除
          </el-button>
          <el-button
            circle
            :icon="showSearch ? 'View' : 'Hide'"
            title="显示或隐藏搜索"
            @click="showSearch = !showSearch"
          />
        </div>
      </div>

      <el-table v-loading="loading" border :data="rows" @selection-change="value => (selected = value)">
        <el-table-column type="selection" width="55" />
        <el-table-column label="数据源" prop="dataName" show-overflow-tooltip />
        <el-table-column label="表名称" prop="tableName" show-overflow-tooltip />
        <el-table-column label="表描述" prop="tableComment" show-overflow-tooltip />
        <el-table-column label="实体" prop="className" show-overflow-tooltip />
        <el-table-column label="更新时间" prop="updateTime" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-tooltip content="预览">
              <el-button
                v-hasPermi="['tool:gen:preview']"
                link
                type="primary"
                icon="View"
                @click="previewCode(scope.row as TableVO)"
              />
            </el-tooltip>
            <el-tooltip content="编辑">
              <el-button
                v-hasPermi="['tool:gen:edit']"
                link
                type="primary"
                icon="Edit"
                @click="edit(scope.row as TableVO)"
              />
            </el-tooltip>
            <el-tooltip content="同步">
              <el-button
                v-hasPermi="['tool:gen:edit']"
                link
                type="primary"
                icon="Refresh"
                @click="sync(scope.row as TableVO)"
              />
            </el-tooltip>
            <el-tooltip content="生成代码">
              <el-button
                v-hasPermi="['tool:gen:code']"
                link
                type="primary"
                icon="Download"
                @click="download([scope.row as TableVO])"
              />
            </el-tooltip>
            <el-tooltip content="删除">
              <el-button
                v-hasPermi="['tool:gen:remove']"
                link
                type="danger"
                icon="Delete"
                @click="remove(scope.row as TableVO)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        v-model:page="query.pageNum"
        v-model:limit="query.pageSize"
        :total="total"
        @pagination="load"
      />
    </el-card>

    <el-dialog v-model="preview.visible" title="代码预览" width="80%" top="5vh" append-to-body>
      <el-tabs v-model="preview.active">
        <el-tab-pane v-for="(source, path) in preview.files" :key="path" :label="fileName(path)" :name="path">
          <el-button
            v-copyText="source"
            v-copyText:callback="copySuccess"
            class="copy-button"
            link
            type="primary"
            icon="DocumentCopy"
          >
            复制
          </el-button>
          <pre data-testid="generator-preview-source"><code>{{ source }}</code></pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <ImportTableDialog ref="importRef" :runtime="runtime" @ok="load" />
  </div>
</template>

<script setup lang="ts">
import type { TableQuery, TableVO } from '@namewta/domain-gen';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { GenWebRuntime } from '../runtime';
import ImportTableDialog from './ImportTableDialog.vue';

const props = defineProps<{ runtime: GenWebRuntime }>();
const { runtime } = props;
const route = useRoute();
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const rows = ref<TableVO[]>([]);
const selected = ref<TableVO[]>([]);
const dataSources = ref<string[]>([]);
const dataSourceError = ref(false);
const dateRange = ref<[string, string]>(['', '']);
const queryFormRef = ref<ElFormInstance>();
const importRef = ref<InstanceType<typeof ImportTableDialog>>();
const query = reactive<TableQuery>({ pageNum: 1, pageSize: 10, tableName: '', tableComment: '', dataName: '' });
const preview = reactive({ visible: false, active: '', files: {} as Record<string, string> });

async function load() {
  loading.value = true;
  try {
    const response = await runtime.service.list({
      ...query,
      params: { beginTime: dateRange.value[0] || undefined, endTime: dateRange.value[1] || undefined }
    });
    rows.value = response.data?.rows ?? [];
    total.value = response.data?.total ?? 0;
  } catch {
    runtime.error('生成表加载失败，请重试');
  } finally {
    loading.value = false;
  }
}
function search() {
  query.pageNum = 1;
  void load();
}
function reset() {
  queryFormRef.value?.resetFields();
  dateRange.value = ['', ''];
  search();
}
function edit(row?: Partial<TableVO>) {
  if (!row?.tableId) return;
  void runtime.navigate({ path: `/tool/gen-edit/index/${row.tableId}`, query: { pageNum: query.pageNum } });
}
async function previewCode(row: TableVO) {
  const response = await runtime.service.preview(row.tableId);
  preview.files = response.data ?? {};
  preview.active = Object.keys(preview.files)[0] ?? '';
  preview.visible = true;
}
async function sync(row: TableVO) {
  await runtime.confirm(`确认要强制同步“${row.tableName}”表结构吗？`);
  await runtime.service.sync(row.tableId);
  runtime.success('同步成功');
}
async function remove(row?: TableVO) {
  const targets = row ? [row] : selected.value;
  if (!targets.length) return;
  await runtime.confirm(`是否确认删除表编号为“${targets.map(item => item.tableId).join(',')}”的数据项？`);
  await runtime.service.delete(targets.map(item => item.tableId));
  runtime.success('删除成功');
  await load();
}
function download(targets: TableVO[]) {
  const intent = runtime.service.downloadIntent(targets.map(item => item.tableId));
  void runtime.downloadZip(intent.url, intent.fileName);
}
function downloadSelected() {
  download(selected.value);
}
function fileName(path: string) {
  return path.split('/').pop()?.replace('.ftl', '') ?? path;
}
function copySuccess() {
  runtime.success('复制成功');
}
async function loadDataSources() {
  try {
    const response = await runtime.service.dataSourceNames();
    dataSources.value = response.data ?? [];
    dataSourceError.value = false;
  } catch {
    dataSourceError.value = true;
    runtime.error('数据源列表加载失败，可点击重新加载');
  }
}

onMounted(() => {
  query.pageNum = Number(route.query.pageNum) || 1;
  void load();
  void loadDataSources();
});
</script>

<style scoped>
.gen-generator-page {
  padding: 16px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 16px 0;
}
.toolbar span {
  color: var(--el-text-color-secondary);
  margin-left: 8px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.copy-button {
  float: right;
  margin-bottom: 8px;
}
pre {
  max-height: 60vh;
  overflow: auto;
  padding: 16px;
  color: #e5e7eb;
  background: #1f2937;
}
@media (max-width: 760px) {
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
