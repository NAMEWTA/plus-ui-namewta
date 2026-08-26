<template>
  <el-dialog v-model="visible" title="导入表" width="min(1100px, 92vw)" top="5vh" append-to-body>
    <el-form ref="queryFormRef" :model="query" :inline="true">
      <el-form-item label="数据源" prop="dataName">
        <el-select v-model="query.dataName" filterable placeholder="请选择数据源">
          <el-option v-for="item in dataSources" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="表名称" prop="tableName">
        <el-input v-model="query.tableName" clearable @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input v-model="query.tableComment" clearable @keyup.enter="search" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="search">搜索</el-button>
        <el-button icon="Refresh" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="tableRef"
      border
      :data="rows"
      height="300"
      @row-click="row => tableRef?.toggleRowSelection(row)"
      @selection-change="selection => (selected = selection)"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="tableName" label="表名称" show-overflow-tooltip />
      <el-table-column prop="tableComment" label="表描述" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column prop="updateTime" label="更新时间" />
    </el-table>
    <pagination
      v-show="total > 0"
      v-model:page="query.pageNum"
      v-model:limit="query.pageSize"
      :total="total"
      @pagination="load"
    />
    <template #footer>
      <el-button type="primary" @click="submit">确定</el-button>
      <el-button @click="visible = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { DbTableQuery, DbTableVO } from '@namewta/domain-devtools';
import { reactive, ref } from 'vue';
import type { DevtoolsWebRuntime } from '../runtime';

const props = defineProps<{ runtime: DevtoolsWebRuntime }>();
const emit = defineEmits<{ ok: [] }>();
const visible = ref(false);
const total = ref(0);
const rows = ref<DbTableVO[]>([]);
const selected = ref<DbTableVO[]>([]);
const dataSources = ref<string[]>([]);
const tableRef = ref<ElTableInstance>();
const queryFormRef = ref<ElFormInstance>();
const query = reactive<DbTableQuery>({ pageNum: 1, pageSize: 10, dataName: '', tableName: '', tableComment: '' });

async function load() {
  const response = await props.runtime.service.listDatabaseTables({ ...query });
  rows.value = response.data?.rows ?? [];
  total.value = response.data?.total ?? 0;
}
function search() {
  query.pageNum = 1;
  void load();
}
function reset() {
  queryFormRef.value?.resetFields();
  search();
}
async function show(dataName: string) {
  const response = await props.runtime.service.dataSourceNames();
  dataSources.value = response.data ?? [];
  query.dataName = dataName || dataSources.value[0] || '';
  await load();
  visible.value = true;
}
async function submit() {
  if (!selected.value.length) return props.runtime.error('请选择要导入的表');
  const response = await props.runtime.service.importTables({
    tables: selected.value.map(item => item.tableName).join(','),
    dataName: query.dataName
  });
  props.runtime.success(response.msg ?? '导入成功');
  if (response.code === 200) {
    visible.value = false;
    emit('ok');
  }
}
defineExpose({ show });
</script>
