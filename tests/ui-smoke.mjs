import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright'

const systemChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(systemChrome) ? { executablePath: systemChrome } : {}),
})
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

await page.goto('http://127.0.0.1:4174', { waitUntil: 'networkidle' })
assert.ok((await page.locator('body').innerText()).length > 1000, '页面内容为空或过少')
assert.equal(await page.locator('.vite-error-overlay').count(), 0, '出现 Vite 错误覆盖层')
await page.getByRole('heading', { name: '先学会怎样学习 Agent' }).waitFor()
await page.getByText('ReAct loop', { exact: true }).waitFor()
await page.getByText('学习主线与 PI 对照', { exact: true }).waitFor()
await page.getByRole('button', { name: /用 ReAct 读懂一次 Agent 循环/ }).click()
await page.getByText(/Plan\/Reason → Action → Observation/).waitFor()
await page.getByRole('button', { name: /设计 Agent 的上下文/ }).click()
await page.getByRole('heading', { name: '设计 Agent 的上下文' }).waitFor()
await page.getByRole('button', { name: '标记为已验证' }).click()
assert.match(await page.locator('.top-progress').innerText(), /1\s*\/\s*134 steps/)

await page.getByRole('button', { name: /用 OMP 建立并行工程闭环/ }).click()
await page.getByRole('heading', { name: '用 OMP 建立并行工程闭环' }).waitFor()
await page.getByText('截图导学', { exact: true }).waitFor()
assert.equal(await page.locator('.visual-guides img').count(), 2, 'OMP 截图导学缺失')
await page.screenshot({ path: '/tmp/pi-agent-lab-omp.png', fullPage: true })
await page.getByRole('button', { name: /用 Herdr 驾驭 PI 与 OMP/ }).click()
await page.getByRole('heading', { name: '用 Herdr 驾驭 PI 与 OMP' }).waitFor()
await page.getByText(/Herdr 负责：终端、布局、detach/).waitFor()
assert.equal(await page.locator('.visual-guides img').count(), 1, 'Herdr 截图导学缺失')
await page.screenshot({ path: '/tmp/pi-agent-lab-herdr.png', fullPage: true })

await page.getByRole('button', { name: /让 Agent 在崩溃后继续工作/ }).click()
await page.getByRole('heading', { name: '让 Agent 在崩溃后继续工作' }).waitFor()
await page.getByText('labs/pi-durable-ops/src/recovery-drill.ts', { exact: true }).waitFor()
await page.getByRole('button', { name: '运行', exact: true }).click()
await page.getByText(/durable storage · checkpoint · idempotency verified/).waitFor()
await page.screenshot({ path: '/tmp/pi-agent-lab-durable.png', fullPage: true })
await page.getByRole('button', { name: /运行可恢复 Task 状态机/ }).click()
await page.getByText(/defineTask、runtime.commit、sleepUntil/).waitFor()

await page.getByRole('button', { name: /组装 PI 的六层能力栈/ }).click()
await page.getByRole('heading', { name: '组装 PI 的六层能力栈' }).waitFor()
await page.getByText('六层状态与数据边界', { exact: true }).waitFor()
await page.getByText(/Todo snapshot/).waitFor()
await page.getByRole('button', { name: /用 context-mode 做证据卸载实验/ }).click()
await page.getByText(/ctx doctor/).waitFor()

await page.getByRole('button', { name: /重建协议与模型事件流/ }).click()
await page.getByRole('heading', { name: '重建协议与模型事件流' }).waitFor()
await page.getByRole('link', { name: /社区教材 · CC BY 4.0/ }).waitFor()
await page.getByText('Checkpoint 00–05：从离线轨迹到 Provider Adapter').waitFor()
await page.evaluate(() => window.scrollTo(0, 0))
await page.screenshot({ path: '/tmp/pi-agent-lab-textbook.png' })

await page.getByRole('button', { name: /概念地图/ }).click()
await page.getByRole('heading', { name: /先建立学习闭环/ }).waitFor()
await page.getByText('Closed-loop eval', { exact: true }).waitFor()
await page.getByRole('tab', { name: /调度控制面/ }).click()
await page.getByText('DAG scheduler', { exact: true }).waitFor()
await page.getByRole('tab', { name: /生态能力层/ }).click()
await page.getByText('Working state', { exact: true }).waitFor()

await page.getByRole('button', { name: /系统蓝图/ }).click()
await page.getByRole('heading', { name: /你的多 Agent 平台/ }).waitFor()
await page.getByRole('tab', { name: /Agent 层/ }).click()
await page.evaluate(() => window.scrollTo(0, 0))
await page.screenshot({ path: '/tmp/pi-agent-lab-blueprint.png' })

await page.setViewportSize({ width: 390, height: 844 })
await page.reload({ waitUntil: 'networkidle' })
await page.evaluate(() => window.scrollTo(0, 0))
await page.getByRole('button', { name: '打开课程目录' }).click()
assert.ok(await page.locator('.sidebar.mobile-open').isVisible(), '移动端课程目录未打开')
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/pi-agent-lab-mobile.png' })

assert.deepEqual(errors, [], `浏览器错误：${errors.join(' | ')}`)
await browser.close()

console.log('PASS page-content')
console.log('PASS ai-learning-roadmap')
console.log('PASS module-navigation')
console.log('PASS progress-persistence')
console.log('PASS textbook-kernel-lab')
console.log('PASS pi-durable-landing-project')
console.log('PASS ecosystem-capability-stack')
console.log('PASS concept-atlas')
console.log('PASS blueprint-interaction')
console.log('PASS mobile-navigation')
console.log('PASS console-errors (0)')
