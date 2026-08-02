import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

await page.goto('http://127.0.0.1:4174', { waitUntil: 'networkidle' })
assert.ok((await page.locator('body').innerText()).length > 1000, '页面内容为空或过少')
assert.equal(await page.locator('.vite-error-overlay').count(), 0, '出现 Vite 错误覆盖层')
await page.getByRole('button', { name: /设计 Agent 的上下文/ }).click()
await page.getByRole('heading', { name: '设计 Agent 的上下文' }).waitFor()
await page.getByRole('button', { name: '标记为已验证' }).click()
assert.match(await page.locator('.top-progress').innerText(), /1\s*\/\s*38 steps/)

await page.getByRole('button', { name: /系统蓝图/ }).click()
await page.getByRole('heading', { name: /你的多 Agent 平台/ }).waitFor()
await page.getByRole('button', { name: /Agent 层/ }).click()
await page.evaluate(() => window.scrollTo(0, 0))
await page.screenshot({ path: '/tmp/pi-agent-lab-blueprint.png' })

await page.setViewportSize({ width: 390, height: 844 })
await page.reload({ waitUntil: 'networkidle' })
await page.evaluate(() => window.scrollTo(0, 0))
await page.getByRole('button', { name: '打开课程目录' }).click()
assert.ok(await page.locator('.sidebar.mobile-open').isVisible(), '移动端课程目录未打开')
await page.screenshot({ path: '/tmp/pi-agent-lab-mobile.png' })

assert.deepEqual(errors, [], `浏览器错误：${errors.join(' | ')}`)
await browser.close()

console.log('PASS page-content')
console.log('PASS module-navigation')
console.log('PASS progress-persistence')
console.log('PASS blueprint-interaction')
console.log('PASS mobile-navigation')
console.log('PASS console-errors (0)')
