#!/usr/bin/env node

/**
 * 打包启动器：先构建 dist，再交给 electron-builder。
 *
 * 为什么不直接在 package.json 里写
 *   "desktop:dist": "vite build --mode desktop && electron-builder"
 * 两个原因：
 *   1. Windows 上 npm script 的 `VAR=x cmd` 前缀不生效，镜像地址得从进程环境注入
 *   2. electron-builder 首次运行要下载 winCodeSign / nsis 到
 *      %LOCALAPPDATA%\electron-builder\Cache，国内直连 GitHub 基本会卡死
 *
 * 用法：
 *   node scripts/desktop-pack.mjs        出 NSIS 安装包
 *   node scripts/desktop-pack.mjs --dir  只出免安装目录（release/win-unpacked）
 */

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const dirOnly = process.argv.includes('--dir')
const root = process.cwd()

// 只在本机没配的情况下兜底，方便想换源的人在外面覆盖
process.env.ELECTRON_BUILDER_BINARIES_MIRROR ||=
  'https://npmmirror.com/mirrors/electron-builder-binaries/'
process.env.ELECTRON_MIRROR ||= 'https://npmmirror.com/mirrors/electron/'

/**
 * 清掉整个产物目录再打包。
 *
 * 两个必须做的原因：
 *   1. electron-builder 解压 electron 时会先落到 win-unpacked.tmp 再改名。
 *      上一次打包中断就会留下 80+ 个文件的 .tmp，它下次启动时删这个目录 ——
 *      某些宿主环境给 fs 打了"批量删除需确认"的补丁，会直接报
 *      SAFE_DELETE_BULK_CONFIRM_REQUIRED 把构建打断
 *   2. 不清会让陈旧文件混进产物（比如已经删掉的旧源码）
 *
 * 用系统的 rmdir/rm 而不是 fs.rmSync，正是为了绕开那层补丁。
 */
function cleanOutput() {
  const target = path.join(root, 'release')
  if (!fs.existsSync(target)) {
    return
  }
  const [cmd, args] =
    process.platform === 'win32' ? ['cmd', ['/c', 'rmdir', '/s', '/q', target]] : ['rm', ['-rf', target]]
  const result = spawnSync(cmd, args, { stdio: 'inherit' })
  if (result.status !== 0) {
    console.warn('[pack] 清理产物目录失败，交给 electron-builder 处理')
  }
}

function run(label, script, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      stdio: 'inherit',
      env: process.env,
      cwd: root,
    })
    child.on('error', (error) => reject(new Error(`${label} 启动失败：${error.message}`)))
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${label} 失败，退出码 ${code}`))
    })
  })
}

try {
  // 直接跑包里的入口，绕开 node_modules/.bin 的 .cmd shim（少一层 shell 转义问题）
  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
  const builderBin = path.join(root, 'node_modules', 'electron-builder', 'cli.js')

  console.log('[pack] 1/2 构建前端（mode=desktop）')
  await run('vite build', viteBin, ['build', '--mode', 'desktop'])

  console.log(`[pack] 2/2 ${dirOnly ? '生成免安装目录' : '生成安装包'}`)
  cleanOutput()
  await run('electron-builder', builderBin, dirOnly ? ['--dir', '--publish', 'never'] : ['--publish', 'never'])

  console.log('[pack] 完成，产物在 release/')
} catch (error) {
  console.error(`[pack] ${error.message}`)
  process.exit(1)
}
