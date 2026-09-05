# PI Agent Lab

一个交互式中文学习实验室：先用 ReAct、ACI、Minimal Agent、源码拆解与闭环评测建立通用 AI Agent 学习方法，再以 PI v0.84.4 的真实 API 和《动手学 Pi》course-v1 作为实现案例。通过 19 个模块、114 个可复现实验，从 Agent 基础一路搭建到 Todos 风格的本地多 Agent 协作平台。

> 版本边界：`course-v1` 是用于理解原理的固定教学实现，不等同于 PI v0.84.4 的当前接口。应用会分别标记“社区教材”与“官方来源”，避免混用。

## 学习路线

1. AI Agent 学习路线：ReAct、ACI、Minimal Agent、源码拆解与闭环评测
2. PI 技术模型：Model、Agent loop、Harness、Control Plane
3. 安装、认证与首次 PI 会话
4. `AGENTS.md`、Skills 与 Prompt Templates
5. 树形 Session、分支、压缩与崩溃恢复
6. Checkpoint 00–05：TypeScript 协议、EventStream、Message IR 与 Provider Adapter
7. Checkpoint 06–08：Tool Contract、Agent Loop 与受控 Coding Tools
8. Checkpoint 09–11：Stateful Agent、Session Tree 与 Context Compaction
9. Checkpoint 12–14：Resources、Extension Trust、Runtime Composition 与独立 Eval
10. TypeScript Extensions 与自定义工具
11. Harness 生命周期、权限门禁与严格参数采样
12. PI SDK、事件流与持久 Session
13. RPC、steer、follow-up、`clear_queue` 与运行状态机
14. 使用 `pi-subagents` 完成隔离、并行、Worktree 与预算受控的多 Agent 协作
15. DAG、租约、并发、重试与背压调度
16. Extension + Skill + Prompt + Theme 插件包
17. `pi-web-access`、`pi-memory`、`rpiv-todo`、`pi-subagents`、`pi-mcp-adapter` 与 `context-mode` 六层生态能力栈
18. Project Trust、容器、模型路由、成本与可观测性
19. Chief、任务 DAG、Git Worktree 与质量门禁

每一步都包含执行命令、预期输出和验收标准；关键步骤还包含失败注入演练。内核路线使用固定 Git tag 和离线测试，可以逐章生成独立练习目录；学习进度保存在浏览器本地。

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
- [ReAct：Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [SWE-agent：Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793)
- [AI 研究学习完整教程（第一期）](https://www.youtube.com/watch?v=BqF6PUAXY1M)（学习路线提纲来源）
- [PI SDK](https://pi.dev/docs/latest/sdk)
- [PI RPC](https://pi.dev/docs/latest/rpc)
- [pi-web-access](https://github.com/nicobailon/pi-web-access)
- [pi-memory](https://github.com/jayzeng/pi-memory)
- [@juicesharp/rpiv-todo](https://github.com/juicesharp/rpiv-mono/tree/main/packages/rpiv-todo)
- [pi-subagents](https://github.com/nicobailon/pi-subagents)
- [pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter)
- [context-mode](https://github.com/mksglu/context-mode)
- [《动手学 Pi》社区教材](https://github.com/hahhforest/pi-textbook)（教材内容 CC BY 4.0，非官方）
- [课程代码 `course/build-your-own-pi`](https://github.com/hahhforest/pi/tree/course/build-your-own-pi)（实验固定到 `course-v1/00`–`course-v1/14`）
- [Todos 文档](https://todos.dev/docs)
