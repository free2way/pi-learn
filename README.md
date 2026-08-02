# PI Agent Lab

一个交互式中文学习实验室：从 PI 的最小 Agent harness 出发，通过 7 个模块、38 个可复现实验，最终搭建 Todos 风格的本地多 Agent 协作平台。

## 学习路线

1. 安装、认证与首次 PI 会话
2. `AGENTS.md`、Skills 与 Prompt Templates
3. TypeScript Extensions 与自定义工具
4. PI SDK、事件流与持久 Session
5. RPC、steer、follow-up 与运行状态机
6. Scout → Planner → Worker → Reviewer 多 Agent 协作
7. Chief、任务 DAG、Git Worktree 与质量门禁

每一步都包含执行命令、预期输出和验收标准。学习进度保存在浏览器本地。

## 本地运行

```bash
npm install
npm run dev
```

打开 Vite 输出的本地地址。

## 验证

```bash
npm run build
npx playwright install chromium
npm run verify:ui
```

UI 冒烟测试覆盖页面内容、课程切换、进度持久化、系统蓝图、移动端导航与浏览器错误。

## 参考资料

- [PI 官方文档](https://pi.dev/docs/latest)
- [PI SDK](https://pi.dev/docs/latest/sdk)
- [PI RPC](https://pi.dev/docs/latest/rpc)
- [PI Subagent 示例](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent)
- [Todos 文档](https://todos.dev/docs)

