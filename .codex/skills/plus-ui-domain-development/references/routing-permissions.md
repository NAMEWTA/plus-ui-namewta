# 路由与权限

## Admin 动态路由

1. `apps/admin-web/src/permission.ts` 在受保护导航中恢复用户信息和菜单。
2. `apps/admin-web/src/store/modules/permission.ts` 调用 `apps/admin-web/src/application/services.ts` 装配的 `identityAccessService.getMenus()`，将后端菜单通过 `filterAsyncRouter` 和 `assembleServerRoutes` 转为路由。
3. `apps/admin-web/src/router/adminManifestRegistry.ts` 把后端组件键解析为已选择 Web 领域的注册项。
4. App 自有静态页面可由 Admin 本地 `views` 映射兜底；领域页面必须来自公开清单，不得深层导入。
5. 路由使用 `router.addRoute` 注入；恢复结束后以 replace 导航，避免守卫循环。

当前没有已激活的第二个 App。未来终端必须拥有独立领域选择、ClientId 和会话命名空间，不得继承 Admin 的全量菜单或默认 Client。

## 按钮权限

- `v-hasPermi` 与 `v-hasRoles` 位于 `apps/admin-web/src/directive/permission`。
- 命令式检查位于 `apps/admin-web/src/application/access.ts`。
- 两者都应调用统一的访问评估器，保证空值、缺少会话和不匹配权限失败关闭。
- 菜单过滤、按钮隐藏都不是安全边界；后端接口必须独立鉴权。

## 修改时核对

- 后端组件键是否与 Web 领域 manifest 完全一致。
- App 是否同时选择了 headless domain 与对应 web-domain。
- 未选择能力是否有明确诊断且不会获得路由。
- 登录恢复顺序是否仍为用户信息、菜单、动态注入、替换导航。
- 权限指令与命令式 API 是否使用相同角色/权限语义。
- 失败、缺失、畸形响应是否保持不可见或不可操作，而不是默认放行。
