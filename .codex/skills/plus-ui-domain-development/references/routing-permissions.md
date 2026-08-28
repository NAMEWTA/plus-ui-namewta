# 动态路由与权限

## 导航恢复链路

1. `apps/admin-web/src/permission.ts` 通过 `restoreProtectedNavigation` 先恢复用户身份。
2. `apps/admin-web/src/store/modules/navigation.ts` 调用 `identityAccessService.getMenus()` 获取当前 Client 已裁剪的后端菜单。
3. navigation Store 使用 `@namewta/platform-app-runtime` 的 `projectServerRoutes` 生成 sidebar、topbar、default 和 Router 投影。
4. `apps/admin-web/src/router/adminManifestRegistry.ts` 只解析编译期已选择的 Web domain manifest；Layout、ParentView、InnerLink 由 App 显式提供。
5. 守卫依次执行 `getInfo -> getRouters -> addRoute -> replace`。任一步失败都不得替换到未注册目标。

当前没有已激活的第二个 App。未来终端必须拥有独立领域选择、ClientId、会话命名空间和 navigation state，不得继承 Admin 的全量菜单或默认 Client。

## 权限组合

- 终端无关语义归 `@namewta/platform-permission`。
- Vue 的 `v-hasPermi`、`v-hasRoles` 安装入口归 `@namewta/web-kit-permission`。
- Admin 在 `apps/admin-web/src/directive/index.ts` 注入 `createAdminAccessEvaluator` provider；provider 必须在指令执行时读取当前会话，不缓存权限快照。
- 页面和宿主需要命令式判断时使用同一 evaluator，不能另写角色、通配符或超级管理员逻辑。
- 菜单投影和按钮隐藏不是安全边界；后端接口必须独立鉴权。

## 失败行为

- 未知组件键、未选择领域和缺失 manifest registration 由 Admin diagnostic 页面失败关闭。
- 重复 route name 由 App Runtime 返回结构化诊断，Admin 负责 UI 呈现。
- 非空权限/角色数组之外的指令绑定直接报错；权限或角色不匹配时移除元素。
- 后端菜单是当前 Client 的权威输入，前端不得重新过滤或补偿跨 Client 菜单。

## 修改检查

- 身份、菜单、注册和恢复顺序是否保持不变。
- 新页面组件键是否由所属 Web domain manifest 公开并被 App 显式选择。
- navigation Store 是否只维护 App 导航投影，不拥有页面扫描 fallback 或权限算法。
- 权限指令和命令式 API 是否共享同一 evaluator provider。
- 涉及认证、动态菜单或权限时是否运行对应 Playwright 场景。