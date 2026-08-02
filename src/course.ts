export type LabStep = {
  title: string
  detail: string
  command?: string
  expected: string
  check: string
}

export type CourseModule = {
  id: string
  index: string
  phase: '基础' | '扩展' | '编排' | '平台'
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
}

export const modules: CourseModule[] = [
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
        detail: '打开终端。PI 通过 npm 分发，建议 Node.js 20 或更高版本。',
        command: 'node -v && npm -v',
        expected: '两行版本号；Node.js 不低于 v20。',
        check: '能看到 node 与 npm 的版本号',
      },
      {
        title: '安装 PI',
        detail: '使用官方 npm 包；--ignore-scripts 会禁用依赖生命周期脚本，PI 正常安装不需要它们。',
        command: 'npm install -g --ignore-scripts @earendil-works/pi-coding-agent\npi --version',
        expected: '终端输出 PI 的版本号。',
        check: 'pi 命令可执行',
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
        command: 'mkdir -p experiments/sdk-runner && cd experiments/sdk-runner\nnpm init -y\nnpm i @earendil-works/pi-coding-agent',
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
        command: 'git clone --depth 1 https://github.com/earendil-works/pi.git vendor/pi\ncd vendor/pi\nnpm install && npm run build',
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
    source: 'https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent',
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
