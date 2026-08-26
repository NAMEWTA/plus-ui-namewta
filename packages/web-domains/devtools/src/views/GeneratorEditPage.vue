<template>
  <div class="devtools-generator-edit app-container">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="basicForm" :model="info" :rules="basicRules" label-width="120px">
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item label="表名称" prop="tableName"><el-input v-model="info.tableName" /></el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="表描述" prop="tableComment"><el-input v-model="info.tableComment" /></el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="实体类名称" prop="className"><el-input v-model="info.className" /></el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="作者" prop="functionAuthor">
                  <el-input v-model="info.functionAuthor" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注"><el-input v-model="info.remark" type="textarea" :rows="3" /></el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="字段信息" name="columns">
          <el-table border :data="columns" row-key="columnId" max-height="calc(100vh - 300px)">
            <el-table-column label="字段列名" prop="columnName" min-width="130" show-overflow-tooltip />
            <el-table-column label="字段描述" min-width="140">
              <template #default="scope"><el-input v-model="scope.row.columnComment" /></template>
            </el-table-column>
            <el-table-column label="物理类型" prop="columnType" min-width="120" />
            <el-table-column label="Java 类型" min-width="130">
              <template #default="scope">
                <el-select v-model="scope.row.javaType">
                  <el-option v-for="type in javaTypes" :key="type" :label="type" :value="type" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Java 属性" min-width="140">
              <template #default="scope"><el-input v-model="scope.row.javaField" /></template>
            </el-table-column>
            <el-table-column label="插入" width="68">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isInsert" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="编辑" width="68">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isEdit" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="列表" width="68">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isList" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="查询" width="68">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isQuery" true-value="1" false-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="显示类型" min-width="140">
              <template #default="scope">
                <el-select v-model="scope.row.htmlType" @change="normalizeDict(scope.row)">
                  <el-option v-for="item in htmlTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="字典类型" min-width="180">
              <template #default="scope">
                <el-select
                  v-model="scope.row.dictType"
                  clearable
                  filterable
                  :disabled="!supportsDict(scope.row.htmlType)"
                >
                  <el-option v-for="dict in dictTypes" :key="dict.type" :label="dict.name" :value="dict.type">
                    <span>{{ dict.name }}</span>
                    <small>{{ dict.type }}</small>
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="生成信息" name="generation">
          <el-form ref="generationForm" :model="info" :rules="generationRules" label-width="130px">
            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item label="生成模板" prop="tplCategory">
                  <el-radio-group v-model="info.tplCategory">
                    <el-radio value="crud">单表</el-radio>
                    <el-radio value="tree">树表</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="前端模板" prop="frontendType">
                  <el-radio-group v-model="info.frontendType">
                    <el-radio value="vue">Vue</el-radio>
                    <el-radio value="react">React</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="生成包路径" prop="packageName">
                  <el-input v-model="info.packageName" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="模块名" prop="moduleName"><el-input v-model="info.moduleName" /></el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="业务名" prop="businessName"><el-input v-model="info.businessName" /></el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="功能名" prop="functionName"><el-input v-model="info.functionName" /></el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="上级菜单">
                  <el-tree-select
                    v-model="info.parentMenuId"
                    :data="menus"
                    node-key="id"
                    value-key="id"
                    check-strictly
                    filterable
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="导出能力"><el-switch v-model="info.enableExport" /></el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="状态字段">
                  <el-switch v-model="info.enableStatus" />
                  <el-select v-if="info.enableStatus" v-model="info.statusField" clearable>
                    <el-option
                      v-for="column in columns"
                      :key="column.columnName"
                      :label="column.columnComment || column.columnName"
                      :value="column.columnName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <template v-if="info.tplCategory === 'tree'">
                <el-col :xs="24" :md="12">
                  <el-form-item label="树编码字段">
                    <el-select v-model="info.treeCode">
                      <el-option
                        v-for="column in columns"
                        :key="column.columnName"
                        :label="column.columnName"
                        :value="column.columnName"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="树父编码字段">
                    <el-select v-model="info.treeParentCode">
                      <el-option
                        v-for="column in columns"
                        :key="column.columnName"
                        :label="column.columnName"
                        :value="column.columnName"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </template>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div class="footer-actions">
        <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
        <el-button @click="close">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type {
  DbColumnVO,
  DbTableForm,
  DbTableVO,
  DevtoolsDictType,
  DevtoolsMenuOption
} from '@namewta/domain-devtools';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { DevtoolsWebRuntime } from '../runtime';

const props = defineProps<{ runtime: DevtoolsWebRuntime }>();
const route = useRoute();
const activeTab = ref('columns');
const submitting = ref(false);
const basicForm = ref<ElFormInstance>();
const generationForm = ref<ElFormInstance>();
const columns = ref<DbColumnVO[]>([]);
const dictTypes = ref<DevtoolsDictType[]>([]);
const menus = ref<DevtoolsMenuOption[]>([]);
const info = reactive<Partial<DbTableVO>>({});
const javaTypes = ['Long', 'String', 'Integer', 'Double', 'BigDecimal', 'LocalDateTime', 'Boolean'];
const htmlTypes = [
  ['input', '文本框'],
  ['inputNumber', '数字输入'],
  ['textarea', '文本域'],
  ['select', '下拉框'],
  ['radio', '单选框'],
  ['checkbox', '复选框'],
  ['switch', '开关'],
  ['datetime', '日期控件'],
  ['imageUpload', '图片上传'],
  ['fileUpload', '文件上传'],
  ['editor', '富文本控件']
].map(([value, label]) => ({ value, label }));
const dictHtmlTypes = new Set(['select', 'radio', 'checkbox', 'switch']);
const basicRules = {
  tableName: [{ required: true, message: '请输入表名称', trigger: 'blur' }],
  tableComment: [{ required: true, message: '请输入表描述', trigger: 'blur' }],
  className: [{ required: true, message: '请输入实体类名称', trigger: 'blur' }],
  functionAuthor: [{ required: true, message: '请输入作者', trigger: 'blur' }]
};
const generationRules = {
  tplCategory: [{ required: true, message: '请选择生成模板', trigger: 'change' }],
  frontendType: [{ required: true, message: '请选择前端模板', trigger: 'change' }],
  packageName: [{ required: true, message: '请输入生成包路径', trigger: 'blur' }],
  moduleName: [{ required: true, message: '请输入模块名', trigger: 'blur' }],
  businessName: [{ required: true, message: '请输入业务名', trigger: 'blur' }],
  functionName: [{ required: true, message: '请输入功能名', trigger: 'blur' }]
};

function supportsDict(htmlType?: string) {
  return dictHtmlTypes.has(htmlType ?? '');
}
function normalizeDict(column: DbColumnVO) {
  if (!supportsDict(column.htmlType)) column.dictType = '';
}
function close() {
  void props.runtime.closeAndOpenPage({
    path: '/tool/gen',
    query: { t: Date.now().toString(), pageNum: route.query.pageNum }
  });
}
async function submit() {
  const [basicOk, generationOk] = await Promise.all([
    basicForm.value
      ?.validate()
      .then(() => true)
      .catch(() => false) ?? false,
    generationForm.value
      ?.validate()
      .then(() => true)
      .catch(() => false) ?? false
  ]);
  if (!basicOk || !generationOk) return props.runtime.error('表单校验未通过，请重新检查提交内容');
  columns.value.forEach(normalizeDict);
  const payload = {
    ...info,
    columns: columns.value,
    params: {
      treeCode: info.treeCode,
      treeName: info.treeName,
      treeParentCode: info.treeParentCode,
      parentMenuId: info.parentMenuId,
      enableExport: info.enableExport,
      enableStatus: info.enableStatus,
      statusField: info.statusField,
      enableUnique: info.enableUnique,
      uniqueFields: info.uniqueFields,
      enableSort: info.enableSort,
      sortField: info.sortField,
      treeRootValue: info.treeRootValue,
      treeAncestors: info.treeAncestorsField,
      treeOrderField: info.treeOrderField
    }
  } as DbTableForm;
  submitting.value = true;
  try {
    const response = await props.runtime.service.update(payload);
    props.runtime.success(response.msg ?? '保存成功');
    if (response.code === 200) close();
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  const tableId = route.params.tableId as string | undefined;
  if (!tableId) return;
  const [detailResponse, catalog, menuOptions] = await Promise.all([
    props.runtime.service.get(tableId),
    props.runtime.service.metadata.dictTypes(props.runtime.clientId()),
    props.runtime.service.metadata.menus(props.runtime.clientId())
  ]);
  const detail = detailResponse.data;
  if (!detail) return;
  columns.value = (detail.rows ?? []).map(column => ({ ...column }));
  Object.assign(info, {
    enableExport: true,
    enableStatus: false,
    statusField: '',
    enableUnique: false,
    uniqueFields: [],
    enableSort: false,
    sortField: '',
    frontendType: 'vue',
    treeRootValue: '0',
    treeAncestorsField: '',
    treeOrderField: '',
    ...detail.info
  });
  dictTypes.value = catalog;
  menus.value = menuOptions;
});
</script>

<style scoped>
.devtools-generator-edit {
  padding: 16px;
}
.footer-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}
.el-option small {
  float: right;
  color: var(--el-text-color-secondary);
  margin-left: 20px;
}
</style>
