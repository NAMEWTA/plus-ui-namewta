<template>
  <div class="p-2 app-container">
    <h2>流程表达式</h2>
    <el-button v-hasPermi="['workflow:spel:add']" type="primary" @click="addDefault">新增</el-button>
    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="componentName" label="组件名称" />
      <el-table-column prop="methodName" label="方法名" />
      <el-table-column prop="viewSpel" label="表达式" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-hasPermi="['workflow:spel:remove']" link type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup name="Spel" lang="ts">
import type { SpelVO } from '@namewta/domain-workflow';
import { onMounted, ref } from 'vue';
import type { WorkflowWebRuntime } from '../runtime';
const { runtime } = defineProps<{ runtime: WorkflowWebRuntime }>();
const rows = ref<SpelVO[]>([]);
const loading = ref(false);
const load = async () => {
  loading.value = true;
  try {
    rows.value = (await runtime.service.listSpel()).data?.rows ?? [];
  } finally {
    loading.value = false;
  }
};
const addDefault = async () => {
  await runtime.service.addSpel({ componentName: '', methodName: '', methodParams: '', viewSpel: '', status: '0' });
  runtime.success('新增成功');
  await load();
};
const remove = async (id: string | number) => {
  await runtime.confirm('是否确认删除流程表达式？');
  await runtime.service.deleteSpel(id);
  await load();
};
onMounted(load);
</script>
