# Agent Workbench Lab

这个小型订单计价 fixture 用于对照 PI、OMP 和 Herdr。三套实验必须使用同一份 `TASK.md`、同一基线 SHA 和同一验收命令，避免把 prompt 差异误当成 Agent 能力差异。

## 基线

```bash
npm test
npm run acceptance
```

首次运行时，6 个 baseline 测试应通过，3 个 acceptance 测试应失败。这是刻意保留的练习缺口。

## 实验规则

1. 每个 Agent 从独立分支或 worktree 开始。
2. 不修改 `TASK.md` 来迎合实现。
3. 记录 Agent/模型版本、耗时、请求数、diff 大小、首次验收是否通过。
4. 写 Agent 与 Reviewer 不能是同一个会话。
5. 合并前必须通过两个命令并执行 `git diff --check`。

练习与示例代码随 [free2way/pi-learn](https://github.com/free2way/pi-learn) 维护。

