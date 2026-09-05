import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Code2,
  Copy,
  ExternalLink,
  FlaskConical,
  GitBranch,
  Layers3,
  ListChecks,
  Menu,
  Network,
  Play,
  RotateCcw,
  Route,
  ShieldCheck,
  TerminalSquare,
  X,
  Zap,
} from 'lucide-react'
import { blueprintAgents, blueprintEdges, conceptGroups, modules } from './course'

type View = 'lab' | 'concepts' | 'blueprint'
type Progress = Record<string, number[]>

const storageKey = 'pi-agent-lab-progress-v1'

function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '{}')
  } catch {
    return {}
  }
}

function ProgressRing({ value }: { value: number }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  return (
    <div className="progress-ring" aria-label={`总进度 ${value}%`}>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="ring-track" cx="22" cy="22" r={radius} />
        <circle
          className="ring-value"
          cx="22"
          cy="22"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (value / 100) * circumference}
        />
      </svg>
      <span>{value}</span>
    </div>
  )
}

function CopyButton({ value, label = '复制' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button className="quiet-button" onClick={copy} aria-label={`复制${label}`}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? '已复制' : label}
    </button>
  )
}

function App() {
  const [view, setView] = useState<View>('lab')
  const [activeModuleId, setActiveModuleId] = useState(modules[0].id)
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [mobileNav, setMobileNav] = useState(false)
  const [running, setRunning] = useState(false)
  const [terminalLines, setTerminalLines] = useState(2)
  const previewTimers = useRef<number[]>([])

  const moduleIndex = modules.findIndex((module) => module.id === activeModuleId)
  const activeModule = modules[moduleIndex]
  const completed = progress[activeModule.id] ?? []

  const totalSteps = modules.reduce((total, module) => total + module.steps.length, 0)
  const completedSteps = modules.reduce((total, module) => total + (progress[module.id]?.length ?? 0), 0)
  const percent = Math.round((completedSteps / totalSteps) * 100)

  const nextLesson = useMemo(() => {
    for (const module of modules) {
      if ((progress[module.id]?.length ?? 0) < module.steps.length) return module
    }
    return modules.at(-1)!
  }, [progress])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    previewTimers.current.forEach(window.clearTimeout)
    previewTimers.current = []
    setTerminalLines(2)
    setRunning(false)
    return () => {
      previewTimers.current.forEach(window.clearTimeout)
    }
  }, [activeModuleId])

  function chooseModule(id: string) {
    setActiveModuleId(id)
    setActiveStep(0)
    setView('lab')
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleStep(step: number) {
    setProgress((current) => {
      const values = current[activeModule.id] ?? []
      return {
        ...current,
        [activeModule.id]: values.includes(step)
          ? values.filter((value) => value !== step)
          : [...values, step].sort(),
      }
    })
  }

  function runPreview() {
    if (running) return
    previewTimers.current.forEach(window.clearTimeout)
    previewTimers.current = []
    setRunning(true)
    setTerminalLines(0)
    activeModule.terminal.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setTerminalLines(index + 1)
        if (index === activeModule.terminal.length - 1) setRunning(false)
      }, 260 * (index + 1))
      previewTimers.current.push(timer)
    })
  }

  function resetProgress() {
    if (!window.confirm('清空所有实验进度？课程内容不会受影响。')) return
    setProgress({})
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="打开课程目录">
          <Menu size={19} />
        </button>
        <button className="brand" onClick={() => setView('lab')}>
          <span className="brand-mark">π</span>
          <span>PI Agent Lab</span>
          <span className="brand-beta">WORKSHOP</span>
        </button>

        <nav className="topnav" aria-label="主导航">
          <button className={view === 'lab' ? 'active' : ''} onClick={() => setView('lab')}>
            <FlaskConical size={15} /> 实验台
          </button>
          <button className={view === 'concepts' ? 'active' : ''} onClick={() => setView('concepts')}>
            <Layers3 size={15} /> 概念地图
          </button>
          <button className={view === 'blueprint' ? 'active' : ''} onClick={() => setView('blueprint')}>
            <Network size={15} /> 系统蓝图
          </button>
        </nav>

        <div className="top-progress">
          <div>
            <span>总体进度</span>
            <strong>{completedSteps} / {totalSteps} steps</strong>
          </div>
          <ProgressRing value={percent} />
        </div>
      </header>

      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="sidebar-mobile-head">
          <span>课程目录</span>
          <button onClick={() => setMobileNav(false)} aria-label="关闭课程目录"><X size={18} /></button>
        </div>
        <div className="sidebar-title">
          <span>学习路径</span>
          <Route size={15} />
        </div>
        <p className="sidebar-intro">{modules.length} 个递进模块：先建立通用 Agent 学习闭环，再用 PI v0.84.4 与 course-v1 验证，最终抵达可恢复多 Agent 控制面。</p>

        <div className="course-path">
          {modules.map((module, index) => {
            const count = progress[module.id]?.length ?? 0
            const done = count === module.steps.length
            const active = module.id === activeModule.id && view === 'lab'
            return (
              <button
                key={module.id}
                className={`module-link ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                onClick={() => chooseModule(module.id)}
              >
                <span className="path-marker">
                  {done ? <Check size={13} /> : <span>{module.index}</span>}
                </span>
                <span className="module-copy">
                  <small>{module.phase} · {module.duration}</small>
                  <strong>{module.title}</strong>
                  <span>{count}/{module.steps.length} 完成</span>
                </span>
                {index < modules.length - 1 && <span className="path-line" />}
              </button>
            )
          })}
        </div>

        <div className="sidebar-foot">
          <div>
            <Zap size={15} />
            <span>下一站</span>
          </div>
          <button onClick={() => chooseModule(nextLesson.id)}>{nextLesson.index} · {nextLesson.title}</button>
          <button className="reset-link" onClick={resetProgress}><RotateCcw size={13} /> 重置进度</button>
        </div>
      </aside>

      <div className={`mobile-scrim ${mobileNav ? 'visible' : ''}`} onClick={() => setMobileNav(false)} />

      <main className="main-canvas">
        <AnimatePresence mode="wait">
          {view === 'lab' ? (
            <motion.div
              key={activeModule.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24 }}
              className="lesson-layout"
            >
              <section className="lesson-main">
                <div className="lesson-kicker">
                  <span>MODULE {activeModule.index}</span>
                  <i />
                  <span>{activeModule.phase}</span>
                  <span><Clock3 size={13} /> {activeModule.duration}</span>
                </div>
                <h1>{activeModule.title}</h1>
                <p className="lesson-subtitle">{activeModule.subtitle}</p>

                <div className="lesson-facts">
                  <span><strong>{activeModule.version}</strong> 当前基线</span>
                  <span><strong>{activeModule.level}</strong> 难度</span>
                  <span><strong>{activeModule.practice}</strong> 实践类型</span>
                </div>

                <div className="outcome-band">
                  <span className="outcome-icon"><GitBranch size={20} /></span>
                  <div>
                    <small>本模块产出</small>
                    <strong>{activeModule.outcome}</strong>
                  </div>
                </div>

                <div className="module-why">
                  <h2>为什么先学这个</h2>
                  <p>{activeModule.why}</p>
                  <div className="concepts">
                    {activeModule.concepts.map((concept) => <span key={concept}>{concept}</span>)}
                  </div>
                </div>

                <div className="readiness-grid">
                  <div>
                    <span><ListChecks size={14} /> 开始前确认</span>
                    <ul>{activeModule.prerequisites?.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div>
                    <span><Boxes size={14} /> 实验交付物</span>
                    <ul>{activeModule.deliverables?.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div>
                    <span><ShieldCheck size={14} /> 常见误区</span>
                    <ul>{activeModule.pitfalls?.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                </div>

                <div className="steps-head">
                  <div>
                    <span>可复现实验</span>
                    <h2>照着做，看到证据再继续</h2>
                  </div>
                  <strong>{completed.length}/{activeModule.steps.length}</strong>
                </div>

                <div className="steps-list">
                  {activeModule.steps.map((step, index) => {
                    const done = completed.includes(index)
                    const open = activeStep === index
                    return (
                      <div key={step.title} className={`step-row ${open ? 'open' : ''} ${done ? 'done' : ''}`}>
                        <button
                          className="step-summary"
                          onClick={() => setActiveStep(open ? -1 : index)}
                          aria-expanded={open}
                          aria-controls={`${activeModule.id}-step-${index}`}
                        >
                          <span className="step-number">{done ? <Check size={15} /> : index + 1}</span>
                          <span>
                            <small>STEP {String(index + 1).padStart(2, '0')}</small>
                            <strong>{step.title}</strong>
                          </span>
                          <ChevronDown className="step-chevron" size={18} />
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              id={`${activeModule.id}-step-${index}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="step-detail-wrap"
                            >
                              <div className="step-detail">
                                <p>{step.detail}</p>
                                {step.command && (
                                  <div className="command-block">
                                    <div><TerminalSquare size={14} /><span>执行</span><CopyButton value={step.command} label="复制命令" /></div>
                                    <pre>{step.command}</pre>
                                  </div>
                                )}
                                <div className="evidence-grid">
                                  <div><small>应该看到</small><p>{step.expected}</p></div>
                                  <div><small>验收点</small><p>{step.check}</p></div>
                                </div>
                                {step.failure && (
                                  <div className="failure-injection">
                                    <span>FAILURE INJECTION</span>
                                    <p>{step.failure}</p>
                                  </div>
                                )}
                                <button className={`complete-button ${done ? 'done' : ''}`} onClick={() => toggleStep(index)}>
                                  {done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                                  {done ? '已通过验收' : '标记为已验证'}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>

                <div className="lesson-nav">
                  <button
                    disabled={moduleIndex === 0}
                    onClick={() => moduleIndex > 0 && chooseModule(modules[moduleIndex - 1].id)}
                  >
                    <ArrowLeft size={16} /> 上一模块
                  </button>
                  {moduleIndex < modules.length - 1 ? (
                    <button className="primary" onClick={() => chooseModule(modules[moduleIndex + 1].id)}>
                      下一模块 <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button className="primary" onClick={() => setView('blueprint')}>
                      查看系统蓝图 <Network size={16} />
                    </button>
                  )}
                </div>
              </section>

              <aside className="lab-panel">
                <div className="lab-tabs">
                  <span><Code2 size={14} /> LAB ARTIFACT</span>
                  <a href={activeModule.source} target="_blank" rel="noreferrer">
                    {activeModule.sourceLabel ?? '官方来源'} <ExternalLink size={12} />
                  </a>
                </div>
                <div className="code-head">
                  <div><i /><i /><i /></div>
                  <span>{activeModule.codeTitle}</span>
                  <CopyButton value={activeModule.code} />
                </div>
                <pre className="code-window"><code>{activeModule.code}</code></pre>

                <div className="terminal-head">
                  <span><TerminalSquare size={14} /> 结果预演</span>
                  <button onClick={runPreview} disabled={running}>
                    <Play size={13} fill="currentColor" /> {running ? '运行中' : '运行'}
                  </button>
                </div>
                <div className="terminal-window" aria-live="polite">
                  {activeModule.terminal.slice(0, terminalLines).map((line, index) => (
                    <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} key={`${line}-${index}`}>
                      <span>{String(index + 1).padStart(2, '0')}</span>{line}
                    </motion.div>
                  ))}
                  {running && <i className="terminal-cursor" />}
                </div>

                <div className="lab-note">
                  <BookOpen size={16} />
                  <p><strong>先复制，再理解。</strong> 每段代码都服务于当前实验；完成后尝试删掉一行，观察哪条验收先失败。</p>
                </div>
              </aside>
            </motion.div>
          ) : view === 'concepts' ? (
            <ConceptAtlas key="concepts" onStart={() => chooseModule('ai-learning-roadmap')} />
          ) : (
            <Blueprint key="blueprint" onOpenCapstone={() => chooseModule('platform')} />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function ConceptAtlas({ onStart }: { onStart: () => void }) {
  const [activeGroup, setActiveGroup] = useState(0)

  return (
    <motion.section
      className="concept-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="concept-intro">
        <div>
          <span className="eyebrow">AGENT LEARNING ATLAS · PI v0.84.4</span>
          <h1>先建立学习闭环，<br />再组合系统能力。</h1>
        </div>
        <p>从学习方法到生产执行共六层。先掌握可迁移的 Agent 概念，再用 PI 的运行证据逐层验证。</p>
      </div>

      <div className="concept-stage">
      <div className="layer-rail" role="tablist" aria-label="PI 概念层级">
          {conceptGroups.map((group, index) => (
            <button
              key={group.title}
              className={activeGroup === index ? 'active' : ''}
              onClick={() => setActiveGroup(index)}
              role="tab"
              aria-selected={activeGroup === index}
            >
              <span>{group.index}</span>
              <div><strong>{group.title}</strong><small>{group.summary}</small></div>
              <ArrowRight size={15} />
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            className="concept-detail"
            key={activeGroup}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="concept-detail-head">
              <span>LAYER {conceptGroups[activeGroup].index}</span>
              <h2>{conceptGroups[activeGroup].title}</h2>
              <p>{conceptGroups[activeGroup].summary}</p>
            </div>
            <div className="term-list">
              {conceptGroups[activeGroup].items.map(([term, detail], index) => (
                <div key={term}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{term}</strong>
                  <p>{detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="concept-rule">
        <span>核心判断</span>
        <p>先用单 Agent 闭合“决定—行动—观察—验证”；只有独立分支存在真实并行收益时，再让 Scheduler 管理多个运行。</p>
        <button onClick={onStart}>从学习路线开始 <ArrowRight size={16} /></button>
      </div>
    </motion.section>
  )
}

function Blueprint({ onOpenCapstone }: { onOpenCapstone: () => void }) {
  const [phase, setPhase] = useState(3)
  const labels = ['交互层', '控制面', 'Agent 层', '执行层']

  return (
    <motion.section
      className="blueprint-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="blueprint-intro">
        <div>
          <span className="eyebrow">FINAL ARCHITECTURE</span>
          <h1>你的多 Agent 平台，<br />不只是多个聊天窗口。</h1>
        </div>
        <p>PI 负责每个 Agent 的推理与工具循环。你的平台负责拆解、隔离、依赖、质量门禁、持久化和人类决策。</p>
      </div>

      <div className="phase-control" role="tablist" aria-label="架构层级">
        {labels.map((label, index) => (
          <button key={label} className={phase === index ? 'active' : ''} onClick={() => setPhase(index)} role="tab" aria-selected={phase === index}>
            <span>0{index + 1}</span>{label}
          </button>
        ))}
      </div>

      <div className="topology">
        <div className="topology-grid" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {blueprintEdges.map(([from, to]) => {
            const a = blueprintAgents.find((agent) => agent.id === from)!
            const b = blueprintAgents.find((agent) => agent.id === to)!
            const visible = a.phase <= phase && b.phase <= phase
            return (
              <motion.line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y + 3}
                x2={b.x}
                y2={b.y - 3}
                initial={false}
                animate={{ opacity: visible ? 0.65 : 0.07, pathLength: visible ? 1 : 0 }}
                transition={{ duration: 0.45 }}
              />
            )
          })}
        </svg>
        {blueprintAgents.map((agent) => {
          const visible = agent.phase <= phase
          return (
            <motion.div
              className={`agent-node ${agent.id}`}
              key={agent.id}
              initial={false}
              animate={{ opacity: visible ? 1 : 0.12, scale: visible ? 1 : 0.92 }}
              style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
            >
              <span>{agent.id === 'you' ? 'YOU' : agent.id.slice(0, 2).toUpperCase()}</span>
              <div><strong>{agent.label}</strong><small>{agent.role}</small></div>
            </motion.div>
          )
        })}
        <div className="topology-caption">
          <span className="live-dot" /> {labels[phase]} 已接入
          <small>点击上方层级，逐层观察职责边界</small>
        </div>
      </div>

      <div className="principles">
        <div><span>01</span><h3>控制面不写代码</h3><p>Chief 只拆解、路由和追踪。所有变更都由隔离 Worker 完成。</p></div>
        <div><span>02</span><h3>事件是唯一事实</h3><p>UI、通知与恢复都从不可变 Event 日志重放，不猜模型文本。</p></div>
        <div><span>03</span><h3>权限随角色收窄</h3><p>Planner 只读，Worker 可写，Reviewer 独立；每个 run 都有明确 cwd。</p></div>
        <div><span>04</span><h3>人只停在门禁处</h3><p>计划确认、合并批准和高风险命令，才需要把决定交还给你。</p></div>
      </div>

      <div className="build-strip">
        <div>
          <span>CAPSTONE</span>
          <h2>把蓝图变成第一个可运行版本</h2>
          <p>SQLite + PI RPC + Git Worktree + SSE；先在一台机器上跑通，再考虑分布式。</p>
        </div>
        <button onClick={onOpenCapstone}>打开最终实验 <ArrowRight size={16} /></button>
      </div>
    </motion.section>
  )
}

export default App
