#!/usr/bin/env node

/**
 * 图标生成启动器（npm run desktop:icons）。
 *
 * 与 desktop-launch.mjs 同样的理由：终端里可能带着继承来的
 * ELECTRON_RUN_AS_NODE=1，不清掉的话 electron 会退化成纯 Node，
 * electron/make-icons.cjs 里 require('electron') 直接拿到 undefined。
 */

import { spawn } from 'node:child_process'
import electronPath from 'electron'

delete process.env.ELECTRON_RUN_AS_NODE

const child = spawn(electronPath, ['electron/make-icons.cjs'], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})

child.on('error', (error) => {
  console.error('生成图标失败：', error.message)
  process.exit(1)
})
