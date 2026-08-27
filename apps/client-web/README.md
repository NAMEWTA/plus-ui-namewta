# Client Web 应用

## 当前状态

`@namewta/client-web` 是已激活的第二个浏览器 App，拥有独立构建、预览、ClientContext、会话命名空间、布局与主题。

## 职责

- 组合 admin、system 与 demo 的公开 domain；只选择 admin 与 demo 的 Web manifest。system 仅提供身份和菜单端口，不向 Client 注册系统管理页面。
- 创建本 App 的浏览器请求、存储和加密适配器。
- 拥有基于部署路径的路由、品牌导航和最小页面宿主。

## 边界

Client 不是 Admin 的复制品，不拥有系统管理、工作流、AI、开发工具或运维能力。禁止导入 Admin 内部、未选择领域、包内部路径、默认 Client 或 `Admin-Token` 会话键。

## 公开入口

- `src/main.ts`：浏览器入口。
- `src/composition.ts`：编译期领域选择与运行时组合。
- `src/application.ts`：应用创建和宿主能力装配。

## 后端映射

通过 admin、system 与 demo 合同访问 `ruoyi-admin`、`ruoyi-system`、`ruoyi-demo` 的已选接口。部署必须提供非空且与服务端能力匹配的 `VITE_CLIENT_WEB_CLIENT_ID`。

## 验证

运行本包的 test、typecheck、build，并通过根级架构检查、双 App 构建及 Client 专属 Playwright 流程。