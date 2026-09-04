<template>
  <div class="p-2 app-container third-page">
    <el-card shadow="never">
      <template #header><div class="toolbar-shell"><h3>{{ title }}</h3><el-button v-if="editable" v-hasPermi="[permission + ':add']" type="primary" plain icon="Plus" @click="openForm">新增</el-button></div></template>
      <el-form :inline="true" @submit.prevent="load">
        <el-form-item v-if="kind !== 'statistics' && kind !== 'invocations'" label="供应商"><el-input v-model="providerCode" clearable placeholder="provider code" /></el-form-item>
        <el-form-item v-if="kind === 'endpoints'" label="供应商 ID"><el-input v-model="providerId" clearable /></el-form-item>
        <el-form-item><el-button type="primary" icon="Search" @click="load">查询</el-button></el-form-item>
      </el-form>
      <el-table v-loading="loading" border :data="rows">
        <el-table-column v-for="column in columns" :key="column.prop" :label="column.label" :prop="column.prop" min-width="140" show-overflow-tooltip />
        <el-table-column v-if="editable" label="操作" width="160" fixed="right">
          <template #default="scope"><el-button v-hasPermi="[permission + ':remove']" link type="danger" icon="Delete" @click="remove(scope.row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="title" width="620px">
      <el-form :model="form" label-width="110px">
        <template v-if="kind === 'providers'">
          <el-form-item label="编码"><el-input v-model="form.providerCode" /></el-form-item><el-form-item label="名称"><el-input v-model="form.providerName" /></el-form-item><el-form-item label="Base URL"><el-input v-model="form.baseUrl" /></el-form-item>
        </template>
        <template v-else-if="kind === 'endpoints'">
          <el-form-item label="供应商 ID"><el-input v-model="form.providerId" /></el-form-item><el-form-item label="供应商编码"><el-input v-model="form.providerCode" /></el-form-item><el-form-item label="接口编码"><el-input v-model="form.endpointCode" /></el-form-item><el-form-item label="名称"><el-input v-model="form.endpointName" /></el-form-item><el-form-item label="方法"><el-select v-model="form.httpMethod"><el-option v-for="method in methods" :key="method" :label="method" :value="method" /></el-select></el-form-item><el-form-item label="相对路径"><el-input v-model="form.relativePath" /></el-form-item>
        </template>
        <template v-else><el-form-item label="供应商编码"><el-input v-model="form.providerCode" /></el-form-item><el-form-item label="接口编码"><el-input v-model="form.endpointCode" /></el-form-item><el-form-item label="凭据类型"><el-input v-model="form.credentialType" /></el-form-item><el-form-item label="凭据 JSON"><el-input v-model="form.secretJson" type="textarea" show-password /></el-form-item></template>
      </el-form>
      <template #footer><el-button type="primary" @click="save">保存</el-button><el-button @click="dialogVisible = false">取消</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Endpoint, Invocation, Provider, Statistic, CredentialSummary, ThirdService } from '@namewta/domain-third';
import { computed, onMounted, reactive, ref } from 'vue';
import type { ThirdWebRuntime } from './runtime';

const props = defineProps<{ runtime: ThirdWebRuntime; kind: 'providers' | 'endpoints' | 'credentials' | 'invocations' | 'statistics' }>();
const loading = ref(false); const rows = ref<Array<Provider | Endpoint | CredentialSummary | Invocation | Statistic>>([]); const providerCode = ref(''); const providerId = ref(''); const dialogVisible = ref(false);
const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const form = reactive<Record<string, any>>({ providerCode: '', providerName: '', baseUrl: '', providerId: '', endpointCode: '', endpointName: '', httpMethod: 'GET', relativePath: '/', requestMode: 'JSON', responseMode: 'JSON', credentialType: 'API_KEY', secretJson: '', enabled: true });
const config = computed(() => ({ providers: { title: '三方供应商', permission: 'third:provider', editable: true, columns: [{ label: '编码', prop: 'providerCode' }, { label: '名称', prop: 'providerName' }, { label: 'Base URL', prop: 'baseUrl' }, { label: '状态', prop: 'status' }] }, endpoints: { title: '三方接口', permission: 'third:endpoint', editable: true, columns: [{ label: '供应商', prop: 'providerCode' }, { label: '接口编码', prop: 'endpointCode' }, { label: '方法', prop: 'httpMethod' }, { label: '路径', prop: 'relativePath' }, { label: '状态', prop: 'status' }] }, credentials: { title: '凭据摘要', permission: 'third:credential', editable: true, columns: [{ label: '供应商', prop: 'providerCode' }, { label: '接口', prop: 'endpointCode' }, { label: '类型', prop: 'credentialType' }, { label: '版本', prop: 'version' }, { label: '过期时间', prop: 'expiresAt' }] }, invocations: { title: '调用明细', permission: 'third:invocation', editable: false, columns: [{ label: '请求 ID', prop: 'requestId' }, { label: '接口', prop: 'endpointCode' }, { label: '状态', prop: 'logicalStatus' }, { label: '失败分类', prop: 'failureCategory' }, { label: '耗时', prop: 'durationMs' }] }, statistics: { title: '调用统计', permission: 'third:statistics', editable: false, columns: [{ label: '接口', prop: 'endpointCode' }, { label: '日期', prop: 'statDate' }, { label: '调用次数', prop: 'attemptCount' }, { label: '成功', prop: 'successCount' }, { label: '失败', prop: 'failureCount' }, { label: '限流拒绝', prop: 'rejectedCount' }] } }[props.kind]));
const title = computed(() => config.value.title); const permission = computed(() => config.value.permission); const editable = computed(() => config.value.editable); const columns = computed(() => config.value.columns);
async function load() { loading.value = true; try { const service = props.runtime.service; const response = props.kind === 'providers' ? await service.listProviders(providerCode.value) : props.kind === 'endpoints' ? await service.listEndpoints(providerId.value || undefined, providerCode.value || undefined) : props.kind === 'credentials' ? await service.listCredentials(providerCode.value) : props.kind === 'invocations' ? await service.listInvocations(providerCode.value) : await service.listStatistics(providerCode.value); rows.value = response.data ?? []; } finally { loading.value = false; } }
function openForm() { Object.keys(form).forEach(key => { form[key] = key === 'enabled' ? true : key === 'httpMethod' ? 'GET' : key === 'relativePath' ? '/' : ''; }); dialogVisible.value = true; }
async function save() { try { const service = props.runtime.service; if (props.kind === 'providers') await service.saveProvider(form as any); else if (props.kind === 'endpoints') await service.saveEndpoint({ ...form, requestMode: 'JSON', responseMode: 'JSON' } as any); else if (props.kind === 'credentials') await service.saveCredential(form as any); dialogVisible.value = false; props.runtime.success?.('保存成功'); await load(); } catch (error) { props.runtime.error?.(String(error)); } }
async function remove(row: any) { await props.runtime.confirm?.('确认删除当前配置？'); if (props.kind === 'providers') await props.runtime.service.deleteProvider(row.providerId); else if (props.kind === 'endpoints') await props.runtime.service.deleteEndpoint(row.endpointId); else if (props.kind === 'credentials') await props.runtime.service.deleteCredential(row.credentialId); await load(); }
onMounted(load);
</script>
