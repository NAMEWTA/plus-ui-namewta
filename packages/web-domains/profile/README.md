# 档案管理 Web 领域

`@namewta/web-domain-profile` 对应 profile 领域的材料标签、个人档案和企业档案管理页面，并预注册两类 workflow 审核表单。

本包通过 `ProfileWebRuntime` 获取领域服务、实时权限判断、确认/反馈、已授权材料下载、用户检索和 workflow 办理能力，不拥有 App 路由、请求单例、当前会话或后端授权。T-10 固定公开入口和 componentKey；材料标签、个人与企业页面分别由后续票据在既定子目录实现。

验证命令：`pnpm --filter @namewta/web-domain-profile test`、`pnpm --filter @namewta/web-domain-profile typecheck`、`pnpm --filter @namewta/web-domain-profile lint`。