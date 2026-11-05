# pi-durable Ops Agent Lab

这是 PI Agent Lab 的可运行落地项目，对应网站中的“让 Agent 在崩溃后继续工作”模块。它固定使用 `@earendil-works/pi-durable@1.5.0`，把三个关键事实变成可以重复执行的证据：

1. SQLite 重开后恢复相同 Conversation、Document 与 Submission。
2. Task phase 可以从 checkpoint 继续；可能重跑的外部效果必须有幂等键。
3. 真实模型 Agent 使用固定 `requestId`，崩溃后重跑同一命令不会重复接纳同一请求。

> `pi-durable` 仍是实验性 API。课程锁定版本，升级时必须重新跑本目录的测试并审查官方 changelog。

## 1. 安装并运行离线证据

```bash
cd labs/pi-durable-ops
npm install
npm test
```

`npm test` 不需要模型凭据：

- `storage-smoke.ts` 使用 faux provider，验证 SQLite reopen、typed document 与 `requestId` 去重。
- `recovery-drill.ts` 在第 2 个 effect 后关闭 Harness，再从 SQLite checkpoint 恢复到第 5 个；durable memo 保证可见效果没有重复。

## 2. 运行真实 Ops Agent

```bash
export OPENAI_API_KEY=...
export REQUEST_ID=ops-review-001
npm run agent -- "只读检查当前仓库，运行允许的检查并报告证据"
```

默认阻止 `bash`。只有在低风险测试仓库中审查任务后才临时打开：

```bash
ALLOW_BASH=1 REQUEST_ID=ops-review-002 \
  npm run agent -- "读取 README，运行 npm test，并报告失败证据；不要修改文件"
```

可选环境变量：

- `PI_DURABLE_MODEL`：默认 `gpt-6-sol`。
- `AGENT_CWD`：Agent 的工作目录，默认当前目录。
- `DURABLE_DATA_DIR`：SQLite 数据目录，默认 `.data/`。
- `REQUEST_ID`：业务幂等键；同一个业务请求必须复用同一个值。
- `ALLOW_BASH=1`：允许 bash；这只是课程开关，不是安全沙箱。

## 3. 崩溃恢复演练

1. 选择一个会持续几十秒、但没有外部写入的只读任务。
2. 用固定的 `REQUEST_ID` 启动 `npm run agent`。
3. 在模型或工具运行中终止进程。
4. 使用完全相同的 `REQUEST_ID` 和 prompt 再运行一次。
5. 检查输出中的 database、conversation、requestId、runbook 与 usage。

验收要求：

- 重开后使用同一个 root conversation。
- 相同 `requestId` 只有一条 runbook 记录。
- 未完成的模型尝试按 Durable 的重启策略继续或失败，不生成第二个业务请求。
- 外部 API、支付、部署或消息发送仍需自身的幂等键和结果核对；Durable checkpoint 不能替代它们。

## 文件说明

- `src/storage-smoke.ts`：离线存储、Document 与 Submission 去重。
- `src/recovery-drill.ts`：Task checkpoint、sleep、memo 与 reopen。
- `src/ops-agent.ts`：SQLite、真实模型、CodingTools、安全 hook、usage 与业务 runbook。

官方依据：[pi-durable README](https://github.com/earendil-works/pi/blob/main/packages/durable/README.md) 与 [官方 runnable examples](https://github.com/earendil-works/pi/tree/main/packages/durable/test/examples)。
