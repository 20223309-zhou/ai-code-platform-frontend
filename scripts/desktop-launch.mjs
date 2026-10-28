#!/usr/bin/env node

/**
 * Electron 启动器。
 *
 * 为什么不能直接 `electron .`：
 * 在 VS Code 集成终端、以及其他 Electron 应用派生的 shell 里，
 * 父进程会注入 `ELECTRON_RUN_AS_NODE=1`。带着它启动，electron 会退化成纯 Node，
 * `require('electron')` 得到 undefined，主进程第一行就报
 *   TypeError: Cannot read properties of undefined (reading 'requestSingleInstanceLock')
 *
 * 这个变量是继承来的，不是用户写错了，所以在这里统一清掉最省事，
 * 也不用逼着每个人去改 shell 配置。
 */

import { spawn } from 'node:child_process'
import electronPath from 'electron'

delete process.env.ELECTRON_RUN_AS_NODE

const child = spawn(electronPath, ['.', ...process.argv.slice(2)], {
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
  console.error('启动 Electron 失败：', error.message)
  process.exit(1)
})
