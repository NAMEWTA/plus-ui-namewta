---
name: frontend-crud-coding
description: 在当前前端项目中按现有 Vue 3 + TypeScript + Element Plus 代码风格生成或修改页面、API、types、组件接入和样式。用于新增列表页、表单弹窗页、树表页、系统管理页、workflow 页面，以及补全与后端接口对应的 src/api 和 src/views 代码。
---

# 前端编码规范

先对齐当前前端项目里的真实实现，再参考关联后端工程中代码生成器产出的前端模板。不要只套通用 Vue 模板，也不要把生成器模板原样照搬而忽略当前前端项目的实际演进。

## 适用场景

在下面这些任务里优先使用此 skill：

- 新增标准 CRUD 列表页、弹窗表单页、树表页。
- 补齐后端新增接口对应的 `src/api`、`src/views`、`types.ts`。
- 按系统管理、监控、工作流、demo 模块现有方式扩展页面功能。
- 调整已有列表页的搜索、导出、导入、树筛选、列显隐、权限按钮、样式壳。
- 把关联后端工程中的 generator 模板转换为符合当前前端项目风格的实际代码。

## 不适用场景

下面这些任务不要机械套用本 skill 的 CRUD 规则：

- 纯展示型落地页、营销页、可视化大屏。
- 完全独立的低代码设计器或第三方嵌入页。
- 全局框架升级、Vite 配置改造、构建链路迁移。
- 与当前项目目录结构明显不同的实验性页面。

## 执行流程

1. 先定位目标模块，并阅读 `src/api/<module>/<business>` 与 `src/views/<module>/<business>` 下最近似页面。
2. 再参考关联后端工程 `ruoyi-modules/ruoyi-gen/src/main/resources/vm/ts` 与 `vm/vue` 下的生成器模板，确认标准 CRUD 的基础骨架。
3. 新增代码时同时维护 `api/index.ts`、`api/types.ts`、`views/.../index.vue`，必要时补相关子页面或弹窗页。
4. 页面结构、样式组织、状态管理、权限指令、下载导出、字典使用都以仓库现有模式为准。
5. 如果后端接口与生成器套路一致，可以用 generator 模板作为起点；如果当前前端项目已有更强约定，以当前项目约定覆盖模板默认行为。

## 优先级规则

发生冲突时按下面顺序决策：

1. 当前目录下最近似页面的真实实现。
2. 当前项目公共组件、公共工具、公共样式约定。
3. 关联后端工程中的 generator 模板。
4. 通用 Vue / Element Plus 习惯。

也就是说：

- 同一模块已有页面怎么写，优先怎么写。
- 没有现成页面时，再退回到 generator 模板骨架。
- 没有现成模式时，才使用通用框架默认写法。

## 主要规则

详细规则见 [references/frontend.md](references/frontend.md)。
使用案例见 [references/examples.md](references/examples.md)。

## 仓库通用规则

- 遵循 [`.editorconfig`](../../../.editorconfig)：UTF-8、LF、默认 2 空格缩进。
- 遵循 [`.prettierrc`](../../../.prettierrc)：单引号、分号、`printWidth: 150`、`trailingComma: none`。
- 页面优先使用 `<script setup name="Xxx" lang="ts">`。
- 优先复用仓库已有基础设施，例如 `request`、`proxy?.$modal`、`proxy?.download`、`proxy?.useDict`、`pagination`、`right-toolbar`。
- 对于标准 CRUD 页，允许先按后端生成器模板组织 `api/types/index.vue` 骨架，再补齐当前前端项目自己的页面壳、样式和交互。
- 新页面不要无故引入另一套状态管理、另一套请求封装或另一套 UI 风格。

## 目录映射规则

通常按下面的对应关系组织代码：

- 后端路由 `/system/user/*` 对应 `src/api/system/user/*` 与 `src/views/system/user/*`
- 后端路由 `/monitor/xxx/*` 对应 `src/api/monitor/xxx/*` 与 `src/views/monitor/xxx/*`
- 后端路由 `/workflow/xxx/*` 对应 `src/api/workflow/xxx/*` 与 `src/views/workflow/xxx/*`
- 后端路由 `/demo/xxx/*` 对应 `src/api/demo/xxx/*` 与 `src/views/demo/xxx/*`

标准新增通常至少包含：

- `src/api/<module>/<business>/index.ts`
- `src/api/<module>/<business>/types.ts`
- `src/views/<module>/<business>/index.vue`

按业务复杂度，可能继续补：

- 导入弹窗
- 分配角色页
- 详情页
- 编辑页
- 子组件
- 自定义 SCSS 样式

## 任务分型

### 1. 标准单表 CRUD

目标是快速补齐 `api + types + index.vue`，优先参考 generator 模板，再贴近 demo 或系统模块现有页。

### 2. 强业务页面

如果页面包含树筛选、导入导出、更多操作、状态切换、角色分配、复杂校验、联动选择，则优先参考 `src/views/system/user/index.vue` 一类更完整页面。

### 3. 工作流页面

如果页面属于流程定义、分类、任务、实例等 workflow 目录，优先参考 `src/views/workflow/*`，不要硬套系统管理模块的页面骨架。

## 输出要求

使用本 skill 时，默认期望产出应满足：

- 类型完整，不把大量 `any` 塞进页面逻辑里。
- 查询、重置、分页、弹窗、删除、导出流程闭环完整。
- 权限指令、字典、公共组件接入到位。
- 样式尽量贴合现有页面壳，而不是只保证“功能能跑”。
- 如果是从 generator 模板演化而来，要体现出当前前端项目已有增强，而不是模板裸输出。

## 快速检查清单

- API 路径与后端路由完全对应。
- `src/api` 中同时维护 `index.ts` 和 `types.ts`。
- 列表页查询、重置、导出、删除、弹窗提交流程与现有页一致。
- 继续使用项目内权限指令与公共组件。
- 表单、查询、弹窗、表格样式优先复用现有布局类和 SCSS 片段。
- 缩进、引号、分号与仓库格式一致。

## 推荐提问方式

推荐把请求描述到下面这个粒度：

- 目标模块和业务名
- 后端接口前缀
- 是新增页面还是修改页面
- 是否需要导入、导出、树筛选、状态切换、字典、权限按钮
- 希望参考哪个现有页面

例如：

- 使用 `$frontend-crud-coding` 为 `/system/client` 补一套标准 CRUD 页面，参考 `system/user` 和 generator 模板。
- 使用 `$frontend-crud-coding` 修改 `workflow/category` 列表页，增加导出按钮和状态筛选，保持当前项目风格。
