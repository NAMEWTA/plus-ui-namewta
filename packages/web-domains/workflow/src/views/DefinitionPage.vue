<template>
  <div class="p-2 app-container">
    <h2>流程定义</h2>
    <el-select v-model="query.category" placeholder="流程分类" @change="load">
      <el-option v-for="item in categories" :key="item.id" :label="item.label" :value="item.id" />
    </el-select>
    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="flowName" label="流程名称" />
      <el-table-column prop="flowCode" label="流程编码" />
      <el-table-column prop="version" label="版本" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-hasPermi="['workflow:definition:publish']" link @click="publishRow(row.id)">发布</el-button>
          <el-button v-hasPermi="['workflow:definition:remove']" link type="danger" @click="remove(row.id)">
            删除
          </el-button>
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
  </div>
</template>
<script setup name="processDefinition" lang="ts">
import type { CategoryTreeVO, FlowDefinitionQuery, FlowDefinitionVO } from '@namewta/domain-workflow';
import { onMounted, reactive, ref } from 'vue';
import type { WorkflowWebRuntime } from '../runtime';
const { runtime } = defineProps<{ runtime: WorkflowWebRuntime }>();
const rows = ref<FlowDefinitionVO[]>([]);
const categories = ref<CategoryTreeVO[]>([]);
const total = ref(0);
const loading = ref(false);
const query = reactive<FlowDefinitionQuery>({ category: '', pageNum: 1, pageSize: 10 });
const load = async () => {
  loading.value = true;
  try {
    const response = await runtime.service.listDefinitions(query);
    rows.value = response.data?.rows ?? [];
    total.value = response.data?.total ?? 0;
  } finally {
    loading.value = false;
  }
};
const publishRow = async (id: string) => {
  await runtime.service.publishDefinition(id);
  runtime.success('发布成功');
  await load();
};
const remove = async (id: string) => {
  await runtime.confirm('是否确认删除流程定义？');
  await runtime.service.deleteDefinition(id);
  await load();
};
onMounted(async () => {
  categories.value = (await runtime.service.categoryTree()).data ?? [];
  await load();
});
</script>
