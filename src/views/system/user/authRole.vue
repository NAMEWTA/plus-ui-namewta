<template>
  <div class="p-2 app-container auth-role-page">
    <el-card shadow="hover" class="search-panel auth-role-info">
      <template #header>
        <div class="panel-heading">
          <div><h3>基本信息</h3></div>
        </div>
      </template>
      <el-form :model="form" :inline="true" class="query-form auth-role-form">
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" disabled />
        </el-form-item>
        <el-form-item label="登录账号" prop="userName">
          <el-input v-model="form.userName" disabled />
        </el-form-item>
        <el-form-item label="客户端" prop="clientId">
          <el-select
            v-model="clientId"
            placeholder="请选择客户端后再分配角色"
            filterable
            style="width: 260px"
            @change="handleClientChange"
          >
            <el-option
              v-for="item in clientOptions"
              :key="item.id"
              :label="item.clientKey ? `${item.clientKey}（${item.clientId}）` : item.clientId"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="toolbar-shell">
          <div class="table-heading">
            <h3>角色信息</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" @click="submitForm()">提交</el-button>
            <el-button @click="close()">返回</el-button>
          </div>
        </div>
      </template>
      <el-table
        ref="tableRef"
        v-loading="loading"
        border
        class="data-table"
        :row-key="getRowKey"
        :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
        @row-click="clickRow"
        @selection-change="handleSelectionChange"
      >
        <el-table-column label="序号" width="55" type="index" align="center">
          <template #default="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          type="selection"
          :reserve-selection="true"
          :selectable="checkSelectable"
          width="55"
        ></el-table-column>
        <el-table-column label="角色编号" align="center" prop="roleId" />
        <el-table-column label="角色名称" align="center" prop="roleName">
          <template #default="scope">
            <span>{{ scope.row.roleName }}</span>
            <el-tag v-if="scope.row.clientDefault" class="ml-1" size="small" type="info">默认角色</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限字符" align="center" prop="roleKey" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:page="pageNum" v-model:limit="pageSize" :total="total" />
    </el-card>
  </div>
</template>

<script setup name="AuthRole" lang="ts">
import { RouteLocationNormalized } from 'vue-router';
import { listClientOptions } from '@/api/system/client';
import { ClientVO } from '@/api/system/client/types';
import { RoleVO } from '@/api/system/role/types';
import { getAuthRole, updateAuthRole } from '@/api/system/user';
import { UserForm } from '@/api/system/user/types';
import modal from '@/plugins/modal';
import tab from '@/plugins/tab';
import { parseTime } from '@/utils/ruoyi';

const route = useRoute();

const loading = ref(true);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const clientId = ref<string | number>();
const clientOptions = ref<ClientVO[]>([]);
const assignedRoleIds = ref<Set<string>>(new Set());
const roleIds = ref<Array<string | number>>([]);
const roles = ref<RoleVO[]>([]);
const form = ref<Partial<UserForm>>({
  nickName: undefined,
  userName: '',
  userId: undefined
});

const tableRef = ref<ElTableInstance>();
const syncingSelection = ref(false);

const currentClientRoleIdSet = computed(() => new Set(roles.value.map(role => String(role.roleId))));

/** 单击选中行数据 */
const clickRow = (row: RoleVO) => {
  if (checkSelectable(row)) {
    row.flag = !row.flag;
    tableRef.value?.toggleRowSelection(row, row.flag);
  }
};
/** 多选框选中数据 */
const handleSelectionChange = (selection: RoleVO[]) => {
  if (syncingSelection.value) {
    return;
  }
  const selectedIds = new Set(selection.map(item => String(item.roleId)));
  currentClientRoleIdSet.value.forEach(id => assignedRoleIds.value.delete(id));
  selectedIds.forEach(id => assignedRoleIds.value.add(id));
  roleIds.value = [...assignedRoleIds.value];
};
/** 保存选中的数据编号 */
const getRowKey = (row: RoleVO): string => {
  return String(row.roleId);
};
/** 检查角色状态 */
const checkSelectable = (row: RoleVO): boolean => {
  return row.status === '0' && !row.clientDefault;
};
/** 关闭按钮 */
const close = () => {
  const obj: RouteLocationNormalized = {
    fullPath: '',
    hash: '',
    matched: [],
    meta: undefined,
    name: undefined,
    params: undefined,
    query: undefined,
    redirectedFrom: undefined,
    path: '/system/user'
  };
  tab.closeOpenPage(obj as any);
};
/** 提交按钮 */
const submitForm = async () => {
  if (!clientId.value) {
    modal.msgWarning('请先选择客户端');
    return;
  }
  const userId = form.value.userId;
  const rIds = [...assignedRoleIds.value].join(',');
  await updateAuthRole({ userId: userId as string, roleIds: rIds });
  modal.msgSuccess('授权成功');
  close();
};

const applyRowSelection = async () => {
  syncingSelection.value = true;
  await nextTick();
  tableRef.value?.clearSelection();
  roles.value.forEach(row => {
    row.flag = assignedRoleIds.value.has(String(row.roleId));
    if (row.flag) {
      tableRef.value?.toggleRowSelection(row, true);
    }
  });
  await nextTick();
  syncingSelection.value = false;
};

const handleClientChange = async () => {
  pageNum.value = 1;
  if (!clientId.value) {
    roles.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  const userId = form.value.userId;
  if (!userId) {
    loading.value = false;
    return;
  }
  const res = await getAuthRole(userId, clientId.value);
  roles.value = res.data?.roles ?? [];
  const flaggedRoles = roles.value.filter(row => row?.flag && !row.clientDefault);
  flaggedRoles.forEach(row => assignedRoleIds.value.add(String(row.roleId)));
  roleIds.value = [...assignedRoleIds.value];
  total.value = roles.value.length;
  loading.value = false;
  await applyRowSelection();
};

const getList = async () => {
  const userId = route.params && route.params.userId;
  if (userId) {
    loading.value = true;
    clientOptions.value = await listClientOptions();
    const res = await getAuthRole(userId as string);
    Object.assign(form.value, res.data.user);
    loading.value = false;
  }
};
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.auth-role-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.auth-role-form :deep(.el-input) {
  width: 220px;
}

.auth-role-info :deep(.el-card__body) {
  padding-top: 14px !important;
}
</style>
