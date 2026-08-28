# App 目录

## 当前状态

- `admin-web` 是当前唯一已激活、可构建和部署的浏览器 App。
- `client-web`、`mobile-web`、`miniapp-taro` 是仅含 README 的未来终端占位，不属于工作区包。

## 目录职责

每个 App 拥有自己的入口、ClientContext、环境变量、会话命名空间、领域选择、路由装配、布局、品牌、主题、静态资源和部署配置。

App 可从 `packages/**` 的公开入口组合所需能力，但不得导入其他 App、深层导入包内部，也不得重新拥有可复用领域规则。

相较上游单 App 结构，这里只保存“这个终端如何组装和交付”，不保存可复用的后端 API、领域类型或管理页面。新增 App 应复用 domain/web-domain/platform，而不是复制 `admin-web`。

## 激活新终端

必须先通过独立规格明确产品范围、Client、安全合同、所选领域、技术栈、构建和部署方式，再创建真实包与源码。占位阶段不得添加空 `package.json` 或虚假构建脚本。
