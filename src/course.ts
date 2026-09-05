export type LabStep = {
  title: string
  detail: string
  command?: string
  expected: string
  check: string
  failure?: string
}

export type CourseModule = {
  id: string
  index: string
  phase: '基础' | '内核' | '扩展' | '编排' | '平台'
  title: string
  subtitle: string
  duration: string
  outcome: string
  why: string
  concepts: string[]
  steps: LabStep[]
  codeTitle: string
  code: string
  codeLang: string
  terminal: string[]
  source: string
  sourceLabel?: string
  level?: '入门' | '进阶' | '生产'
  practice?: string
  prerequisites?: string[]
  deliverables?: string[]
  pitfalls?: string[]
  version?: string
}

const originalModules: CourseModule[] = [
  {
    id: 'first-run',
    index: '01',
    phase: '基础',
    title: '让 PI 真正跑起来',
    subtitle: '安装、认证、认识最小 Agent 循环',
    duration: '35 分钟',
    outcome: '你会完成一次可恢复、可观察的真实编码会话。',
    why: '先感受 PI 的边界：模型负责决定，harness 负责提供 read / write / edit / bash，并保存会话。之后所有复杂系统都只是组合这些原语。',
    concepts: ['Agent loop', 'Provider / Model', 'Tool call', 'Session tree'],
    steps: [
      {
        title: '确认 Node.js 运行环境',
        detail: '打开终端。PI v0.84.4 的 npm 包要求 Node.js >= 22.19.0。',
        command: 'node -v && npm -v',
        expected: '两行版本号；Node.js 不低于 v22.19.0。',
        check: '能看到 node 与 npm 的版本号',
      },
      {
        title: '安装 PI',
        detail: '使用官方 npm 包；--ignore-scripts 会禁用依赖生命周期脚本，PI 正常安装不需要它们。',
        command: 'npm install -g --ignore-scripts @earendil-works/pi-coding-agent@0.84.4\npi --version',
        expected: '终端输出 0.84.4。固定版本让实验在未来仍可复现。',
        check: 'pi 命令可执行且版本等于 0.84.4',
      },
      {
        title: '创建第一个实验仓库',
        detail: '用独立目录保存实验，之后每个模块都在这里继续。',
        command: 'mkdir pi-agent-workshop && cd pi-agent-workshop\ngit init\nprintf "# PI Agent Workshop\\n" > README.md',
        expected: '空 Git 仓库与 README.md 创建成功。',
        check: 'git status 能看到 README.md',
      },
      {
        title: '认证并选择模型',
        detail: '运行 pi，在交互界面输入 /login。可以选择 ChatGPT/Codex、Claude 或 GitHub Copilot 订阅，也可以配置 API Key。',
        command: 'pi\n# 进入 PI 后输入：\n/login\n/model',
        expected: '页脚出现当前 provider、model 与上下文用量。',
        check: '模型选择器显示至少一个可用模型',
      },
      {
        title: '发出首个可验收任务',
        detail: '让 PI 创建一个文件并自己验证。任务要同时包含动作与验收标准。',
        command: '创建 hello-agent.mjs：输出当前 ISO 时间和 "PI is ready"。运行它，并告诉我退出码。',
        expected: '你会看到 write/bash 工具调用、程序输出和 exit code 0。',
        check: 'hello-agent.mjs 存在且 node hello-agent.mjs 成功',
      },
      {
        title: '验证会话可以恢复',
        detail: '退出 PI 后继续最近一次会话，确认 Agent 仍能引用上一步上下文。',
        command: '# Ctrl+C 两次退出，然后：\npi -c\n# 询问：刚才我们创建了什么？',
        expected: 'PI 恢复同一 session，并正确指出 hello-agent.mjs。',
        check: '恢复后能看到之前的消息与工具结果',
      },
    ],
    codeTitle: '你正在建立的最小循环',
    codeLang: 'text',
    code: `目标 → 模型推理 → 工具调用 → 工具结果
  ↑                              ↓
  └──── 会话历史 / 上下文 ────────┘`,
    terminal: [
      '$ node hello-agent.mjs',
      '2026-08-02T13:04:18.126Z',
      'PI is ready',
      'Process exited with code 0',
      '✓ 会话已保存，可用 pi -c 恢复',
    ],
    source: 'https://pi.dev/docs/latest/quickstart',
  },
  {
    id: 'context',
    index: '02',
    phase: '基础',
    title: '设计 Agent 的上下文',
    subtitle: 'AGENTS.md、Skills 与 Prompt Templates',
    duration: '55 分钟',
    outcome: '你会把项目约束与可复用工作流从 prompt 中分离出来。',
    why: '多 Agent 系统首先是上下文工程。稳定约束进入 AGENTS.md，按需能力进入 Skill，高频指令进入 Prompt Template；减少重复 prompt，也避免把所有知识塞进系统消息。',
    concepts: ['Context layers', 'Progressive disclosure', 'Skill', 'Prompt template'],
    steps: [
      {
        title: '写入项目级规则',
        detail: '在仓库根目录创建 AGENTS.md。PI 启动时会从用户目录、父目录和当前目录加载这些规则。',
        command: '创建 AGENTS.md，内容使用右侧示例。',
        expected: '重新进入 PI 时，启动区列出已加载的 AGENTS.md。',
        check: 'PI 启动信息显示 AGENTS.md',
      },
      {
        title: '验证规则真的生效',
        detail: '要求 PI 新建一个函数但不主动提测试，观察它是否仍按规则补测试并运行。',
        command: '新增 src/slugify.ts，导出 slugify(text) 函数。',
        expected: 'PI 同时创建测试，并执行测试命令。',
        check: '实现与测试文件同时出现',
      },
      {
        title: '创建项目 Skill',
        detail: '创建 .pi/skills/release-check/SKILL.md，把发布检查写成按需加载的 playbook。',
        command: 'mkdir -p .pi/skills/release-check\n# 将发布检查流程写入 SKILL.md',
        expected: '重载后 /skill:release-check 可用。',
        check: '/reload 后可以发现 release-check',
      },
      {
        title: '创建 Prompt Template',
        detail: '把高频检查变成斜杠命令。模板中的 $@ 会替换为调用时的全部参数。',
        command: 'mkdir -p .pi/prompts\nprintf "检查 $@ 的测试、类型与边界条件。只报告可复现问题。" > .pi/prompts/review.md\n# PI 中执行 /reload',
        expected: '输入 /review src/slugify.ts 会展开模板。',
        check: '/review 命令能接受文件参数',
      },
      {
        title: '观察上下文成本',
        detail: '运行 /session 查看消息、token 与成本，再用 /compact 对旧历史压缩。',
        command: '/session\n/compact 保留项目约束、已完成实验和未解决问题',
        expected: '上下文用量下降，同时关键事实仍可被回答。',
        check: 'compact 后 PI 仍知道 slugify 与项目规则',
      },
    ],
    codeTitle: 'AGENTS.md',
    codeLang: 'markdown',
    code: `# Workshop rules

- 使用 TypeScript 与 ESM。
- 每个功能必须有可运行的测试。
- 改动后运行 npm test 与 npm run typecheck。
- 不读取或提交 .env。
- 回答末尾列出改动文件和验证证据。`,
    terminal: [
      '$ pi',
      'Loaded context: ./AGENTS.md',
      'Skills: release-check',
      'Prompts: /review',
      'Context 18% · cache hit 91%',
      '✓ 项目约束与流程已分层',
    ],
    source: 'https://pi.dev/docs/latest/skills',
  },
  {
    id: 'tools',
    index: '03',
    phase: '扩展',
    title: '给 Agent 一件新工具',
    subtitle: '用 TypeScript Extension 扩展 harness',
    duration: '70 分钟',
    outcome: '你会注册一个带 schema、权限边界和结构化结果的自定义工具。',
    why: '工具不是“给模型一段函数”。它是可审计的能力边界：清晰描述何时调用、严格限定参数，并返回可观察结果。PI Extension 还能拦截事件、注册命令和构建 TUI。',
    concepts: ['Extension API', 'Tool schema', 'Lifecycle event', 'Permission boundary'],
    steps: [
      {
        title: '创建项目 Extension',
        detail: '项目级扩展放在 .pi/extensions。只有对仓库信任时才启用，因为扩展代码拥有主机进程权限。',
        command: 'mkdir -p .pi/extensions\n# 创建 .pi/extensions/project-stats.ts，粘贴右侧代码',
        expected: '扩展文件位于受版本控制的仓库内。',
        check: 'project-stats.ts 可被 git status 发现',
      },
      {
        title: '重载并检查工具',
        detail: 'PI 支持热重载资源；无需重启整个会话。',
        command: '/reload\n# 然后输入：列出你现在拥有的工具',
        expected: '工具列表包含 project_stats。',
        check: 'Agent 能准确描述 project_stats 的参数',
      },
      {
        title: '触发一次真实调用',
        detail: '不要直接指定工具名，使用自然目标测试工具描述是否足够清楚。',
        command: '统计当前项目中 TypeScript 与 Markdown 文件数量。',
        expected: '模型选择 project_stats，工具返回按后缀统计的数据。',
        check: '工具结果包含 total 与 byExtension',
      },
      {
        title: '验证路径边界',
        detail: '用仓库外路径攻击自己的工具。安全实现必须拒绝越界。',
        command: '用项目统计工具检查 ../ 目录。',
        expected: '工具返回错误或只允许当前 cwd，不读取父目录。',
        check: '越界请求被拒绝',
      },
      {
        title: '记录工具生命周期',
        detail: '为 tool_call / tool_result 事件追加审计日志，记录名称、耗时与成功状态，绝不记录 secret 参数。',
        command: '让 PI 为这个扩展增加最小审计日志，并运行两次调用验证。',
        expected: '.pi/audit.jsonl 出现两行事件，且无敏感内容。',
        check: '每次调用均可追踪、无 secret 泄露',
      },
    ],
    codeTitle: '.pi/extensions/project-stats.ts',
    codeLang: 'typescript',
    code: `import type { ExtensionAPI } from
  "@earendil-works/pi-coding-agent"
import { Type } from "typebox"
import { readdir } from "node:fs/promises"

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "project_stats",
    label: "Project Stats",
    description: "Count files in the current project",
    parameters: Type.Object({
      depth: Type.Integer({ minimum: 0, maximum: 3 })
    }),
    async execute(_id, { depth }, _signal, _update, ctx) {
      const files = await readdir(ctx.cwd, { recursive: depth > 0 })
      const byExtension = files.reduce<Record<string, number>>(
        (acc, file) => {
          const ext = String(file).split(".").pop() ?? "none"
          acc[ext] = (acc[ext] ?? 0) + 1
          return acc
        }, {}
      )
      return {
        content: [{ type: "text", text: JSON.stringify({
          total: files.length, byExtension
        }) }],
        details: { total: files.length, byExtension }
      }
    }
  })
}`,
    terminal: [
      'tool project_stats { depth: 2 }',
      '↳ scanning trusted cwd only',
      '{ "total": 17, "byExtension": {',
      '  "ts": 7, "md": 4, "json": 3',
      '} }',
      '✓ schema valid · boundary respected',
    ],
    source: 'https://pi.dev/docs/latest/extensions',
  },
  {
    id: 'sdk',
    index: '04',
    phase: '扩展',
    title: '把 PI 嵌入应用',
    subtitle: 'SDK、事件流与持久 Session',
    duration: '80 分钟',
    outcome: '你会写出一个 Node.js Agent runner，并实时消费消息与工具事件。',
    why: 'CLI 适合人直接工作；平台需要程序化生命周期。SDK 让你控制 cwd、工具集、session 持久化和事件订阅，是 Chief 与 Executor 的进程内基础。',
    concepts: ['createAgentSession', 'SessionManager', 'Event subscription', 'Tool allowlist'],
    steps: [
      {
        title: '创建 runner 工程',
        detail: '在 workshop 下创建独立 Node.js 包，不复用全局安装，以便锁定 SDK 版本。',
        command: 'mkdir -p experiments/sdk-runner && cd experiments/sdk-runner\nnpm init -y\nnpm i @earendil-works/pi-coding-agent@0.84.4',
        expected: 'package.json 与 lockfile 记录 SDK 依赖。',
        check: 'npm ls 能列出 pi-coding-agent',
      },
      {
        title: '创建最小 SDK 会话',
        detail: '创建 runner.mjs。第一次实验使用内存 Session，并只开放只读工具。',
        command: '# 创建 runner.mjs，按右侧代码实现\nnode runner.mjs "总结此仓库的结构"',
        expected: '终端连续打印 agent_start、message_update、tool_execution 等事件。',
        check: '至少观察到一次工具调用与最终文本',
      },
      {
        title: '限制工具能力',
        detail: '将 tools 设置为 read / grep / find / ls，随后故意要求写文件。',
        command: 'node runner.mjs "创建 SHOULD_NOT_EXIST.txt"',
        expected: 'Agent 无法调用 write 或 bash；文件不会创建。',
        check: 'test ! -e SHOULD_NOT_EXIST.txt',
      },
      {
        title: '切换到持久 Session',
        detail: '把 SessionManager.inMemory() 改为 SessionManager.create(process.cwd())，运行两轮 prompt。',
        command: 'node runner.mjs "记住代号 amber-42"\n# 使用 continueRecent 后再次询问\nnode runner.mjs "代号是什么？"',
        expected: '第二次会话回答 amber-42。',
        check: 'session 文件存在且可继续',
      },
      {
        title: '输出机器可读事件',
        detail: '把事件规范化为 JSONL：runId、timestamp、type、agentId、payload，为下一模块的控制台做准备。',
        command: 'node runner.mjs "扫描 TODO 注释" > events.jsonl\nwc -l events.jsonl',
        expected: 'events.jsonl 每行都是独立 JSON，至少包含开始、工具、完成事件。',
        check: 'jq -c . events.jsonl 不报错',
      },
    ],
    codeTitle: 'experiments/sdk-runner/runner.mjs',
    codeLang: 'javascript',
    code: `import {
  createAgentSession,
  SessionManager
} from "@earendil-works/pi-coding-agent"

const prompt = process.argv.slice(2).join(" ")
const { session } = await createAgentSession({
  cwd: process.cwd(),
  sessionManager: SessionManager.inMemory(process.cwd()),
  tools: ["read", "grep", "find", "ls"]
})

session.subscribe((event) => {
  process.stdout.write(JSON.stringify({
    at: new Date().toISOString(),
    type: event.type,
    payload: event
  }) + "\\n")
})

await session.prompt(prompt)
session.dispose()`,
    terminal: [
      '{"type":"agent_start"}',
      '{"type":"tool_execution_start","tool":"find"}',
      '{"type":"tool_execution_end","isError":false}',
      '{"type":"message_end","role":"assistant"}',
      '{"type":"agent_end"}',
      '✓ run completed · 0 write capabilities',
    ],
    source: 'https://pi.dev/docs/latest/sdk',
  },
  {
    id: 'rpc',
    index: '05',
    phase: '编排',
    title: '构建可控制的 Agent 进程',
    subtitle: 'RPC、steer、follow_up 与运行状态机',
    duration: '90 分钟',
    outcome: '你会从父进程控制 PI，通过 JSONL 双向通信并处理中断。',
    why: 'RPC 把 PI 变成语言无关的长驻进程。父服务通过 stdin 发命令，从 stdout 接事件；这是 Web 控制台、Python 后端或分布式执行器最干净的边界。',
    concepts: ['JSONL protocol', 'stdin / stdout', 'Steering', 'Run state machine'],
    steps: [
      {
        title: '手动观察 RPC 协议',
        detail: '以 RPC 模式启动 PI，然后发送一行 prompt JSON。每条请求都应带 id，便于关联响应。',
        command: 'pi --mode rpc\n{"id":"req-1","type":"prompt","message":"只回复 READY"}',
        expected: '先收到 success response，随后异步收到 agent/message 事件。',
        check: '能区分命令响应与 Agent 事件',
      },
      {
        title: '写一个父进程控制器',
        detail: '用 child_process.spawn 启动 pi，逐行解析 stdout，禁止把日志写到 stdout 破坏协议。',
        command: 'mkdir -p experiments/rpc-controller\n# 创建 controller.mjs，使用右侧核心实现',
        expected: '父进程可发送 prompt，并打印结构化事件。',
        check: '一轮任务后子进程仍保持运行',
      },
      {
        title: '实现 steer',
        detail: 'Agent 运行工具期间发送 steer。该消息会在当前工具调用后、下一次模型调用前送达。',
        command: '{"id":"steer-1","type":"steer","message":"不要改代码，只给计划"}',
        expected: '当前工具结束后，Agent 改为只输出计划。',
        check: '事件流中出现 steer 的成功响应',
      },
      {
        title: '实现 follow_up',
        detail: 'follow_up 等当前工作完全空闲后再送达，适合排队验收与复盘。',
        command: '{"id":"follow-1","type":"follow_up","message":"完成后总结 token 用量"}',
        expected: '主任务 agent_end 后开始处理追加消息。',
        check: 'follow_up 不会打断主任务',
      },
      {
        title: '建立运行状态机',
        detail: '把事件归一为 queued → running → waiting_tool → running → completed / failed / aborted，并测试杀进程。',
        command: 'node controller.mjs\n# 任务运行中按 Ctrl+C',
        expected: '父进程转发 SIGINT，run 最终进入 aborted，不残留 pi 子进程。',
        check: '任何 run 都有终态与结束时间',
      },
    ],
    codeTitle: 'experiments/rpc-controller/controller.mjs',
    codeLang: 'javascript',
    code: `import { spawn } from "node:child_process"
import { createInterface } from "node:readline"

const child = spawn("pi", ["--mode", "rpc"], {
  cwd: process.cwd(),
  stdio: ["pipe", "pipe", "inherit"]
})

const lines = createInterface({ input: child.stdout })
lines.on("line", (line) => {
  const event = JSON.parse(line)
  process.stderr.write("[event] " + event.type + "\\n")
})

function send(command) {
  child.stdin.write(JSON.stringify(command) + "\\n")
}

send({
  id: crypto.randomUUID(),
  type: "prompt",
  message: "检查当前项目，并给出三项改进"
})

process.on("SIGINT", () => child.kill("SIGINT"))`,
    terminal: [
      'queued        req-8f2',
      'running       agent_start',
      'waiting_tool  read(package.json)',
      'running       tool_execution_end',
      'completed     agent_end · 12.4s',
      '✓ state machine reached a terminal state',
    ],
    source: 'https://pi.dev/docs/latest/rpc',
  },
  {
    id: 'multi-agent',
    index: '06',
    phase: '编排',
    title: '从一个 Agent 到一支小队',
    subtitle: '隔离上下文、并行与链式委派',
    duration: '120 分钟',
    outcome: '你会实现 Scout → Planner → Worker → Reviewer 的协作闭环。',
    why: 'PI 刻意不内置 sub-agent。官方示例通过独立 PI 进程获得隔离上下文，再支持 single / parallel / chain。关键不是数量，而是清楚的角色、最小工具权限和可合并的输出。',
    concepts: ['Context isolation', 'Role contract', 'Parallel fan-out', 'Chain handoff'],
    steps: [
      {
        title: '取得官方 subagent 示例',
        detail: '克隆 PI 仓库，仅把示例作为参考与实验依赖。官方示例包含 agents、prompts、并行与链式执行。',
        command: 'git clone --branch v0.84.4 --depth 1 https://github.com/earendil-works/pi.git vendor/pi\ncd vendor/pi\nnpm install && npm run build',
        expected: 'packages/coding-agent/examples/extensions/subagent 可读取。',
        check: '示例目录含 index.ts、agents.ts、agents/',
      },
      {
        title: '安装 subagent Extension',
        detail: '按官方 README 把 extension、agent definitions 与 prompts 链接到用户级 PI 目录。',
        command: 'cd vendor/pi\nmkdir -p ~/.pi/agent/extensions/subagent ~/.pi/agent/agents ~/.pi/agent/prompts\n# 按官方 README 创建符号链接，再在 PI 中 /reload',
        expected: 'PI 能发现 subagent 工具，以及 /implement 等模板。',
        check: 'Agent 列表出现 scout / planner / reviewer / worker',
      },
      {
        title: '执行并行侦察',
        detail: '两个 scout 使用只读工具在隔离上下文中并行工作，各自返回压缩结论。',
        command: 'Run 2 scouts in parallel: one map the SDK API, one find all session persistence code.',
        expected: '界面同时流式显示 2 个任务，最终为 2/2 done。',
        check: '两份输出互不包含对方历史',
      },
      {
        title: '执行链式交付',
        detail: '使用 implement-and-review：Worker 实现，Reviewer 独立审查，Worker 根据反馈修订。',
        command: '/implement-and-review 给 sdk-runner 增加 60 秒超时与 SIGINT 清理',
        expected: '同一目标产生实现、审查意见、修订三段可追踪输出。',
        check: '最终测试通过且审查问题被逐项回应',
      },
      {
        title: '故意制造失败',
        detail: '给 worker 一个不存在的模型或让任务超时，验证父 Agent 收到失败诊断且 chain 停止。',
        command: '将测试 agent 的 model 临时改成 invalid-model，运行一次 chain。',
        expected: '失败被归因到具体 agent / step，不启动后续 reviewer。',
        check: '失败不会伪装成成功，也不会遗留子进程',
      },
    ],
    codeTitle: '.pi/agents/reviewer.md',
    codeLang: 'markdown',
    code: `---
name: reviewer
description: 独立验证实现正确性与回归风险
tools: read, grep, find, ls, bash
---

你是独立 Reviewer，不参与实现。

1. 先读取任务的验收标准与 diff。
2. 运行与改动范围匹配的最小测试。
3. 只报告可复现问题；包含文件、证据和建议。
4. 严重度使用 BLOCKER / MAJOR / MINOR。
5. 无问题时明确返回 APPROVED，不写泛泛建议。`,
    terminal: [
      'scout-a     ✓  mapped SDK surface',
      'scout-b     ✓  found 4 session paths',
      'planner     ✓  5-step implementation plan',
      'worker      ✓  3 files · 8 tests passed',
      'reviewer    ✓  APPROVED',
      '✓ 5 agents · 3 isolated contexts · $0.18',
    ],
    source: 'https://github.com/earendil-works/pi/tree/v0.84.4/packages/coding-agent/examples/extensions/subagent',
  },
  {
    id: 'platform',
    index: '07',
    phase: '平台',
    title: '搭建 Todos 风格控制面',
    subtitle: 'Chief、任务图、Worktree 与质量门禁',
    duration: '3–5 天',
    outcome: '你会得到一个本地优先的多 Agent 协作 MVP，可从一句目标走到合并。',
    why: '一个产品级平台需要把 Agent 执行与协作控制分开：Control Plane 管目标、依赖、门禁与成本；Executor 在隔离 worktree 中运行 PI；UI 只消费统一事件。',
    concepts: ['Control plane', 'DAG', 'Git worktree', 'Human-in-the-loop'],
    steps: [
      {
        title: '定义最小数据模型',
        detail: '先只建 Team、Agent、Goal、Task、Run、Event 六张表。Task 有依赖与状态，Run 绑定 agent/model/worktree/session。',
        command: 'mkdir pi-team && cd pi-team\nnpm init -y\nnpm i better-sqlite3 zod\n# 按右侧状态机创建 schema.sql',
        expected: 'SQLite 数据库能创建一条 goal、三个 task 与依赖边。',
        check: '非法状态跳转会被拒绝',
      },
      {
        title: '实现 Chief 拆解',
        detail: 'Chief 不写代码。它只把一句目标转成结构化 Task DAG：标题、角色、依赖、验收标准、风险级别。',
        command: 'node scripts/goal.mjs "给 SDK runner 增加 Web 控制台、测试与文档"',
        expected: '输出 frontend、backend、qa/docs 四个任务；可并行项没有依赖。',
        check: '所有任务都有唯一 owner 与可验证验收标准',
      },
      {
        title: '隔离每次执行',
        detail: 'Executor 为每个 build 创建 git worktree 和分支，在其中启动 PI RPC。永远不要让两个写 Agent 共用工作目录。',
        command: 'git worktree add .runs/task-42 -b agent/task-42\n# 以 .runs/task-42 为 cwd 启动 pi --mode rpc',
        expected: '主工作区不被修改；任务分支只含本任务 diff。',
        check: '并行任务不会覆盖彼此文件',
      },
      {
        title: '建立 Plan → Build 门禁',
        detail: 'Planner 只读并输出 plan；用户确认后才创建写权限的 Build run。每个 run 使用独立 session。',
        command: 'node cli.mjs approve-plan task-42\nnode cli.mjs start-build task-42',
        expected: '未批准时 start-build 返回冲突；批准后进入 building。',
        check: '构建不可能绕过 plan_approved',
      },
      {
        title: '加入独立 Review 与返工环',
        detail: 'Reviewer 读取 plan、diff、测试输出；review_changes 回到同一个 Worker session，approved 才允许 merge。',
        command: 'node cli.mjs review task-42 --agent reviewer\nnode cli.mjs merge task-42',
        expected: '有 BLOCKER 时 merge 被拒绝；修订复审通过后可合并。',
        check: 'Worker 不能自审自批',
      },
      {
        title: '把事件推到 Web 控制台',
        detail: 'Control Plane 将 RPC 事件写入 Event 表，再通过 SSE 推送。前端只依赖 runId 与统一状态，不直接解析模型文本。',
        command: 'curl -N http://localhost:3000/api/runs/task-42/events',
        expected: '浏览器实时看到工具调用、阶段变化、token、费用与待确认事项。',
        check: '刷新页面后可从数据库重放完整时间线',
      },
      {
        title: '跑通最终验收',
        detail: '从一句目标开始，不手改数据库，走完整 Chief → Plan → Build → Review → Merge 流程。',
        command: 'npm run e2e -- --goal "新增 /healthz，并补测试和文档"',
        expected: 'PR 或本地合并提交生成；审计时间线、测试证据和成本完整。',
        check: '一次失败与一次返工都能被准确恢复',
      },
    ],
    codeTitle: 'Task / Run 状态机',
    codeLang: 'text',
    code: `GOAL
 └─ proposed
     └─ plan_running
         └─ waiting_plan_approval   ← human gate
             └─ building
                 └─ waiting_review ← agent gate
                     ├─ changes_requested ─┐
                     │         ↑           │
                     └─ approved           │
                         └─ merged          │
                             └──────────────┘

任意运行态 → failed | aborted
失败 run 可重试，但历史 Event 永不覆盖。`,
    terminal: [
      'chief       goal accepted · 4 tasks',
      'planner     waiting for plan approval',
      'frontend    running ━━━━━━━━░░ 78%',
      'backend     running ━━━━━░░░░░ 51%',
      'reviewer    queued · depends on #42, #43',
      'control     2 parallel · $0.42 · 186k tokens',
    ],
    source: 'https://todos.dev/docs',
  },
]

const advancedModules: CourseModule[] = [
  {
    id: 'mental-model',
    index: '00',
    phase: '基础',
    title: 'PI 的真实技术模型',
    subtitle: 'Agent、Harness、Runtime 与产品层各自负责什么',
    duration: '50 分钟',
    level: '入门',
    practice: '架构解剖',
    version: 'v0.84.4',
    prerequisites: ['Node.js 22.19+', '能使用终端', '一个可调用的模型账号'],
    deliverables: ['版本与环境快照', 'JSON 事件样本', '一张本地组件边界图'],
    pitfalls: ['把模型叫作 Agent', '把多窗口误认为多 Agent', '默认相信 Harness 有沙箱'],
    outcome: '你会用运行证据解释 PI 的每一层，而不是停留在术语记忆。',
    why: 'Agent 是“模型 + 指令 + 工具 + 状态 + 循环”形成的运行实体；Harness 是把这些原语接起来并管理会话、事件与用户交互的宿主。PI 的设计选择是保持 Harness 最小，把计划、子 Agent、权限门禁和调度留给 Extension 或上层应用。',
    concepts: ['LLM', 'Agent loop', 'Harness', 'Runtime', 'Control plane', 'Executor'],
    steps: [
      {
        title: '锁定本课程基线版本',
        detail: '先记录实际安装版本与 npm 最新版。本课程按 2026-08-28 发布的 v0.84.4 编写；若未来版本不同，先读 release notes 再继续。',
        command: 'pi --version\nnpm view @earendil-works/pi-coding-agent version',
        expected: '两行版本号。当前课程基线应显示 0.84.4；若本地更旧，执行 pi update --self。',
        check: '本地 PI 不低于 0.84.4，并把版本写入 LAB_NOTES.md',
      },
      {
        title: '识别四个核心包的边界',
        detail: '查看公开包而不是猜架构：pi-ai 统一模型 API；pi-agent-core 实现工具循环；pi-coding-agent 提供会话、CLI、SDK、RPC 和扩展宿主；pi-tui 负责终端 UI。',
        command: 'npm view @earendil-works/pi-ai description\nnpm view @earendil-works/pi-agent-core description\nnpm view @earendil-works/pi-coding-agent description\nnpm view @earendil-works/pi-tui description',
        expected: '四个包都可解析，并显示不同职责。',
        check: '能说清“模型 API”和“Agent Harness”为什么不是同一层',
      },
      {
        title: '观察一次 Agent loop',
        detail: '在空目录启动 PI，给出必须调用工具才能完成的任务。折叠/展开思考和工具输出，标记 user → assistant → toolCall → toolResult → assistant 的顺序。',
        command: 'mkdir -p experiments/loop && cd experiments/loop && pi\n# 输入：创建 probe.txt，写入当前目录名；读取它并逐字复述。',
        expected: '至少出现 write 与 read 两次工具交互，最终回答依赖 toolResult。',
        check: '能在会话中找到完整的“决策—动作—观察—再决策”闭环',
      },
      {
        title: '导出机器可读事件',
        detail: 'Print/JSON 模式适合一次性自动化。它与 RPC 的差别是任务结束后进程退出，不承担长驻控制。',
        command: 'pi -p --mode json "只读取 package.json 并返回项目名" > run.jsonl\nnode -e "require(\'fs\').readFileSync(\'run.jsonl\',\'utf8\').trim().split(\'\\n\').forEach(JSON.parse)"',
        expected: 'run.jsonl 每行都是合法 JSON，包含消息、工具调用与用量相关事件。',
        check: 'JSONL 可逐行解析，且没有普通日志混入 stdout',
      },
      {
        title: '验证进程标记',
        detail: 'CLI 与 RPC 入口会为子进程设置 AI_AGENT=pi 和 PI_CODING_AGENT=true；Shell 工具还会收到 session/model/reasoning 元数据。',
        command: 'pi\n# 输入：运行 env | sort | grep -E "^(AI_AGENT|PI_)"，不要推测，直接报告结果。',
        expected: '看到 AI_AGENT、PI_CODING_AGENT、PI_SESSION_ID、PI_PROVIDER、PI_MODEL、PI_REASONING_LEVEL。',
        check: '能用环境变量确定运行来源与模型，而不是解析系统提示词',
      },
      {
        title: '写下“不属于 PI core”的能力',
        detail: '列出计划模式、子 Agent、权限弹窗、后台 bash、MCP、内置 todos。它们不是缺失知识，而是留给你用 Extensions、packages、tmux 或上层应用实现的产品决策。',
        command: 'cat > LAB_NOTES.md <<\'EOF\'\n# PI boundary\nCore: model access, tool loop, sessions, TUI, SDK, RPC, extension host.\nProduct layer: planning, subagents, scheduling, approvals, task board, merge policy.\nEOF',
        expected: '形成一份不会把 Product Feature 淆为 Harness Primitive 的边界说明。',
        check: '每个产品能力都能指向一个可实现它的 PI 原语',
      },
    ],
    codeTitle: 'PI 组件边界',
    codeLang: 'text',
    code: `产品层     Chief · Tasks · Scheduler · Review gates
                ↓ commands / events
Harness      pi-coding-agent · Session · Extension API
                ↓ prompt / tool result
Agent loop   pi-agent-core · decide → act → observe
                ↓ provider-neutral request
Model API    pi-ai · OpenAI / Anthropic / Google / ...
                ↓ terminal rendering
Interface    pi-tui · CLI  |  SDK  |  RPC  |  JSON`,
    terminal: [
      '$ pi --version',
      '0.84.4',
      'agent_start → message_start',
      'tool_execution_start → tool_execution_end',
      'message_end → agent_end',
      '✓ core / harness / product boundaries recorded',
    ],
    source: 'https://pi.dev/docs/latest',
  },
  {
    id: 'session-engineering',
    index: '00',
    phase: '基础',
    title: '把 Session 当作运行数据库',
    subtitle: '树形历史、分支、压缩与任务归属',
    duration: '75 分钟',
    level: '进阶',
    practice: '状态与恢复',
    version: 'v0.84.4',
    prerequisites: ['完成一次 PI 会话', '了解 JSONL', '会使用 jq'],
    deliverables: ['命名 Session', '两条历史分支', '压缩前后用量记录', '恢复测试'],
    pitfalls: ['用聊天文本充当任务状态', '重试时覆盖旧历史', '所有 Agent 共享一个 Session'],
    outcome: '你会让任务可恢复、可分叉、可审计，并为多 Agent 建立明确的会话所有权。',
    why: 'PI Session 不是扁平聊天记录，而是带 id/parentId 的 JSONL 树。分支、工具结果、自定义条目和压缩摘要都能留在同一历史中。平台必须把 Task、Run、Session 三者分开：Task 是目标，Run 是一次尝试，Session 是该 Agent 的上下文历史。',
    concepts: ['Session tree', 'JSONL', 'Branch', 'Compaction', 'Run ownership'],
    steps: [
      {
        title: '创建并命名持久会话',
        detail: '命名不是装饰：调度器和人类都需要稳定显示名。使用专用 session-dir，避免实验污染日常会话。',
        command: 'mkdir -p .lab/sessions\npi --session-dir .lab/sessions --name "session-lab"\n# PI 中执行 /session',
        expected: '/session 显示 session ID、文件路径、消息数、token 和 cost。',
        check: '.lab/sessions 下出现 JSONL，会话名为 session-lab',
      },
      {
        title: '制造并切换树分支',
        detail: '先让 PI 选择 SQLite，再用 /tree 回到问题节点，改选 JSON 文件。两个答案都保存在同一个树形文件中。',
        command: '为本地任务队列选择存储方案并说明理由。\n# 完成后输入 /tree，跳回上面的用户消息，再发送：只允许 JSON 文件，重新设计。',
        expected: '/tree 显示一个父节点下的两个分支，可来回切换。',
        check: '切换分支后上下文只沿当前 parentId 链重建',
      },
      {
        title: '直接验证 JSONL 拓扑',
        detail: '从 /session 得到路径，使用 jq 检查 id、parentId 与 type。不要编辑运行中的 session 文件。',
        command: 'SESSION_FILE=".lab/sessions/<实际文件>.jsonl"\njq -c "{id,parentId,type}" "$SESSION_FILE" | tail -n 12',
        expected: '每行有唯一 id；分支条目的 parentId 指回共同祖先。',
        check: '能画出最近 12 个条目的父子关系',
      },
      {
        title: '触发并衡量压缩',
        detail: '先执行 /session 记下 context，再手动压缩。摘要必须保留任务目标、已改文件、测试证据、未决项和约束。',
        command: '/compact 保留目标、约束、关键决策、已改文件、测试结果与未决风险；丢弃逐字工具输出。\n/session',
        expected: '出现 compaction 记录；上下文占用下降，关键事实仍能复述。',
        check: '压缩后重新询问验收标准，答案没有丢失关键约束',
        failure: '故意用“总结一下”作为压缩提示；比较它与结构化提示丢失了哪些可执行信息。',
      },
      {
        title: '建立一任务一 Session 规则',
        detail: '创建 task-to-session.json，将 taskId、runId、agentId、sessionId、sessionFile 显式关联。重试新建 run，但可按策略继续或 fork 原 Session。',
        command: 'mkdir -p .lab/control\nprintf "%s\\n" \'{"taskId":"T-001","runId":"R-001","agentId":"planner","sessionId":"<实际ID>","status":"running"}\' > .lab/control/task-to-session.jsonl',
        expected: '控制面可以通过 taskId 找到具体 Agent 的历史，而不依赖窗口是否打开。',
        check: '同一 Task 的重试会得到新 runId，旧 run 不被覆盖',
      },
      {
        title: '完成崩溃恢复演练',
        detail: 'Agent 工作中直接终止进程，再用明确的 session ID 恢复。检查最后完整条目，确认没有把半条 JSON 当成状态。v0.84.4 已修复无尾换行恢复后的追加损坏。',
        command: 'pi --session-dir .lab/sessions --session <session-id>\n# 询问：列出当前分支目标、最后完成动作和下一步。',
        expected: '恢复到最后一个有效条目，继续追加后 JSONL 仍可逐行解析。',
        check: 'jq -c . <session-file> 全部通过',
      },
    ],
    codeTitle: 'Task / Run / Session 关系',
    codeLang: 'typescript',
    code: `type Task = { id: string; goal: string; status: TaskStatus }
type Run = {
  id: string
  taskId: string
  attempt: number
  agentId: string
  sessionId: string
  sessionFile?: string
  status: RunStatus
}

// 规则：重试新增 Run；Session 可 continue 或 fork；
// Task 只从不可变 Run/Event 推导状态，绝不覆盖历史。`,
    terminal: [
      '$ pi --session <id>',
      'resumed session-lab · branch 2/2',
      'context before compact: 71%',
      'context after compact: 24%',
      'jq: 46 entries valid',
      '✓ crash recovery preserved the active branch',
    ],
    source: 'https://pi.dev/docs/latest/sessions',
  },
  {
    id: 'harness-lifecycle',
    index: '00',
    phase: '扩展',
    title: '自己改造 Agent Harness',
    subtitle: '生命周期、权限门禁、严格工具与持久状态',
    duration: '110 分钟',
    level: '进阶',
    practice: 'Harness Extension',
    version: 'v0.84.4',
    prerequisites: ['TypeScript 基础', '完成自定义工具模块', '理解工具调用风险'],
    deliverables: ['事件审计扩展', '危险命令门禁', '严格 schema 工具', '等待用户状态'],
    pitfalls: ['在 tool_result 后才检查权限', '日志记录 secret', '把 Project Trust 当沙箱'],
    outcome: '你会构建一个能观察、阻止、询问和恢复状态的最小安全 Harness。',
    why: 'Extension 是 PI 的核心定制接口：它可以监听 session/agent/model/tool/UI 生命周期、注册工具和命令、修改上下文，并把自定义状态写入 session。v0.84.4 新增 ui_prompt_start/end，让调度器能区分“Agent 正在工作”和“正在等人”。',
    concepts: ['ExtensionAPI', 'Lifecycle', 'tool_call gate', 'ctx.ui', 'constrainedSampling'],
    steps: [
      {
        title: '建立事件审计扩展',
        detail: '创建 .pi/extensions/harness-guard.ts，监听 agent_start/end、tool_call/result 与 ui_prompt_start/end。日志只写元数据：时间、事件、工具名、时长、是否错误。',
        command: 'mkdir -p .pi/extensions .lab/audit\n# 创建 harness-guard.ts，先实现右侧生命周期骨架\npi\n# 信任项目后执行 /reload',
        expected: '启动与一次工具调用后，.lab/audit/events.jsonl 有成对事件。',
        check: '每个 tool_call 都能按 toolCallId 与 tool_result 关联',
      },
      {
        title: '在执行前阻止危险调用',
        detail: 'tool_call 发生在工具真正执行前。匹配 rm -rf、git reset --hard、读取 .env 等高风险输入，返回 block；不要等待 tool_result。',
        command: '在扩展中为 bash/read 加 guard，然后要求 PI：运行 rm -rf ./DO_NOT_DELETE。',
        expected: '工具未执行，模型收到明确 block reason，审计日志记录 blocked=true。',
        check: 'DO_NOT_DELETE 目录仍存在且没有进入 tool_execution_start',
        failure: '把检查暂时移到 tool_result，观察为什么此时阻止已经太迟，然后立刻恢复。',
      },
      {
        title: '为中风险操作请求确认',
        detail: '不是所有操作都应硬阻止。对 npm publish、git push、外部写 API 调用使用 ctx.ui.confirm；拒绝时返回 block。',
        command: '让扩展拦截命令 npm publish --dry-run，并弹出确认；分别测试拒绝与允许。',
        expected: '拒绝时无执行；允许时进入工具。宿主可收到 ui_prompt_start 与 ui_prompt_end。',
        check: '调度器状态从 running → waiting_user → running',
      },
      {
        title: '启用严格工具参数采样',
        detail: 'v0.82+ 支持 constrainedSampling。为关键写操作使用严格 JSON Schema prefer；只有在模型能力已确认时才用 require，避免不支持的 provider 直接失败。',
        command: '给 project_stats 工具增加 constrainedSampling: { jsonSchema: "prefer" }，然后传入 depth="two" 测试。',
        expected: '支持严格工具的模型产生整数参数；不支持时 prefer 可回退到普通采样。',
        check: '非法类型永远无法进入 execute',
      },
      {
        title: '把 Harness 状态写进 Session',
        detail: '用 pi.appendEntry 写入 policy-decision 自定义条目。extension 启动时从 session branch 恢复，而不是依赖模块级全局变量。',
        command: '允许一次中风险操作，退出并 pi -c；再次触发时显示上次决定的时间与范围。',
        expected: '状态随 session 恢复，但不会泄漏到另一个 /new Session。',
        check: '分支切换时状态按当前 branch 重新构建',
      },
      {
        title: '测试 Harness 的失败边界',
        detail: '让日志目录只读、让 confirm 超时、让事件 handler 抛错。每次都验证 Agent 不会悄悄绕过安全策略。安全策略异常应 fail closed。',
        command: 'chmod -w .lab/audit\n# 触发受保护调用；测试后 chmod +w .lab/audit',
        expected: '受保护调用被拒绝并显示策略错误；普通只读工具仍可按设计运行。',
        check: '形成 allow / confirm / block / policy_error 四类测试证据',
      },
    ],
    codeTitle: '.pi/extensions/harness-guard.ts',
    codeLang: 'typescript',
    code: `import type { ExtensionAPI } from
  "@earendil-works/pi-coding-agent"

export default function harnessGuard(pi: ExtensionAPI) {
  const waiting = new Map<string, number>()

  pi.on("ui_prompt_start", (event) => {
    waiting.set(event.id, Date.now())
  })
  pi.on("ui_prompt_end", (event) => {
    waiting.delete(event.id)
  })

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return
    const command = String(event.input?.command ?? "")
    if (/rm\\s+-rf|reset\\s+--hard/.test(command)) {
      return { block: true, reason: "Blocked by project policy" }
    }
    if (/npm publish|git push/.test(command)) {
      const ok = await ctx.ui.confirm("External write", command)
      if (!ok) return { block: true, reason: "Rejected by user" }
    }
  })
}`,
    terminal: [
      'agent_start       run=R-17',
      'tool_call         bash · policy=confirm',
      'ui_prompt_start   state=waiting_user',
      'ui_prompt_end     confirmed=false · 4.2s',
      'tool_result       blocked=true',
      '✓ dangerous action never reached execution',
    ],
    source: 'https://pi.dev/docs/latest/extensions',
  },
  {
    id: 'scheduler',
    index: '00',
    phase: '编排',
    title: '实现一个可恢复调度器',
    subtitle: 'DAG、并发、租约、重试与背压',
    duration: '150 分钟',
    level: '生产',
    practice: '本地任务调度',
    version: 'v0.84.4',
    prerequisites: ['掌握 PI RPC', '理解独立 Agent Session', '熟悉 Promise 与进程信号'],
    deliverables: ['任务 DAG', '并发限制器', '租约恢复', '幂等重试测试'],
    pitfalls: ['只在内存记录 running', '无限自动重试', '依赖失败后仍调度下游'],
    outcome: '你会实现一个进程重启后仍能继续、不会重复合并、能限制成本的本地 Scheduler。',
    why: 'PI 能运行 Agent，但不负责决定“谁何时运行”。生产调度至少需要持久任务图、原子 claim、并发上限、租约心跳、终态、重试策略与取消传播。先用 SQLite 在单机跑通，避免过早引入消息队列。',
    concepts: ['DAG', 'Lease', 'Backpressure', 'Idempotency', 'Retry budget'],
    steps: [
      {
        title: '创建持久任务表',
        detail: '使用 SQLite WAL。Task 保存依赖与验收；Run 保存 attempt、leaseOwner、leaseUntil、sessionId、worktree 与终态。Event 只追加。',
        command: 'mkdir -p experiments/scheduler && cd experiments/scheduler\nnpm init -y\nnpm i better-sqlite3 zod\n# 创建 schema.sql 与 init.mjs，然后 node init.mjs',
        expected: '数据库处于 WAL 模式，并有 tasks、task_dependencies、runs、events 四张表。',
        check: '重复运行 init.mjs 不报错且不删除已有数据',
      },
      {
        title: '实现 ready 查询',
        detail: '只有 status=queued 且所有依赖 completed 的任务可进入 ready。任何依赖 failed/aborted 时，下游标记 blocked，而不是永久 queued。',
        command: 'node seed.mjs\nnode cli.mjs ready',
        expected: 'A、B 同时 ready；依赖 A+B 的 C 不出现。完成 A 后仍只有 B；完成 B 后 C ready。',
        check: 'ready 顺序稳定，并按 priority、createdAt 排序',
      },
      {
        title: '用原子租约 claim 任务',
        detail: '在事务里选择 ready task 并更新 leaseOwner/leaseUntil；受影响行数必须是 1。两个 Scheduler 同时 claim 也只能有一个获胜。',
        command: 'node cli.mjs race-claim T-001 --workers 8',
        expected: '8 个竞争者中 1 个返回 claimed，其余返回 already_claimed。',
        check: '没有同一 task 的两个活动 run',
      },
      {
        title: '加入全局与模型并发限制',
        detail: '全局最多 4 个 Agent；昂贵模型最多 1 个；每仓库最多 2 个写 Worker。没有令牌时任务保持 ready，形成背压。',
        command: 'node scheduler.mjs --max-runs 4 --max-expensive 1 --max-per-repo 2',
        expected: '队列中 10 个任务也不会超过配置；只读 Planner 可与 Worker 并行。',
        check: '采样 30 秒进程数，三个限制从未被突破',
      },
      {
        title: '实现有预算的重试',
        detail: '只重试 transient：限流、DNS、进程意外退出。权限拒绝、测试失败、无效任务不可盲重试。使用指数退避+jitter，并保存 nextAttemptAt。',
        command: 'node cli.mjs inject-failure R-001 rate_limit\nnode cli.mjs inspect R-001',
        expected: 'attempt 1 失败，attempt 2 在未来时间排队；达到 maxAttempts 后任务进入 failed。',
        check: '重试创建新 Run，旧 Run 和 Event 不被覆盖',
      },
      {
        title: '演练 Scheduler 崩溃恢复',
        detail: '运行中 kill -9 Scheduler；等待租约过期后由新实例 reclaim。副作用使用 idempotency key=taskId:stage，防止重复建分支或重复合并。',
        command: 'node scheduler.mjs\n# 另一个终端终止进程，等待 lease TTL\nnode scheduler.mjs --recover',
        expected: '过期 Run 标记 lost；新 Run 接管任务；已经完成的幂等 stage 不重复执行。',
        check: '最终只有一个 merge 事件，所有 Run 都有终态',
        failure: '在 worktree 创建后、数据库写入前终止进程，验证 reconciliation 能发现并认领或隔离孤儿目录。',
      },
    ],
    codeTitle: '可调度任务的核心条件',
    codeLang: 'sql',
    code: `SELECT t.* FROM tasks t
WHERE t.status = 'queued'
AND t.next_attempt_at <= unixepoch()
AND NOT EXISTS (
  SELECT 1 FROM task_dependencies d
  JOIN tasks parent ON parent.id = d.depends_on
  WHERE d.task_id = t.id
    AND parent.status != 'completed'
)
AND NOT EXISTS (
  SELECT 1 FROM runs r
  WHERE r.task_id = t.id
    AND r.status IN ('claimed','running','waiting_user')
    AND r.lease_until > unixepoch()
)
ORDER BY t.priority DESC, t.created_at ASC
LIMIT 1;`,
    terminal: [
      'scheduler-1  claimed T-001 lease=30s',
      'scheduler-2  already_claimed',
      'pool         4/4 · expensive 1/1 · repo 2/2',
      'R-001        lost · lease expired',
      'R-002        recovered · attempt 2/3',
      '✓ exactly one terminal merge event',
    ],
    source: 'https://pi.dev/docs/latest/rpc',
  },
  {
    id: 'package-kit',
    index: '00',
    phase: '扩展',
    title: '把能力封装成 PI 插件包',
    subtitle: 'Extension + Skill + Prompt + Theme 的版本化交付',
    duration: '100 分钟',
    level: '进阶',
    practice: 'Pi Package',
    version: 'v0.84.4',
    prerequisites: ['写过一个 Extension', '写过一个 Skill', '理解 npm package'],
    deliverables: ['可本地安装的 pi-team-kit', '资源过滤配置', 'npm pack 清单', '升级与回滚记录'],
    pitfalls: ['运行依赖放 devDependencies', '安装未知包不审源码', '使用浮动 git ref 进入生产'],
    outcome: '你会把团队 Harness 规范打包、安装、过滤、固定版本并安全升级。',
    why: 'Pi Package 是资源分发单位，不只是 npm 插件。一个包可同时携带 Extensions、Skills、Prompt Templates 和 Themes；项目通过 .pi/settings.json 固定来源，团队成员信任项目后可自动安装缺失包。',
    concepts: ['Pi Package', 'Manifest', 'Resource filtering', 'Peer dependency', 'Pinning'],
    steps: [
      {
        title: '搭建标准包目录',
        detail: '创建 packages/pi-team-kit，使用明确 pi manifest；不要依赖隐式扫描来隐藏包内容。',
        command: 'mkdir -p packages/pi-team-kit/{extensions,skills/release-check,prompts,themes}\ncd packages/pi-team-kit\nnpm init -y',
        expected: '四类资源有清晰目录；package.json 可被 npm 识别。',
        check: '包名、版本、license、files 与 pi manifest 均存在',
      },
      {
        title: '声明 PI 资源与依赖',
        detail: '核心 PI 包和 typebox 放 peerDependencies:"*"，不要重复捆绑；第三方运行库放 dependencies，因为 package 安装默认使用生产依赖。',
        command: '# 按右侧 package.json 修改\nnpm install zod\nnpm pack --dry-run',
        expected: 'tarball 包含四类资源，不包含测试输出、secret 或 node_modules。',
        check: '扩展运行需要的依赖没有只出现在 devDependencies',
      },
      {
        title: '项目级本地安装',
        detail: '回到 workshop 根目录，用 -l 写入 .pi/settings.json。相对路径按 settings 文件位置解析，适合 monorepo 开发。',
        command: 'cd ../..\npi install -l ./packages/pi-team-kit\npi list',
        expected: '.pi/settings.json 出现本地 package；pi list 能列出来源。',
        check: '新开 PI 并信任项目后，extension/skill/prompt 都可发现',
      },
      {
        title: '只启用允许的资源',
        detail: '用 pi config -l 或 settings object form 过滤包。省略类型表示全加载，[] 表示一个都不加载，!pattern 排除。',
        command: 'pi config -l\n# 仅启用 extensions/guard.ts、skills/* 与 prompts/review.md；禁用 theme',
        expected: '重载后未允许资源不可见，继承的全局资源以 dimmed 显示。',
        check: '资源白名单与实际 /reload 结果一致',
      },
      {
        title: '固定 git 或 npm 版本',
        detail: '生产环境使用 npm:pkg@1.2.3 或 git:host/repo@commit。固定 ref 不会被 update --extensions 推进到新版本，升级必须显式修改。',
        command: 'pi install -l git:github.com/your-org/pi-team-kit@<commit-sha>\npi update --extensions',
        expected: 'package checkout 保持指定 commit；更新只做一致性校验。',
        check: '另一台机器能从 settings 重建相同资源版本',
      },
      {
        title: '做升级与回滚演练',
        detail: '发布破坏性测试版本，验证 peerDependency 与 smoke test 能阻止上线；然后把 ref 改回上一个 tag。第三方 package 拥有完整系统权限，升级前必须审 diff。',
        command: 'npm pack\npi -e ./packages/pi-team-kit\n# 完成 smoke test 后才更新项目 settings',
        expected: '-e 临时加载只影响当前进程；失败不会污染已固定项目版本。',
        check: '记录升级前版本、验证证据、回滚命令和负责人',
        failure: '让 extension import 一个只存在于 devDependencies 的包，验证 npm production install 为什么会在运行时失败。',
      },
    ],
    codeTitle: 'packages/pi-team-kit/package.json',
    codeLang: 'json',
    code: `{
  "name": "@your-org/pi-team-kit",
  "version": "0.1.0",
  "keywords": ["pi-package"],
  "files": ["extensions", "skills", "prompts", "themes"],
  "pi": {
    "extensions": ["./extensions/*.ts"],
    "skills": ["./skills"],
    "prompts": ["./prompts/*.md"],
    "themes": ["./themes/*.json"]
  },
  "peerDependencies": {
    "@earendil-works/pi-coding-agent": "*",
    "typebox": "*"
  },
  "dependencies": { "zod": "^4.0.0" }
}`,
    terminal: [
      '$ pi install -l ./packages/pi-team-kit',
      'extension  harness-guard',
      'skill      release-check',
      'prompt     review',
      'theme      disabled by project filter',
      '✓ package reconstructed from pinned settings',
    ],
    source: 'https://pi.dev/docs/latest/packages',
  },
  {
    id: 'production-ops',
    index: '00',
    phase: '平台',
    title: '生产化：隔离、模型路由与可观测',
    subtitle: 'Project Trust、容器、成本与故障演练',
    duration: '180 分钟',
    level: '生产',
    practice: '安全运行环境',
    version: 'v0.84.4',
    prerequisites: ['完成 SDK/RPC 与调度模块', '熟悉 Docker', '理解最小权限'],
    deliverables: ['容器化 Executor', '模型路由表', '运行 SLO', '故障演练报告'],
    pitfalls: ['把 API Key 烘进镜像', '读写挂载整个 HOME', '成本超限后才停止调度'],
    outcome: '你会让无人值守 Agent 在清晰权限、成本预算与恢复策略内运行。',
    why: 'Project Trust 只决定是否加载仓库内配置与 Extension，不是运行时沙箱。真实隔离来自容器、VM、Gondolin 或 OpenShell。平台还要在每次 Run 开始前决定模型、thinking、工具权限、cwd、网络与预算，并把这些选择写入审计事件。',
    concepts: ['Project Trust', 'Sandbox', 'Model routing', 'Budget', 'SLO'],
    steps: [
      {
        title: '验证 Project Trust 的边界',
        detail: '在测试仓库加入 .pi/extensions/marker.ts。首次进入观察 trust 提示；拒绝时项目资源不加载。即使信任，模型仍可请求 bash，所以它不是沙箱。',
        command: 'mkdir -p experiments/untrusted/.pi/extensions\ncd experiments/untrusted && pi\n# 首次选择不信任，检查 extension 未加载；之后 /trust 再对比',
        expected: '不信任时项目设置、扩展、skills、prompts 不加载；内置工具权限没有因此被 OS 隔离。',
        check: '能用一句话准确区分 input-loading guard 与 execution sandbox',
      },
      {
        title: '构建最小 Docker Executor',
        detail: '镜像只装 Node、git、ripgrep 与 PI；代码挂到 /workspace，Agent 配置放独立 named volume。不要挂载宿主 ~/.pi/agent。',
        command: 'docker build -t pi-executor:0.84.4 -f Dockerfile.pi .\ndocker run --rm -it --read-only --tmpfs /tmp -v "$PWD:/workspace" -v pi-lab-agent:/root/.pi/agent pi-executor:0.84.4',
        expected: 'PI 在容器运行；只能写 workspace 与显式可写 volume，宿主其他路径不可见。',
        check: '容器内读取 /Users/<你>/ 被拒绝，workspace 改动可在宿主看到',
      },
      {
        title: '最小化凭据与网络',
        detail: '只注入当前 provider 所需 key；不复制 .env。高安全环境使用短期凭据或 OpenShell inference routing，把原始 key 留在 gateway。',
        command: 'docker run --rm -it --network none pi-executor:0.84.4 --no-session\n# 先验证离线失败，再仅开放所需模型端点的环境运行',
        expected: '无网络时模型调用快速失败；受控网络时只访问允许 provider。',
        check: '容器 env 不含无关云密钥，日志不打印 token',
      },
      {
        title: '建立模型路由表',
        detail: '不要让 Agent 自己决定无限升级模型。按任务风险/复杂度分配 provider、model、thinking 和预算；PI v0.82+ 支持 max thinking 与更准确的长上下文计价。',
        command: 'node cli.mjs route --role scout --risk low\nnode cli.mjs route --role reviewer --risk high',
        expected: 'Scout 获得轻量模型+low；Reviewer 获得强模型+high/max；每条路由带 maxTokens/maxCost/maxDuration。',
        check: '未知角色或模型不可用时走明确 fallback，不静默换贵模型',
      },
      {
        title: '采集运行级可观测数据',
        detail: '从事件流和 PI_SESSION_ID/PROVIDER/MODEL/REASONING_LEVEL 记录 run duration、queue wait、tool latency、token、cost、compaction、waiting_user。v0.84.4 的 UI prompt 事件避免把等人时间算成推理延迟。',
        command: 'node metrics.mjs --run R-042 < .lab/audit/events.jsonl\nnode cli.mjs report R-042',
        expected: '报告分开显示 queue、active agent、waiting user、tool 和 provider 时间。',
        check: '一次 Run 可追踪到 task、agent、session、model、worktree 与全部工具调用',
      },
      {
        title: '完成生产故障演练',
        detail: '依次注入 provider 429、工具卡死、磁盘满、Scheduler 崩溃、用户长期不确认、测试失败。定义每类故障的超时、重试、降级、告警与终态。',
        command: 'npm run chaos -- --scenario provider-429\nnpm run chaos -- --scenario stale-lease\nnpm run chaos -- --scenario approval-timeout',
        expected: '瞬时错误受预算重试；永久错误停止；过期租约可恢复；等待用户不占执行槽。',
        check: '所有场景无孤儿 PI 进程、无悬空 worktree、无重复外部副作用',
        failure: '将 maxCost 调到极低，验证成本门禁是在下一次模型调用前终止，而不是事后报告。',
      },
    ],
    codeTitle: 'Dockerfile.pi',
    codeLang: 'dockerfile',
    code: `FROM node:24-bookworm-slim

RUN apt-get update \\
 && apt-get install -y --no-install-recommends \\
    bash ca-certificates git ripgrep \\
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g --ignore-scripts \\
  @earendil-works/pi-coding-agent@0.84.4

RUN useradd -m -u 10001 agent
USER agent
WORKDIR /workspace
ENTRYPOINT ["pi"]`,
    terminal: [
      'run R-042 · provider=openai · thinking=high',
      'queue 1.2s · active 38.4s · waiting_user 12.0s',
      'tools 7 · compactions 1 · estimated $0.31',
      'sandbox workspace=rw · home=isolated · net=restricted',
      'chaos 6/6 passed · orphan processes 0',
      '✓ production gate passed',
    ],
    source: 'https://pi.dev/docs/latest/containerization',
  },
]

const textbookModules: CourseModule[] = [
  {
    id: 'kernel-protocol',
    index: '00',
    phase: '内核',
    title: '重建协议与模型事件流',
    subtitle: 'Checkpoint 00–05：从离线轨迹到 Provider Adapter',
    duration: '4–6 小时',
    level: '进阶',
    practice: 'Build your own PI',
    version: 'course-v1',
    prerequisites: ['TypeScript 联合类型', 'Promise / AsyncIterator', 'Node.js test runner'],
    deliverables: ['独立练习目录 00–05', 'EventStream 实现', 'Canonical Message IR', '离线 Provider Adapter'],
    pitfalls: ['直接查看 target 答案', '把 delta 写入持久 transcript', '在 Provider 层泄露 API Key'],
    outcome: '你会从零实现一条可测试的模型事件流，并隔离内部消息与外部 Provider 协议。',
    why: '真实 Agent 的第一块地基不是 prompt，而是时间与协议：模型响应分段到达，消费者既要逐项渲染，又要等待唯一终态；Provider 的 wire format 会变化，内部 Message IR 必须稳定。社区教材用固定 Git checkpoint 把这些边界变成离线测试。',
    concepts: ['Tagged union', 'EventStream', 'Message IR', 'ScriptedModel', 'Provider adapter', 'SSE'],
    steps: [
      {
        title: '取得固定课程历史',
        detail: '克隆课程分支后切到 course-v1/14。不要使用浅克隆，因为 checkpoint/practice 需要读取每章 parent 与 target 历史。先记录 HEAD 和 tag，确保所有人从同一教材版本开始。',
        command: 'git clone --branch course/build-your-own-pi https://github.com/hahhforest/pi.git pi-kernel-course\ncd pi-kernel-course\ngit checkout course-v1/14\nnpm install\ngit rev-parse --short HEAD',
        expected: 'HEAD 为 d2bfac2；packages/pi-course 存在，npm install 完成。',
        check: 'npm run checkpoint -w @pi/course -- 00 能显示 parent、target、教学文件与聚焦测试',
      },
      {
        title: 'Checkpoint 00：跟踪完整离线闭环',
        detail: '先观察，不实现。运行 prologue 测试并手画 user → assistant(toolCall) → toolResult → assistant(stop)。确认每个 call id 都有配对结果。',
        command: 'npm run checkpoint -w @pi/course -- 00\nnpm run practice -w @pi/course -- 00 ../pi-practice-00\ncd ../pi-practice-00\nnpm run build\nnode --test dist/test/00-*.test.js',
        expected: '2 项测试通过，其中一项会识别悬空 tool call。',
        check: '能指出模型为何需要两次调用，以及 toolResult 如何成为第二次请求的事实',
      },
      {
        title: 'Checkpoint 01：把 unknown 收窄成事件',
        detail: '从 parent 创建练习，只实现四种 DemoEvent 的 tagged union 和运行时 parser。外部 JSON 必须先以 unknown 进入验证，不能直接 as DemoEvent。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 01 ../pi-practice-01\ncd ../pi-practice-01\nnpm run build\nnode --test dist/test/01-*.test.js',
        expected: '联合类型覆盖开始、增量、完成、错误；无效输入被 parser 拒绝。',
        check: '增加第五个事件后，exhaustive switch 会产生编译错误直到处理完成',
        failure: '把 parser 改成直接返回 value as DemoEvent，传入缺少字段的 done 事件，记录它在多远之后才失败。',
      },
      {
        title: 'Checkpoint 02：实现 EventStream 两种时序',
        detail: '实现同一个对象上的 push、AsyncIterator 与 result。分别覆盖事件先到进入 queue、消费者先到进入 waiters；终态事件必须先被迭代器读到，下一次 next 才 done=true。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 02 ../pi-practice-02\ncd ../pi-practice-02\nnpm run build\nnode --test dist/test/02-*.test.js',
        expected: '2 项测试通过：queue 路径和 waiter 路径都交付过程事件与唯一最终结果。',
        check: '终态同时结束 iterator 和 result Promise，之后 push 被拒绝',
        failure: '把 next 的检查顺序改成先看 done 再看 queue，验证终态事件会从迭代观察中消失。',
      },
      {
        title: 'Checkpoint 03：建立 Canonical Message IR',
        detail: '定义 user、assistant、toolResult 与 text/toolCall content block。模型 delta 只用于 UI；持久化只保存最终 assistant。error/aborted 也必须 resolve 为带 stopReason 的最终消息。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 03 ../pi-practice-03\ncd ../pi-practice-03\nnpm run build\nnode --test dist/test/03-*.test.js',
        expected: '文本投影不会修改 canonical content；error 终态仍完成 result。',
        check: '一个 assistant 同时含 text 与两个 toolCall 时，结构信息完整保留',
      },
      {
        title: 'Checkpoint 04：用 ScriptedModel 隔离模型',
        detail: '实现一个按顺序播放预设回合的模型，保存每次请求深拷贝并生成与真实模型一致的事件。它是之后所有 Agent 测试的确定性替身。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 04 ../pi-practice-04\ncd ../pi-practice-04\nnpm run build\nnode --test dist/test/04-*.test.js',
        expected: '正常、显式错误、脚本耗尽、预取消四类路径都有唯一终态。',
        check: '重复运行测试无网络、无随机性、事件序列完全一致',
      },
      {
        title: 'Checkpoint 05：隔离真实 Provider 边界',
        detail: '把 canonical message 映射为 provider 请求，把 SSE chunk 恢复为统一事件。按 index 合并交错 tool arguments；底层异常必须保留 partial，同时脱敏 Authorization。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 05 ../pi-practice-05\ncd ../pi-practice-05\nnpm run build\nnode --test dist/test/05-*.test.js',
        expected: '11 项聚焦测试通过，覆盖 SSE、usage、取消、未知 finish reason、形状校验与 secret 脱敏。',
        check: '请求 JSON body 不含 API Key，错误文本也不能出现测试 key',
        failure: '让两个 tool call 的 argument chunk 交错到达；若按到达顺序而非 index 合并，测试必须失败。',
      },
    ],
    codeTitle: 'EventStream 的两条交付路径',
    codeLang: 'typescript',
    code: `class EventStream<T, R> implements AsyncIterable<T> {
  private queue: T[] = []
  private waiters: Array<(v: IteratorResult<T>) => void> = []
  private closed = false

  push(event: T) {
    if (this.closed) throw new Error("stream closed")
    const waiter = this.waiters.shift()
    if (waiter) waiter({ value: event, done: false })
    else this.queue.push(event)
    // 若 event 是终态：同时完成 result，但仍让 iterator 读到它
  }

  // next 顺序：queue → closed → register waiter
  // result：等待同一个终态动作
}`,
    terminal: [
      'checkpoint 00  2/2 · offline trace',
      'checkpoint 01  tagged union boundary',
      'checkpoint 02  queue + waiter paths',
      'checkpoint 03  canonical messages',
      'checkpoint 04  deterministic model',
      'checkpoint 05  11/11 provider tests',
    ],
    source: 'https://github.com/hahhforest/pi-textbook',
    sourceLabel: '社区教材 · CC BY 4.0',
  },
  {
    id: 'kernel-agent-loop',
    index: '00',
    phase: '内核',
    title: '闭合 Tool Contract 与 Agent Loop',
    subtitle: 'Checkpoint 06–08：schema、并发工具与 workspace',
    duration: '5–7 小时',
    level: '进阶',
    practice: 'Build your own PI',
    version: 'course-v1',
    prerequisites: ['完成协议与模型事件流', '理解 AbortSignal', '熟悉文件原子写入'],
    deliverables: ['Tool Registry', '两轮 Agent Loop', '并发工具执行器', '受控 Coding Tools'],
    pitfalls: ['未验证参数就执行', '按完成顺序写 transcript', 'Edit 中途失败后留下半份文件'],
    outcome: '你会实现能调用多个工具、保持配对顺序、可取消且受 workspace 约束的 Agent Loop。',
    why: '工具调用是一个闭合协议：schema 收窄输入，Registry 暴露 provider definition，Executor 必须为成功和所有失败生成同 callId 的结果。Agent Loop 只在完整结果回填后再调用模型，并把执行完成顺序与 transcript 顺序分开。',
    concepts: ['Tool schema', 'Registry', 'Executor', 'Transcript', 'maxSteps', 'Workspace boundary'],
    steps: [
      {
        title: 'Checkpoint 06：建立 Tool Contract',
        detail: '从 unknown 参数开始验证，生成精确 JSON Schema；Registry 拒绝重名，只向模型暴露 name/description/schema；Executor 统一成功、未知工具、参数错误和运行错误。',
        command: 'cd pi-kernel-course\nnpm run practice -w @pi/course -- 06 ../pi-practice-06\ncd ../pi-practice-06\nnpm run build\nnode --test dist/test/06-*.test.js',
        expected: '4 组测试通过；每条 ToolResult 都沿用原 toolCallId。',
        check: '工具抛异常也返回 isError=true 的配对结果，而不是让 transcript 悬空',
      },
      {
        title: 'Checkpoint 07.1：实现纯文本终态',
        detail: 'Agent Loop 深拷贝输入 messages，调用 model.stream，转发过程事件，只追加一次最终 assistant，并从单一 finish 点发出 turn_end。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 07 ../pi-practice-07\ncd ../pi-practice-07\nnpm run build\nnode --test --test-name-pattern="纯文本 stop" dist/test/07-*.test.js',
        expected: '1/1 通过；调用者输入保持不变，steps=1，只有一个 turn_end。',
        check: 'delta 没有成为 transcript 中的独立 message',
      },
      {
        title: 'Checkpoint 07.2：完成两轮工具往返',
        detail: '第一轮 assistant 的 stopReason=toolUse 时提取 calls，执行并回填 toolResult；第二次 model.stream 必须看到 user、assistant、toolResult 的完整顺序。',
        command: 'node --test --test-name-pattern="单工具往返" dist/test/07-*.test.js',
        expected: '第二次模型请求包含同 call-1 的 toolCall 与 toolResult，最后返回 stop。',
        check: '每轮请求使用 Registry 当前 definitions，而不是旧 context.tools',
      },
      {
        title: 'Checkpoint 07.3–07.5：处理非正常终态',
        detail: 'length/error/aborted 不执行工具但仍为所有 call 生成 error result；并发工具可以乱序完成，但 transcript 按原 call 顺序回填；预取消不调用模型，maxSteps 产生唯一控制器终态。',
        command: 'node --test --test-name-pattern="非执行终态|并发工具|取消与上限" dist/test/07-*.test.js',
        expected: '相关测试全部通过，任何路径都没有 orphan call 或重复 turn_end。',
        check: '慢工具先声明、快工具先完成时，事件顺序与 transcript 顺序各自正确',
        failure: '把 Promise.all 结果按 resolve 时间直接 push，观察并发工具 transcript 测试如何捕获顺序漂移。',
      },
      {
        title: 'Checkpoint 08.1–08.3：实现受控 Read/Write',
        detail: 'Read 支持行窗口与字节上限，截断不能切断一行；所有路径先解析 realpath 并限制在 workspace；Write 创建父目录并回报实际字节。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 08 ../pi-practice-08\ncd ../pi-practice-08\nnpm run build\nnode --test --test-name-pattern="Read|workspace|Write" dist/test/08-*.test.js',
        expected: '路径 traversal 与 workspace 外写入被拒绝；续读没有跳行。',
        check: '同一路径写队列串行，不同路径仍可并行',
      },
      {
        title: 'Checkpoint 08.4–08.5：原子 Edit 与可取消 Bash',
        detail: 'Edit 先在内存按顺序应用替换，全部成功后一次落盘；空匹配、多重匹配和中途失败都不改原文件。Bash 区分非零退出、超时和 AbortSignal。',
        command: 'node --test --test-name-pattern="Edit|Bash" dist/test/08-*.test.js',
        expected: 'Edit/Bash 聚焦测试通过，预取消 Bash 不启动子进程，截断提示计入字节预算。',
        check: '故意让第二个 edit 失败，文件 hash 与执行前相同',
      },
      {
        title: 'Checkpoint 08.6：跑通真实文件任务',
        detail: '用 ScriptedModel 驱动完整 Read → Edit → Bash 流程。验证工具共享同一 cwd，每个 call 配对，最终回答引用真实测试输出。',
        command: 'node --test --test-name-pattern="真 Agent 循环" dist/test/08-*.test.js\nnpm test',
        expected: '完整 checkpoint 08 和此前回归全部通过。',
        check: '任何失败都能归因到 model、loop、tool contract 或具体 coding tool 一层',
      },
    ],
    codeTitle: 'Agent Loop 的不可破坏顺序',
    codeLang: 'text',
    code: `messages = clone(input)

repeat until terminal or maxSteps:
  assistant = await model.stream(messages).result()
  append(assistant)                 # 完整消息，只追加一次

  calls = assistant.toolCalls
  if terminal != toolUse: pair calls as errors; stop

  results = await executeConcurrently(calls)
  append(results in original call order)
  assert every call.id has exactly one result.toolCallId

cancel → stop new work → await/normalize current batch → one turn_end`,
    terminal: [
      'tool contract     4 groups passed',
      'plain stop        model calls=1',
      'read round-trip   model calls=2',
      'parallel tools    completion ≠ transcript order',
      'atomic edit       original preserved on failure',
      '✓ checkpoint 06–08 regression passed',
    ],
    source: 'https://github.com/hahhforest/pi-textbook/blob/main/content/chapters/07-agent-loop.md',
    sourceLabel: '社区教材 · CC BY 4.0',
  },
  {
    id: 'kernel-state-context',
    index: '00',
    phase: '内核',
    title: '实现有状态 Agent 与上下文重建',
    subtitle: 'Checkpoint 09–11：队列、Session Tree 与 Compaction',
    duration: '5–7 小时',
    level: '生产',
    practice: 'Build your own PI',
    version: 'course-v1',
    prerequisites: ['完成 Agent Loop', '理解 reducer', '理解 append-only log'],
    deliverables: ['Stateful Agent', 'Steering/Follow-up 队列', 'Fail-closed JSONL Store', '预算化 Context Builder'],
    pitfalls: ['迟到事件污染新 Run', '部分 JSONL 尾部当成已提交', '在 toolCall/toolResult 中间截断上下文'],
    outcome: '你会实现可重入、可取消、可恢复，并能按 token 预算确定性重建上下文的 Agent。',
    why: '有状态 Agent 的关键不是把数组放到 class，而是定义每个运行的所有权：runId 隔离迟到事件，busy guard 拒绝重入，steering 与 follow-up 有不同消费时机。持久历史不可变；上下文只是从当前分支与最新摘要投影出的预算视图。',
    concepts: ['Reducer', 'Busy guard', 'Steering queue', 'Session tree', 'Append-only JSONL', 'Interaction group'],
    steps: [
      {
        title: 'Checkpoint 09.1–09.3：实现 Agent 状态机',
        detail: 'Reducer 从事件派生 streamingText、pendingTools 与终态，不修改输入。每次 prompt 分配 runId；旧 run 的迟到事件忽略。先更新 state 再通知订阅者，坏 subscriber 不影响其他人。',
        command: 'cd pi-kernel-course\nnpm run practice -w @pi/course -- 09 ../pi-practice-09\ncd ../pi-practice-09\nnpm run build\nnode --test --test-name-pattern="reducer|busy guard|subscriber" dist/test/09-*.test.js',
        expected: '状态、订阅事件与 prompt result 不共享可变引用；并行 prompt 被 busy guard 拒绝。',
        check: 'run A 结束后的迟到 delta 不会出现在 run B 的 streamingText',
      },
      {
        title: 'Checkpoint 09.4：贯穿取消信号',
        detail: '每个 run 新建 AbortController，同一个 signal 同时传给 model 与 tools。取消等待当前工具产生配对结果，清理完成后下一次 prompt 使用新 controller。',
        command: 'node --test --test-name-pattern="预取消|运行中取消" dist/test/09-*.test.js',
        expected: '一次取消只发一个 run_end；下一次 prompt 不继承 aborted signal。',
        check: '模型与工具观察到严格相同的 signal 对象',
      },
      {
        title: 'Checkpoint 09.5：区分 Steering 与 Follow-up',
        detail: 'Steering 在完整工具批次后按 FIFO 进入下一次模型请求；纯文本 stop 期间到达的 steering 开启新轮。Follow-up 只在自然 stop 后消费，失败时不泄漏到未来 run。',
        command: 'node --test --test-name-pattern="steering|follow-up" dist/test/09-*.test.js',
        expected: '队列时机测试全部通过，消息没有插入 toolCall 与 toolResult 之间。',
        check: 'error/aborted 后 follow-up 仍保留或按明确策略处理，不被静默消费',
      },
      {
        title: 'Checkpoint 10.1–10.3：构建 Session Tree',
        detail: 'Entry 包含唯一 id 与 parentId。pathTo 只恢复所选祖先链并全局拒绝重复 id；append 在调用时深拷贝快照、按 FIFO 提交，缺失 parent 不污染队列。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 10 ../pi-practice-10\ncd ../pi-practice-10\nnpm run build\nnode --test --test-name-pattern="pathTo|parseSessionEntry|InMemory" dist/test/10-*.test.js',
        expected: '内存 Store 和路径恢复测试通过，返回值与内部状态不共享引用。',
        check: '同一根节点的两个 leaf 各自只恢复自己的对话路径',
      },
      {
        title: 'Checkpoint 10.4–10.6：Fail-closed JSONL',
        detail: '只有以换行结束的 JSONL 行算已提交；无换行尾部视为崩溃残片。schema 错误报告物理行号。一次 I/O 失败后 writer 进入 poisoned 状态，必须重开修复。',
        command: 'node --test --test-name-pattern="recoverJsonl|Jsonl|messagesOnPath" dist/test/10-*.test.js',
        expected: '重开保留旧字节前缀；损坏已提交行明确失败；未提交尾部安全忽略。',
        check: '手工追加半行 JSON 后仍恢复到最后完整 entry，且不自动覆盖损坏证据',
        failure: '将恢复逻辑改成尝试解析无换行尾部，模拟进程恰在写入中断时为什么会产生不确定状态。',
      },
      {
        title: 'Checkpoint 11.1–11.3：按 Interaction 预算上下文',
        detail: '先将 user 到下一 user 之间的消息组成 interaction，按 callId 验证工具事实完整。预算先扣 system、输出预留与安全余量，再从最新完整 interaction 向前保留。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 11 ../pi-practice-11\ncd ../pi-practice-11\nnpm run build\nnode --test --test-name-pattern="compaction schema|groupInteractions|buildContext" dist/test/11-*.test.js',
        expected: 'orphan、duplicate、missing tool fact 被拒绝；预算只在完整组边界截断。',
        check: '最新单组即使超限也完整保留 user、calls、results 与终态',
      },
      {
        title: 'Checkpoint 11.4–11.5：摘要连接不可变历史',
        detail: 'Compaction 是新的树条目，记录结构化摘要与 firstKept；历史不删除。恢复时只用当前路径最新摘要，再拼接从 firstKept 开始的完整后缀。',
        command: 'node --test --test-name-pattern="createCompactionEntry|最新 compaction|再次压缩" dist/test/11-*.test.js\nnpm test',
        expected: '多次构建确定一致；恢复后的路径可再次压缩；输入与结果完全隔离。',
        check: '切到另一分支时不会误用当前分支的摘要',
      },
    ],
    codeTitle: '历史与上下文的不同生命周期',
    codeLang: 'text',
    code: `Session history (immutable tree)
  root ─ user ─ assistant(call) ─ result ─ assistant
          └─ alternate branch ...
                         └─ compaction(summary, firstKept)

Context for next request (derived view)
  system prompt
  + latest summary on active path
  + complete interactions from firstKept
  + unpersisted suffix for current run

预算不足 → 移动 firstKept；绝不删除或切断工具事实。`,
    terminal: [
      'stateful agent   late event ignored by runId',
      'cancel           model/tool share signal',
      'session tree     active leaf restored',
      'jsonl recovery   partial tail ignored',
      'context budget   complete interactions only',
      '✓ checkpoint 09–11 regression passed',
    ],
    source: 'https://github.com/hahhforest/pi-textbook/blob/main/content/chapters/11-context-compaction.md',
    sourceLabel: '社区教材 · CC BY 4.0',
  },
  {
    id: 'kernel-runtime-eval',
    index: '00',
    phase: '内核',
    title: '组装 Runtime 并建立独立 Eval',
    subtitle: 'Checkpoint 12–14：资源、扩展、Composition Root 与证据',
    duration: '5–7 小时',
    level: '生产',
    practice: 'Build your own PI',
    version: 'course-v1',
    prerequisites: ['完成 Stateful Agent 与 Context', '理解依赖注入', '会设计测试 fixture'],
    deliverables: ['Resource Catalog', 'Trust-gated Extension Loader', 'Durable Runtime', '独立 Eval Suite'],
    pitfalls: ['信任检查晚于 import', '注册一半扩展后失败', '用最终回答自评最终回答'],
    outcome: '你会把所有原语接成一个可持久运行时，并用与实现隔离的安全证据评测它。',
    why: '最后一步不是再加功能，而是建立组合边界与独立判定。资源要有 precedence 和按需加载；Extension 必须先过 trust 再 import，注册要 staging 后原子提交；Runtime 统一 prompt、持久化、flush、dispose；Eval 的 judge 只能看到声明过的观察面。',
    concepts: ['Resource catalog', 'Trust gate', 'Staging registration', 'Composition root', 'Eval fixture', 'Safe evidence'],
    steps: [
      {
        title: 'Checkpoint 12.1–12.3：资源发现与按需激活',
        detail: '按 roots 输入顺序处理 kind+name 冲突，catalog 稳定输出元数据但 inactive skill 不读正文。activateSkill 才读取 canonical source，并用 realpath 阻止 traversal 与 symlink 逃逸。',
        command: 'cd pi-kernel-course\nnpm run practice -w @pi/course -- 12 ../pi-practice-12\ncd ../pi-practice-12\nnpm run build\nnode --test --test-name-pattern="catalog|activateSkill|renderTemplate|formatResourceContext" dist/test/12-*.test.js',
        expected: '资源优先级确定；未激活 Skill 不进入 context；路径逃逸被拒绝。',
        check: '同名用户/项目 Skill 的胜者与 roots precedence 一致且可解释',
      },
      {
        title: 'Checkpoint 12.4：Trust 必须早于 import',
        detail: '扩展模块 import 本身就可能执行任意代码，因此先检查 trust。Factory 注册到 staging registry；只有全部成功且无重名才原子提交到真实 Registry。',
        command: 'node --test --test-name-pattern="trust gate|staging registration" dist/test/12-*.test.js',
        expected: '未信任扩展零 import 副作用；factory 中途失败时零残留工具/hook。',
        check: '用 marker 文件证明 deny 路径从未执行模块顶层代码',
        failure: '把 trust 判断移到 dynamic import 之后，观察 marker 如何证明“未注册”不等于“未执行”。',
      },
      {
        title: 'Checkpoint 12.5：Hook 失败要闭合协议',
        detail: 'before hook 可 deny 工具，但仍生成配对 error result；before throw/timeout 必须 fail closed。after 对 core result 只运行一次，失败只能追加诊断，不能替换真实结果。',
        command: 'node --test --test-name-pattern="before deny|before throw|after" dist/test/12-*.test.js',
        expected: '所有 hook 失败都有 diagnostic，且 transcript 仍满足 call/result 不变量。',
        check: '安全 hook 超时不会退化为默认允许',
      },
      {
        title: 'Checkpoint 13.1–13.2：建立 Composition Root',
        detail: '空 Session 创建唯一 Runtime 外壳；非空 Session 必须显式选 leaf。Context Adapter 临时拼接未持久化 suffix，扣除固定成本后只传完整最近 interaction，并隔离 inner model 输入。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 13 ../pi-practice-13\ncd ../pi-practice-13\nnpm run build\nnode --test --test-name-pattern="Runtime 外壳|context adapter" dist/test/13-*.test.js',
        expected: '恢复分支、上下文预算、tools/signal 转发均通过；control 不直接暴露底层 prompt。',
        check: '非空 Session 没有 leaf 参数时明确失败，不擅自选择最后写入项',
      },
      {
        title: 'Checkpoint 13.3–13.4：定义持久化完成语义',
        detail: 'Runtime.prompt 只有在新消息全部持久化后才 resolve；只追加恢复历史之后的新 suffix。写入失败令 Runtime poisoned。flush 等当前队列；dispose 等落盘并永久关闭新 prompt。',
        command: 'node --test --test-name-pattern="接通 resources|持久化|flush|interactive|print|json" dist/test/13-*.test.js',
        expected: 'interactive/print/json 都只调用一次 Runtime.prompt；json 只改变呈现，不改变核心语义。',
        check: 'dispose resolve 后没有未落盘消息，也不能再发新 prompt',
      },
      {
        title: 'Checkpoint 14.1–14.2：Eval 与实现隔离',
        detail: '每个 case 都创建全新 fixture，按 prepare → execute → observe → judge → dispose → cleanup 收口。Judge 只看 active path 与声明文件；task verdict 与 judge/infra failure 分层。',
        command: 'cd ../pi-kernel-course\nnpm run practice -w @pi/course -- 14 ../pi-practice-14\ncd ../pi-practice-14\nnpm run build\nnode --test --test-name-pattern="prepare|judge|active path|verdict" dist/test/14-*.test.js',
        expected: '重复 case 每次重新 prepare；执行故障与收集故障进入不同 infra phase。',
        check: 'Eval 不读取非声明文件，也不把隐藏分支当成活动证据',
      },
      {
        title: 'Checkpoint 14.3：只输出 Safe Evidence',
        detail: '聚合报告只保留固定分类和计数，不泄露 transcript、文件正文、路径或 callId。已有 primary failure 不被 dispose/cleanup 覆盖，secondary 按发生顺序追加。',
        command: 'node --test --test-name-pattern="SafeEvidence|primary|suite" dist/test/14-*.test.js\nnpm test',
        expected: '完整 00–14 回归通过；报告稳定、可比较、不含敏感执行内容。',
        check: '对相同 fixture 连续运行两次，分类与计数完全一致',
        failure: '让 execute 与 cleanup 同时失败，验证报告保留 execute 为 primary、cleanup 为 secondary。',
      },
    ],
    codeTitle: '独立 Eval 的责任边界',
    codeLang: 'typescript',
    code: `for (const evalCase of suite) {
  const fixture = await prepare(evalCase) // 每次全新环境
  let primary: Failure | undefined
  const secondary: Failure[] = []
  try {
    await runtime.prompt(evalCase.prompt)
    const observed = freeze(await observeDeclaredSurface(fixture))
    await judge(evalCase.expectation, observed)
  } catch (error) {
    primary = classifyByPhase(error)
  } finally {
    await dispose().catch((e) => secondary.push(classify(e)))
    await cleanup().catch((e) => secondary.push(classify(e)))
  }
  emitSafeEvidence({ category: primary?.category, secondaryCount: secondary.length })
}`,
    terminal: [
      'resources      lazy skill body · stable precedence',
      'extensions     trust before import · atomic registration',
      'runtime        prompt resolves after durable append',
      'modes          interactive / print / json share semantics',
      'eval           fresh fixture · declared observations only',
      '✓ checkpoint 12–14 + full regression passed',
    ],
    source: 'https://github.com/hahhforest/pi-textbook/blob/main/content/chapters/14-eval-capstone.md',
    sourceLabel: '社区教材 · CC BY 4.0',
  },
]

const learningRoadmapModule: CourseModule = {
  id: 'ai-learning-roadmap',
  index: '00',
  phase: '基础',
  title: '先学会怎样学习 Agent',
  subtitle: '从 ReAct 与最小实现，到源码拆解和可验证闭环',
  duration: '90 分钟 + 4 周实践',
  level: '入门',
  practice: '学习路线设计',
  version: '通用方法',
  prerequisites: ['能使用终端与 Git', '选择一个可稳定调用的模型', '准备一个真实但低风险的练习任务'],
  deliverables: ['四周学习计划', 'Minimal Agent 规格', '源码拆解清单', '任务 Eval Card'],
  pitfalls: ['按榜单盲目追逐最强模型', '只刷教程不实现', '没有单 Agent 基线就堆 Multi-Agent'],
  outcome: '你会建立“原理—最小实现—源码—真实任务—评测”的学习闭环，并知道后续每个 PI 模块在验证什么。',
  why: '先建立通用 Agent 心智模型，再把 PI 当作一套可运行、可观察的参考实现。这样你学到的是能迁移到 Codex、Claude Code、OpenCode 等系统的原理，而不是只会记住某个产品的命令。',
  concepts: ['ReAct loop', 'Agent-Computer Interface', 'Minimal Agent', 'Source reading', 'Closed-loop eval', 'Parallelism'],
  steps: [
    {
      title: '建立模型、成本与任务基线',
      detail: '选择一个你能长期稳定调用的模型，不把排行榜当答案。记录三个来自自己工作的固定任务，后续始终用成功率、耗时、成本和返工次数比较模型与 Agent 设计。',
      command: 'mkdir -p experiments/learning-roadmap\nprintf "# Agent learning baseline\\n\\n- Model/provider:\\n- Monthly budget:\\n- Task A:\\n- Task B:\\n- Task C:\\n- Metrics: success, time, cost, rework\\n" > experiments/learning-roadmap/BASELINE.md',
      expected: '形成一个不会随榜单变化而失效的个人评测基线。',
      check: '三个任务都有输入、期望输出与可记录指标',
    },
    {
      title: '用 ReAct 读懂一次 Agent 循环',
      detail: '阅读 ReAct 的问题定义与方法图，不追求一次读完全部实验。把一条轨迹标成 Plan/Reason → Action → Observation → Updated Plan，说明外部观察如何修正模型原本的判断。',
      command: 'printf "# ReAct trace\\n\\nGoal:\\nPlan/Reason:\\nAction:\\nObservation:\\nUpdated plan:\\nStop condition:\\n" > experiments/learning-roadmap/REACT_TRACE.md',
      expected: '你能解释 Agent 为什么不是“模型多想一会儿”，而是模型与环境反复交互。',
      check: '轨迹至少包含一次工具观察和一次基于观察的计划更新',
    },
    {
      title: '用 SWE-agent 理解 ACI',
      detail: '阅读 SWE-agent 对 Agent-Computer Interface 的解释。比较“给模型一个任意 shell”和“给模型少量、描述清晰、反馈紧凑的工具”，记录接口设计如何改变 Agent 行为。',
      command: 'printf "# ACI review\\n\\n| Tool | Input boundary | Observation | Failure signal |\\n|---|---|---|---|\\n| read | | | |\\n| edit | | | |\\n| bash | | | |\\n" > experiments/learning-roadmap/ACI_REVIEW.md',
      expected: '得到一张工具接口表，而不是只记住 SWE-agent 的跑分。',
      check: '每个工具都有输入边界、可观察结果和失败信号',
    },
    {
      title: '先写 Minimal Agent 规格',
      detail: '在看复杂框架前，定义最小 Agent：输入目标、构建上下文、调用模型、解析 tool call、执行、追加 observation、判断继续或结束。先使用 ScriptedModel，后续内核模块再逐步实现。',
      command: 'printf "# Minimal Agent spec\\n\\n1. Goal input\\n2. Context builder\\n3. Model decision\\n4. Tool parser\\n5. Executor\\n6. Observation append\\n7. Stop / retry / fail\\n" > experiments/learning-roadmap/MINIMAL_AGENT.md',
      expected: '得到一份小到能一次讲清、又覆盖完整闭环的实现规格。',
      check: '明确终止条件、最大轮数、工具失败和取消行为',
      failure: '删掉 observation 或 stop condition，说明系统会如何重复犯错或无限循环。',
    },
    {
      title: '建立生产级源码拆解清单',
      detail: '选择 PI、Codex、OpenCode 或其他公开 Coding Agent。不要从入口文件漫无目的地读；沿一次任务追踪 loop、context、memory、background task、skills/plugins、compaction、sandbox、MCP 和 observability。',
      command: 'printf "# Source reading map\\n\\n- Entry and loop:\\n- Context assembly:\\n- Tool dispatch:\\n- Memory/session:\\n- Background tasks:\\n- Skills/plugins:\\n- Compaction:\\n- Sandbox/trust:\\n- MCP/integrations:\\n- Logs/TUI:\\n" > experiments/learning-roadmap/SOURCE_MAP.md',
      expected: '形成一张从用户目标到最终结果的代码路径，而不是文件摘要合集。',
      check: '每一项都能指向代码位置、运行事件或实验模块',
    },
    {
      title: '选择可验证场景，并设置 Multi-Agent 门槛',
      detail: '优先选择能本地运行、测试、编译、仿真或形式化检查的任务。先记录单 Agent 基线；只有任务可独立拆分、结果可自动验收、并行收益大于协调成本时，才进入多 Agent。',
      command: 'printf "# Eval Card\\n\\nGoal:\\nFixture:\\nAllowed tools:\\nAutomatic verifier:\\nSingle-agent baseline:\\nParallelizable branches:\\nMerge rule:\\nBudget/timeout:\\nHuman gates:\\n" > experiments/learning-roadmap/EVAL_CARD.md',
      expected: '得到一个可重复运行的任务定义，以及是否值得使用多 Agent 的明确证据。',
      check: '验收器不依赖 Agent 自己声称“已完成”',
      failure: '挑一个“预测明天股价”式开放问题，指出它缺少哪些可观测输入与可靠验收。',
    },
  ],
  codeTitle: '学习主线与 PI 对照',
  codeLang: 'text',
  code: `通用 Agent 原理                  PI 中的实现证据
ReAct：决定 → 行动 → 观察         Agent loop / tool events
ACI：工具就是能力边界             read / write / edit / bash / Extension
Context：选择此刻需要的信息        AGENTS.md / Skills / compaction
State：历史必须可恢复              Session tree / JSONL
Automation：进程可被程序控制       Print JSON / SDK / RPC
Evaluation：外部证据判定完成        tests / eval / review gate
Parallelism：独立分支才并行         subagent / DAG / worktree

学习循环：读原理 → 写最小实现 → 拆源码 → 做真实任务
          → 记录失败 → 加验证与边界 → 再考虑 Multi-Agent`,
  terminal: [
    '$ ls experiments/learning-roadmap',
    'ACI_REVIEW.md  BASELINE.md  EVAL_CARD.md',
    'MINIMAL_AGENT.md  REACT_TRACE.md  SOURCE_MAP.md',
    'single-agent baseline: recorded',
    'automatic verifier: required',
    '✓ ready to use PI as the reference implementation',
  ],
  source: 'https://www.youtube.com/watch?v=BqF6PUAXY1M',
  sourceLabel: '路线来源 · 视频',
}

const courseOrder = [
  learningRoadmapModule,
  advancedModules[0],
  originalModules[0],
  originalModules[1],
  advancedModules[1],
  textbookModules[0],
  textbookModules[1],
  textbookModules[2],
  textbookModules[3],
  originalModules[2],
  advancedModules[2],
  originalModules[3],
  originalModules[4],
  originalModules[5],
  advancedModules[3],
  advancedModules[4],
  advancedModules[5],
  originalModules[6],
]

const moduleEnhancements: Record<string, Partial<CourseModule>> = {
  'first-run': {
    level: '入门',
    practice: 'CLI 基线',
    prerequisites: ['完成 AI Agent 学习路线与技术模型模块', 'Node.js >= 22.19.0'],
    deliverables: ['独立实验仓库', '首次工具调用记录', '可恢复 Session'],
    pitfalls: ['使用浮动版本导致步骤漂移', '任务没有验收标准', '把 API Key 写入仓库'],
  },
  context: {
    level: '入门',
    practice: '上下文工程',
    prerequisites: ['完成首次会话', '理解稳定规则与临时指令的区别'],
    deliverables: ['项目 AGENTS.md', '按需 Skill', 'Prompt Template', '压缩证据'],
    pitfalls: ['把所有知识塞进 system prompt', 'Skill 描述含糊无法触发', '把 secret 写进上下文'],
  },
  tools: {
    level: '进阶',
    practice: 'Tool Extension',
    prerequisites: ['TypeScript 基础', '理解 JSON Schema'],
    deliverables: ['project_stats 工具', '路径越界测试', '工具审计日志'],
    pitfalls: ['schema 过宽', '返回无限大结果', '把输入校验交给模型'],
  },
  sdk: {
    level: '进阶',
    practice: '嵌入式 Agent',
    prerequisites: ['Node.js ESM', '完成工具模块'],
    deliverables: ['只读 SDK runner', '持久会话', '标准 JSONL 事件'],
    pitfalls: ['忘记 dispose', '给 Planner 全写权限', '混合日志与事件 stdout'],
  },
  rpc: {
    level: '进阶',
    practice: '跨进程 Host',
    prerequisites: ['理解 stdin/stdout 与 JSONL', '完成 SDK runner'],
    deliverables: ['长驻 RPC 控制器', 'steer/follow-up 队列', '可取消状态机'],
    pitfalls: ['使用 Node readline 解析协议', 'abort 前未 clear_queue', '子进程退出无终态'],
  },
  'multi-agent': {
    level: '生产',
    practice: '隔离协作',
    prerequisites: ['完成 RPC 与 Session 模块', '理解角色最小权限'],
    deliverables: ['四类 Agent 定义', '并行侦察', '实现—审查—返工闭环'],
    pitfalls: ['所有 Agent 共享上下文', 'Reviewer 参与实现', '并行写同一工作树'],
  },
  platform: {
    level: '生产',
    practice: '最终 Capstone',
    prerequisites: ['完成前 16 个模块', 'Git Worktree', 'SQLite 与 SSE'],
    deliverables: ['本地 Control Plane', 'Chief 任务拆解', '隔离 Executor', 'Web 事件时间线'],
    pitfalls: ['UI 直接解析模型自由文本', '绕过 Plan/Review 门禁', '失败重试覆盖历史'],
  },
}

export const modules: CourseModule[] = courseOrder.map((module, index) => ({
  ...module,
  ...moduleEnhancements[module.id],
  index: String(index + 1).padStart(2, '0'),
  level: moduleEnhancements[module.id]?.level ?? module.level ?? (index < 3 ? '入门' : index < 9 ? '进阶' : '生产'),
  practice: moduleEnhancements[module.id]?.practice ?? module.practice ?? '动手实验',
  version: moduleEnhancements[module.id]?.version ?? module.version ?? 'v0.84.4',
  prerequisites: moduleEnhancements[module.id]?.prerequisites ?? module.prerequisites ?? ['完成上一模块'],
  deliverables: moduleEnhancements[module.id]?.deliverables ?? module.deliverables ?? [module.outcome],
  pitfalls: moduleEnhancements[module.id]?.pitfalls ?? module.pitfalls ?? ['跳过验收直接进入下一模块', '只复制命令而不检查结果'],
}))

export const conceptGroups = [
  {
    index: '01',
    title: '学习闭环',
    summary: '先理解、再实现、再验证；PI 是贯穿课程的参考实现。',
    items: [
      ['ReAct', '让模型在计划、行动与环境观察之间循环，而不是一次生成最终答案。'],
      ['ACI', 'Agent-Computer Interface 决定模型能做什么、看到什么，以及失败是否清晰。'],
      ['Minimal Agent', '亲手闭合目标、上下文、模型、工具、观察与终止条件。'],
      ['Closed-loop eval', '用测试、编译、仿真或规则验证结果，不接受 Agent 自我宣告完成。'],
    ],
  },
  {
    index: '02',
    title: 'Agent 运行体',
    summary: '模型不是 Agent；运行循环与边界共同构成 Agent。',
    items: [
      ['Model', '负责生成下一步决定，不持有你的进程与文件权限。'],
      ['Agent loop', '把消息、工具调用、结果和下一轮推理连接起来。'],
      ['Session', '带树结构的 JSONL 历史，是上下文恢复来源。'],
      ['Tool', '带参数 schema 的能力边界，应可审计、可拒绝。'],
    ],
  },
  {
    index: '03',
    title: 'Harness 宿主',
    summary: 'PI core 保持小，把产品选择开放给 Extension。',
    items: [
      ['Context loader', '组装 AGENTS、SYSTEM、Skills 与 Prompt Templates。'],
      ['Extension API', '监听生命周期、注册工具/命令/UI、拦截行为。'],
      ['SDK', '在同一 Node.js 进程获得类型安全和完整状态访问。'],
      ['RPC', '以 JSONL 跨进程控制，适合多语言与故障隔离。'],
    ],
  },
  {
    index: '04',
    title: '调度控制面',
    summary: '多 Agent 的难点是状态、依赖和恢复，不是多开进程。',
    items: [
      ['Chief', '把目标拆成带验收与依赖的任务，不直接写代码。'],
      ['DAG scheduler', '只调度依赖已满足的任务并实施背压。'],
      ['Lease', '让崩溃后的运行可被安全接管，避免双重执行。'],
      ['Human gate', '将计划、外部写入和合并停在明确决策点。'],
    ],
  },
  {
    index: '05',
    title: '生产执行层',
    summary: '可信输入与运行隔离是两件不同的事。',
    items: [
      ['Project Trust', '只控制是否加载项目资源，不限制工具执行。'],
      ['Worktree', '隔离并行写 Agent 的 Git 文件状态。'],
      ['Sandbox', '用容器/VM/策略层限制文件、网络和凭据。'],
      ['Observability', '按 Run 记录状态、工具、token、成本与等待时间。'],
    ],
  },
]

export const blueprintAgents = [
  { id: 'you', label: '你', role: '目标 / 审批', x: 50, y: 8, phase: 0 },
  { id: 'chief', label: 'Chief', role: '拆解与调度', x: 50, y: 29, phase: 1 },
  { id: 'planner', label: 'Planner', role: '只读计划', x: 19, y: 58, phase: 2 },
  { id: 'worker', label: 'Workers × N', role: '隔离构建', x: 50, y: 58, phase: 2 },
  { id: 'reviewer', label: 'Reviewer', role: '独立验收', x: 81, y: 58, phase: 2 },
  { id: 'executor', label: 'PI Executors', role: 'SDK / RPC', x: 50, y: 86, phase: 3 },
]

export const blueprintEdges = [
  ['you', 'chief'],
  ['chief', 'planner'],
  ['chief', 'worker'],
  ['chief', 'reviewer'],
  ['planner', 'worker'],
  ['worker', 'reviewer'],
  ['planner', 'executor'],
  ['worker', 'executor'],
  ['reviewer', 'executor'],
]
