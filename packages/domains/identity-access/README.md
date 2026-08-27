# 身份与访问领域

## 当前状态

`@namewta/domain-identity-access` 已激活，供 Admin 与 Client Web 共同使用。

## 职责

拥有 ClientContext、验证码、登录、注册、社交登录、当前用户、会话恢复、登出和访问评估所需的终端无关模型、映射器与服务。通过注入的 HTTP、存储、加密和时间端口工作。

## 边界

本领域不依赖 Vue、DOM、路由器、具体 Axios/Storage 实现或 App ClientId，不拥有登录页面和 App 布局。后端仍是认证与授权权威。

## 后端映射

对应 `ruoyi-admin` 与 `ruoyi-system` 的 `/auth/**`、用户信息和菜单相关接口。

## 验证

覆盖精确 ClientContext、显式 ClientId、加密边界、会话命名空间、失败关闭、登录恢复和权限评估。
