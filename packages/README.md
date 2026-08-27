# 共享包目录

`packages` 按所有权而不是按技术文件类型划分：

- `domains`：无界面业务领域。
- `web-domains`：领域对应的 Vue Web 表现层。
- `platform`：跨领域最小端口和运行时合同。
- `adapters`：浏览器或未来终端的具体能力实现。
- `web-kit`：被多个真实消费者证明稳定的 Web 共享机制。
- `api-contracts`：OpenAPI 生成的传输合同。

所有包必须声明工作区依赖、只公开必要入口并避免大而全的 barrel。禁止跨包相对导入、深层导入、依赖 App 内部或通过副作用自动注册。
