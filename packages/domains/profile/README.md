# 档案领域

`@namewta/domain-profile` 对应后端 `ruoyi-profile`，拥有个人/企业申请、换绑、负责人转移、材料标签、材料引用和管理档案的领域类型、权限常量与 HTTP 服务。

本包不依赖 Vue、DOM、浏览器存储或具体请求实现。普通身份探测在 transport 边界严格投影为纯状态，只有个人完整身份匹配结果可以携带旧 system 手机号掩码；管理明文字段与材料访问仅由对应管理服务返回，后端仍是最终授权者。

验证命令：`pnpm --filter @namewta/domain-profile test`、`pnpm --filter @namewta/domain-profile typecheck`、`pnpm --filter @namewta/domain-profile lint`。