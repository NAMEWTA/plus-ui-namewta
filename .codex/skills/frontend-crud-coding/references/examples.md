# 使用案例

## 案例 1：新增标准 CRUD 页面

### 用户提问示例

```text
使用 $frontend-crud-coding 为 system/client 补一套前端 CRUD 页面。
后端接口已经有 /system/client/list、/system/client/{id}、POST /system/client、PUT /system/client、DELETE /system/client/{ids}。
请参考 generator 模板和现有的 system/user、system/config 页面风格实现。
```

### 期望执行方式

- 先看 `src/api/system/client/*` 是否已存在。
- 再看 `src/views/system/client/index.vue` 是否为空或缺失。
- 参考同目录系统模块页面，确定是否需要搜索卡片、表格卡片、弹窗、导出按钮。
- 再参考关联后端工程中的 generator 模板，补齐基础骨架。

### 期望产物

- `src/api/system/client/index.ts`
- `src/api/system/client/types.ts`
- `src/views/system/client/index.vue`

## 案例 2：把 generator 模板落成当前项目风格

### 用户提问示例

```text
使用 $frontend-crud-coding 按 generator 模板为 demo/order 生成一个标准页面，但不要直接复制模板，要改成当前前端项目现有样式壳和工具链写法。
```

### 期望执行方式

- 先看 generator 的 `ts/types/index.vue` 模板。
- 再看 `src/views/demo/demo/index.vue`、`src/views/system/user/index.vue` 的实际风格差异。
- 生成的页面要使用当前项目里的 `right-toolbar`、`pagination`、`proxy?.$modal`、`proxy?.download` 等。

## 案例 3：修改已有列表页

### 用户提问示例

```text
使用 $frontend-crud-coding 修改 system/user 页面：
1. 新增一个创建时间快捷筛选
2. 导出按钮放到更多菜单中
3. 保持现有样式和交互不变
```

### 期望执行方式

- 优先阅读现有 `src/views/system/user/index.vue`。
- 判断这是“已有页面增强”，不是“重新生成页面”。
- 保留树筛选、导入导出、列显隐、角色分配等现有能力。
- 增量修改，而不是重写整个页面。

## 案例 4：补齐复杂业务页面

### 用户提问示例

```text
使用 $frontend-crud-coding 为 workflow/category 增加导入、导出和状态切换功能，参考 system/user 的完整页面能力，但保持 workflow 模块自己的风格。
```

### 期望执行方式

- 优先看 `src/views/workflow/category/index.vue`。
- 再看 `src/views/system/user/index.vue` 里复杂列表页的做法。
- 只迁移需要的能力，不把用户模块专属逻辑照搬到 workflow 页面。

## 案例 5：只补 API 和 types

### 用户提问示例

```text
使用 $frontend-crud-coding 为 monitor/cache 补全前端 API 和 types，页面先不改。
```

### 期望执行方式

- 只维护 `src/api/monitor/cache/index.ts` 和 `src/api/monitor/cache/types.ts`。
- 仍然要与后端路由、现有 API 风格、返回类型保持一致。

## 案例 6：推荐的高质量任务描述

下面这种描述最容易得到稳定结果：

```text
使用 $frontend-crud-coding 在当前前端项目中新增一个 `/system/notice` 列表页增强：
1. 保留现有页面
2. 新增状态筛选和导出
3. API 路径沿用后端现有接口
4. 参考 system/user 的工具栏与导出交互
5. 参考 generator 模板补齐缺失的 types 定义
```

## 不推荐的任务描述

下面这种描述太模糊，容易让产物偏离项目：

```text
帮我写个后台页面
```

更好的写法至少要补充：

- 模块名
- 业务名
- 后端接口前缀
- 是新增还是修改
- 想参考哪个现有页面
