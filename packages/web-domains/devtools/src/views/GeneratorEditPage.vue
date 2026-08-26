<template>
  <div class="devtools-generator-edit app-container">
    <el-card shadow="never">
      <el-alert v-if="detailError" type="error" :closable="false" show-icon>
        <template #title>
          生成配置加载失败。
          <el-button link type="primary" @click="loadDetail">重新加载</el-button>
        </template>
      </el-alert>
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
          <el-alert v-if="dictError" type="warning" :closable="false" show-icon>
            <template #title>
              字典类型加载失败，其他字段仍可编辑。
              <el-button link type="primary" @click="loadDictTypes">重新加载</el-button>
            </template>
          </el-alert>
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
            <el-table-column label="查询方式" min-width="130">
              <template #default="scope">
                <el-select v-model="scope.row.queryType">
                  <el-option v-for="item in queryTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="必填" width="68">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isRequired" true-value="1" false-value="0" />
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
          <el-alert v-if="menuError" type="warning" :closable="false" show-icon>
            <template #title>
              菜单目录加载失败，其他生成配置仍可编辑。
              <el-button link type="primary" @click="loadMenus">重新加载</el-button>
            </template>
          </el-alert>
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
                <el-form-item label="状态字段" prop="statusField">
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
              <el-col :xs="24" :md="12">
                <el-form-item label="组合唯一校验" prop="uniqueFields">
                  <el-switch v-model="info.enableUnique" data-testid="enable-unique" />
                  <el-select
                    v-if="info.enableUnique"
                    v-model="info.uniqueFields"
                    data-testid="unique-fields"
                    multiple
                    clearable
                    filterable
                    placeholder="请选择唯一字段"
                  >
                    <el-option
                      v-for="column in columns"
                      :key="column.columnName"
                      :label="columnLabel(column)"
                      :value="column.columnName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="排序调整" prop="sortField">
                  <el-switch v-model="info.enableSort" data-testid="enable-sort" />
                  <el-select
                    v-if="info.enableSort"
                    v-model="info.sortField"
                    data-testid="sort-field"
                    clearable
                    placeholder="请选择排序字段"
                  >
                    <el-option
                      v-for="column in sortableColumns"
                      :key="column.columnName"
                      :label="columnLabel(column)"
                      :value="column.columnName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <template v-if="info.tplCategory === 'tree'">
                <el-col :xs="24" :md="12">
                  <el-form-item label="树编码字段">
                    <el-select v-model="info.treeCode" data-testid="tree-code">
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
                    <el-select v-model="info.treeParentCode" data-testid="tree-parent-code">
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
                  <el-form-item label="树名称字段">
                    <el-select v-model="info.treeName" data-testid="tree-name">
                      <el-option
                        v-for="column in columns"
                        :key="column.columnName"
                        :label="columnLabel(column)"
                        :value="column.columnName"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="根节点值" prop="treeRootValue">
                    <el-input v-model="info.treeRootValue" data-testid="tree-root-value" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="祖级字段">
                    <el-select v-model="info.treeAncestorsField" data-testid="tree-ancestors" clearable>
                      <el-option
                        v-for="column in columns"
                        :key="column.columnName"
                        :label="columnLabel(column)"
                        :value="column.columnName"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="树排序字段">
                    <el-select v-model="info.treeOrderField" data-testid="tree-order" clearable>
                      <el-option
                        v-for="column in sortableColumns"
                        :key="column.columnName"
                        :label="columnLabel(column)"
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
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { DevtoolsWebRuntime } from '../runtime';

const props = defineProps<{ runtime: DevtoolsWebRuntime }>();
const route = useRoute();
const activeTab = ref('columns');
const submitting = ref(false);
const detailError = ref(false);
const dictError = ref(false);
const menuError = ref(false);
const basicForm = ref<ElFormInstance>();
const generationForm = ref<ElFormInstance>();
const columns = ref<DbColumnVO[]>([]);
const dictTypes = ref<DevtoolsDictType[]>([]);
const menus = ref<DevtoolsMenuOption[]>([]);
const info = reactive<Partial<DbTableVO>>({});
const javaTypes = ['Long', 'String', 'Integer', 'Double', 'BigDecimal', 'LocalDateTime', 'Boolean'];
const queryTypes = [
  ['EQ', '='],
  ['NE', '!='],
  ['GT', '>'],
  ['GE', '>='],
  ['LT', '<'],
  ['LE', '<='],
  ['LIKE', 'LIKE'],
  ['BETWEEN', 'BETWEEN']
].map(([value, label]) => ({ value, label }));
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
const sortableColumns = computed(() =>
  columns.value.filter(column =>
    ['Integer', 'Long', 'Double', 'BigDecimal', 'LocalDateTime'].includes(String(column.javaType ?? ''))
  )
);
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
  functionName: [{ required: true, message: '请输入功能名', trigger: 'blur' }],
  statusField: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) =>
        callback(info.enableStatus && !value ? new Error('请选择状态字段') : undefined),
      trigger: 'change'
    }
  ],
  uniqueFields: [
    {
      validator: (_rule: unknown, value: string[], callback: (error?: Error) => void) =>
        callback(info.enableUnique && !value?.length ? new Error('请选择唯一字段') : undefined),
      trigger: 'change'
    }
  ],
  sortField: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) =>
        callback(info.enableSort && !value ? new Error('请选择排序字段') : undefined),
      trigger: 'change'
    }
  ],
  treeRootValue: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) =>
        callback(info.tplCategory === 'tree' && !value ? new Error('请输入根节点值') : undefined),
      trigger: 'blur'
    }
  ]
};

function supportsDict(htmlType?: string) {
  return dictHtmlTypes.has(htmlType ?? '');
}
function normalizeDict(column: DbColumnVO) {
  if (!supportsDict(column.htmlType)) column.dictType = '';
}
function columnLabel(column: DbColumnVO) {
  return `${column.columnName ?? ''}：${column.columnComment ?? ''}`;
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
    columns: columns.value as unknown as DbTableForm['columns'],
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

watch(
  () => info.enableStatus,
  enabled => {
    if (!enabled) info.statusField = '';
  }
);
watch(
  () => info.enableUnique,
  enabled => {
    if (!enabled) info.uniqueFields = [];
  }
);
watch(
  () => info.enableSort,
  enabled => {
    if (!enabled) info.sortField = '';
  }
);

async function loadDetail() {
  const tableId = route.params.tableId as string | undefined;
  if (!tableId) return;
  try {
    const detail = (await props.runtime.service.get(tableId)).data;
    if (!detail) throw new Error('missing generator detail');
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
    detailError.value = false;
  } catch {
    detailError.value = true;
    props.runtime.error('生成配置加载失败，可点击重新加载');
  }
}
async function loadDictTypes() {
  try {
    dictTypes.value = await props.runtime.service.metadata.dictTypes(props.runtime.clientId());
    dictError.value = false;
  } catch {
    dictError.value = true;
    props.runtime.error('字典类型加载失败，可点击重新加载');
  }
}
async function loadMenus() {
  try {
    menus.value = await props.runtime.service.metadata.menus(props.runtime.clientId());
    menuError.value = false;
  } catch {
    menuError.value = true;
    props.runtime.error('菜单目录加载失败，可点击重新加载');
  }
}

onMounted(() => {
  void loadDetail();
  void loadDictTypes();
  void loadMenus();
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
