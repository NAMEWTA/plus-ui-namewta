# 前端约定

## 优先参考的代码来源

- 关联后端工程中的生成器模板：
  `ruoyi-modules/ruoyi-gen/src/main/resources/vm/ts/*.vm`
  `ruoyi-modules/ruoyi-gen/src/main/resources/vm/vue/*.vm`
- `src/api/system/user/index.ts`
- `src/api/system/user/types.ts`
- `src/views/system/user/index.vue`
- `src/views/demo/demo/index.vue`
- `src/views/system/*`
- `src/views/workflow/*`
- `src/components/*`
- `src/assets/styles/components/*`

## 基础栈与格式

- 技术栈是 Vue 3 + TypeScript + Element Plus + Vite。
- 请求统一通过 `@/utils/request`。
- API 返回值类型常用 `AxiosPromise<T>`。
- 项目默认 2 空格缩进。
- 使用单引号和分号。
- 不要在一个页面里混入与仓库不一致的格式和写法。

## 决策顺序

写代码时按下面顺序取样：

1. 当前业务目录下最近似页面。
2. 当前模块下最近似 API/types 文件。
3. 当前项目的公共组件、公共工具、公共样式。
4. 关联后端工程的 generator 模板。
5. 通用 Vue 3 / Element Plus 默认写法。

如果上述规则冲突，优先相信当前项目真实代码。

## API 文件规则

- 标准 CRUD 的 API、types、列表页骨架可以先参考后端生成器模板，再根据当前前端项目风格落地。
- API 文件通常放在 `src/api/<module>/<business>/index.ts`。
- 同目录维护 `types.ts`。
- 常见 import 形式：
  `import request from '@/utils/request';`
  `import { AxiosPromise } from 'axios';`
  `import { XxxForm, XxxQuery, XxxVO } from './types';`
  `import { PageResult } from '@/api/types';`
- 列表接口通常返回 `AxiosPromise<PageResult<XxxVO>>`。
- 详情接口返回 `AxiosPromise<XxxVO>` 或更复杂的 `InfoVO`。
- 特殊请求参数沿用现有实现，例如：
  `parseStrEmpty(userId)`
  `headers: { isEncrypt: true, repeatSubmit: false }`
  `params` 用于 query string，`data` 用于 body。
- 当前仓库部分模块会在文件底部 `export default { ... }`，已有模块使用这种形式时继续保持一致。

### API 文件建议结构

标准 CRUD 一般按这个顺序组织：

1. import 区
2. 列表接口
3. 详情接口
4. 新增接口
5. 修改接口
6. 删除接口
7. 特殊接口
8. 可选的 `export default`

### API 常见判断

- 如果后端是列表分页接口，前端通常返回 `AxiosPromise<PageResult<XxxVO>>`。
- 如果后端返回复合结构，例如 `user + roles + posts`，单独定义 `InfoVO`。
- 如果接口需要加密或关闭重复提交，直接在 `headers` 里表达，不要另起封装。

## 类型文件规则

- 类型文件通常定义 `Query`、`VO`、`Form`，必要时补 `InfoVO`、`ResetPwdForm` 等扩展类型。
- `Query` 一般继承 `PageQuery`。
- `VO` 常继承 `BaseEntity`。
- ID 字段通常使用 `string | number`。
- 列表页多选 ID 常用 `Array<string | number>`。
- 数组字段在表单里常直接用 `string[]`、`number[]` 或宽松类型，优先跟随现有模块。

### 类型拆分建议

- `VO` 面向列表和详情展示。
- `Form` 面向新增和编辑。
- `Query` 面向列表筛选。
- `InfoVO` 面向详情页、编辑页、弹窗预加载等复合返回结构。

### 类型字段策略

- 能明确写出类型时，不要偷懒用 `any`。
- 只有在当前模块已有宽松写法或后端返回非常不稳定时，才保留 `any`。
- 如果列表和表单字段明显不同，不要强行复用一个接口类型。

## Vue 页面结构规则

- 标准 CRUD 页可先参考生成器的 `index.vue.vm` 骨架，再按本仓库现有页面补强。
- 页面优先使用 `<script setup name="Xxx" lang="ts">`。
- 常见列表页结构：
  搜索区卡片、表格区卡片、工具栏、分页、编辑弹窗。
- 常见页面状态包括：
  `loading`、`showSearch`、`ids`、`single`、`multiple`、`total`。
- 表单和查询对象通常通过 `reactive<PageData<Form, Query>>({...})` 管理。
- 弹窗状态通常使用：
  `const dialog = reactive<DialogOption>({ visible: false, title: '' });`
- 表单 ref 通常命名为 `queryFormRef`、`xxxFormRef`。
- 复杂页面可补充树面板、导入弹窗、子弹窗、路由跳转逻辑。

### 标准页面骨架

标准页面通常包含这些区域：

1. 搜索区
2. 表格区
3. 工具栏
4. 分页
5. 编辑弹窗

复杂页面可以额外增加：

- 左侧树筛选
- 导入弹窗
- 二级对话框
- 独立详情页
- 路由跳转按钮
- 列显隐控制

### 页面命名建议

- 页面组件名通常为业务名，例如 `name="User"`、`name="Demo"`。
- 页面根类名尽量带模块语义，例如：
  `system-user-page`
  `demo-demo-page`
  `workflow-category-page`

## 页面行为规则

- `getList` 负责发起列表请求、处理 loading、回填 `rows` 和 `total`。
- `handleQuery` 先把 `pageNum` 置为 `1`，再重新查询。
- `resetQuery` 负责清空查询表单、日期范围、树节点选择，然后重新加载。
- `handleSelectionChange` 更新 `ids`、`single`、`multiple`。
- `handleAdd` 重置表单并打开新增弹窗。
- `handleUpdate` 查详情后回填表单并打开编辑弹窗。
- `submitForm` 使用表单校验，通过后调用新增或修改接口，再提示成功并刷新列表。
- `handleDelete` 通常使用 `proxy?.$modal.confirm(...)` 二次确认。
- `handleExport` 使用 `proxy?.download(...)`。
- 日期范围查询沿用 `proxy?.addDateRange(queryParams.value, dateRange.value)`。
- 需要更稳妥地处理确认框或异步异常时，可沿用 `await-to-js` 的 `to(...)` 风格。

### 页面逻辑建议

- 新增和编辑优先共用一套弹窗和表单。
- `reset()` 与 `cancel()` 分开写，避免关闭弹窗时状态残留。
- `handleUpdate()` 先查详情再 `Object.assign(form.value, res.data)`。
- 删除、状态切换、解锁、重置密码这类危险操作优先保留确认提示。
- 列表页只做列表页职责，复杂复合逻辑优先拆到子组件或独立页面。

## 字典、权限与公共工具

- 字典通常通过：
  `const { xxx_dict } = toRefs<any>(proxy?.useDict('xxx_dict'));`
- 权限指令以仓库现状为准，存在 `v-hasPermi` 和 `v-has-permi` 两种写法；新增代码优先跟随所在目录附近文件，不要在同一文件里混用新的变体。
- 常用公共能力：
  `proxy?.$modal`
  `proxy?.download`
  `proxy?.useDict`
  `proxy?.getConfigKey`
  `checkPermi`
  `useUserStore`

### 权限规则

- 所有增删改导入导出按钮都先看附近页面是否有权限控制。
- 新按钮默认补权限指令，除非它是纯展示行为。
- 如果同目录页面使用 `v-hasPermi`，新代码优先继续用 `v-hasPermi`。
- 如果同目录页面使用 `v-has-permi`，新代码优先继续用 `v-has-permi`。

## 组件与样式规则

- 优先复用公共组件：
  `right-toolbar`
  `pagination`
  `ImageUpload`
  `ImagePreview`
  `FileUpload`
  `Editor`
  `DictTag`
- 页面样式不要堆大量内联样式，优先沿用仓库里的布局类和组件样式。
- 已有页面使用 SCSS 模块片段时，继续沿用：
  `@use '@/assets/styles/components/page-shell' as pageShell;`
  `@include pageShell.xxx;`
- 类名命名保持模块化，例如：
  `system-user-page`
  `demo-demo-page`
  `table-panel`
  `search-panel`
  `toolbar-shell`

### 样式落点建议

- 页面只需要轻量调整时，优先复用已有通用类。
- 页面结构明显复杂时，优先在 `<style lang="scss" scoped>` 中通过 `@use` 复用组件样式片段。
- 不要为了单页需求破坏全局组件样式。

## 与生成器模板的关系

- 关联后端工程生成器给出的前端结构可以作为起点，但真实页面通常更完整，包含：
  树筛选、列显隐、导入导出、更多操作、SCSS 页面壳、复杂表单校验、独立子页面。
- 因此新增页面时，不要只满足“能跑”，要先看所在模块已有页面的复杂度和 UI 组织方式。

### 什么时候优先看 generator

- 新增一个标准单表 CRUD 页面时。
- 当前项目里还没有这个业务对应页面时。
- 你只拿到了后端路由和字段信息时。

### 什么时候优先看现有页面

- 当前模块已经有同类页面时。
- 页面包含树筛选、导入导出、联动弹窗、路由跳转时。
- 任务是“修改已有页面”而不是“新建页面”时。

## 避免事项

- 不要直接把后端仓库里的前端模板原样复制进来。
- 不要跳过 `types.ts`，把类型全堆在页面里。
- 不要绕开 `request` 自己再包一层请求工具。
- 不要引入与仓库现状不一致的 CSS 组织方式。
- 不要为了省事删掉权限控制、导出、导入、树筛选、日期范围等现有交互能力。

## 交付前自检

交付前至少检查这些点：

- 页面能否完整走通查询、新增、编辑、删除、导出流程。
- 类型是否与接口返回结构一致。
- 是否保留了原页面已有的权限和交互能力。
- 是否沿用了当前模块已有的组件和样式壳。
- 是否只是“生成器裸页”，如果是，需要继续补齐到当前项目风格。