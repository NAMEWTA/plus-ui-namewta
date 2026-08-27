# 系统管理领域

`@namewta/domain-system` 已激活，拥有用户、部门、岗位、角色、菜单、字典、参数、通知、OSS、个人资料和监控相关的领域模型、查询/命令服务与传输映射。

本领域不拥有 Vue 页面、表格交互、弹窗、编辑器、下载副作用、App 路由或后端授权，也不依赖具体请求适配器。宿主能力通过端口注入。

后端只映射 `ruoyi-system` 的 `/system/**`、`/resource/**` 与 `/monitor/**` 接口。资源目录按 Controller base path 命名，例如 `client/`、`dict-data/`、`oss-upload/` 与 `monitor/online/`。Admin 选择完整 system Web 能力；Client 仅无界面组合身份与菜单端口。

验证覆盖请求参数、领域映射、资源安全边界、错误分类和公开入口。