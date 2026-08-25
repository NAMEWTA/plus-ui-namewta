<template>
  <div class="p-2 app-container">
    <h2>流程分类</h2>
    <el-button v-hasPermi="['workflow:category:add']" type="primary" @click="addRoot">新增</el-button>
    <el-table v-loading="loading" :data="rows" row-key="categoryId">
      <el-table-column prop="categoryName" label="分类名称" />
      <el-table-column prop="orderNum" label="显示顺序" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-hasPermi="['workflow:category:remove']" link type="danger" @click="remove(row.categoryId)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup name="Category" lang="ts">
import type { CategoryVO } from '@namewta/domain-workflow';
import { onMounted, ref } from 'vue';
import type { WorkflowWebRuntime } from '../runtime';
const { runtime } = defineProps<{ runtime: WorkflowWebRuntime }>();
const rows = ref<CategoryVO[]>([]);
const loading = ref(false);
const load = async () => {
  loading.value = true;
  try {
    rows.value = (await runtime.service.listCategories()).data ?? [];
  } finally {
    loading.value = false;
  }
};
const addRoot = async () => {
  await runtime.service.addCategory({ categoryName: '新流程分类', parentId: 0, orderNum: 0 });
  runtime.success('新增成功');
  await load();
};
const remove = async (id: string | number) => {
  await runtime.confirm('是否确认删除流程分类？');
  await runtime.service.deleteCategory(id);
  runtime.success('删除成功');
  await load();
};
onMounted(load);
</script>
