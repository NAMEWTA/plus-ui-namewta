# 上游跟踪

本目录只保存前端上游能力评估与映射材料。产品架构以 `main` 的本地 monorepo 为权威，上游 `6.X-Vue` 是只读能力来源，不要求目录同构。

评估上游变化时：

1. 识别新增能力、缺陷修复、安全变化和行为不变量。
2. 映射到本地 `apps`、`domains`、`web-domains`、`platform`、`adapters`、`web-kit` 或 `tooling` 的真实 owner。
3. 明确记录 `adopt`、`adapt`、`reject` 或 `defer`，并给出理由和验证证据。
4. 安全变化不得静默延后；实现必须进入当前本地 owner 并通过对应门禁。
