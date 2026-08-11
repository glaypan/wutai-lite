# 舞台流程表 wutai-lite（精简免费版）

> 控制端 + 助理端 + 节目单 + GO/重置，最简单最稳定的舞台流程管理。
> 完整版功能通过解锁码激活（Tally / 字幕屏 / 提示屏 / OSC / Cue 等）。

## 🎯 版本定位

| | wutai-lite（本仓库） | wutai-pro（商业完整版） |
|---|---|---|
| 定位 | 免费公开精简版 | 付费完整版 |
| 角色 | 控制端 + 助理端 | 全部角色 |
| 核心功能 | 节目单、GO/重置、计时 | 节目单、GO/重置、计时 |
| 增强功能 | — | Tally 提示、字幕屏、提示屏、字幕/提示屏控制端、OSC/MIDI、时间轴 Cue、项目中心、模板库 |
| 端口 | 入口 18088 / 控制 18089 / 助理 18093 | 完整 11 端口 |

## 🔓 解锁完整版

1. 启动服务后，控制端打开「设置」弹窗
2. 顶部会显示 **「🔓 精简版 — 解锁码激活完整功能」** 入口
3. 点击「解锁完整版」→ 输入解锁码 → 解锁
4. 解锁成功后自动刷新，全部功能入口出现

> 解锁码随 wutai-pro 商业版提供。解锁状态存在浏览器 localStorage，换浏览器/清缓存需重新解锁。

## 🚀 快速开始

```bash
# 1. 安装 Node.js 18.17+
# 2. 初始化配置
cp config.example.json config.json
cp show.example.json show.json

# 3. 安装依赖 + 启动
npm install
npm start
```

启动后访问：
- 入口页：`http://localhost:18088/`
- 控制端：`http://localhost:18089/`（默认无密码）
- 助理端：`http://localhost:18093/`

## ⚙️ 配置

`config.json` 中可修改：
- 端口（`entryPort` / `port` / `clientPort` / 角色端口）
- 角色密码（`passwordHashes`，留空则免密码）
- **`unlockCode`：完整版解锁码**（修改后重启生效；留空表示未启用解锁功能）

## 📦 平台支持

- **Mac**（Intel / M 芯片）：Node 18.17+ → `npm install && npm start`
- **Windows**：同上
- **安卓**（Termux）：见 `安卓手机安装说明.md`
- **Linux 云服务器**：用 `启动-Linux.sh`（自动下载 Node）

## 📄 文档

- `docs/使用说明与优化建议.md` — 端口配置、端口转发、TR3000 便携方案、全平台说明
- `安卓手机安装说明.md` — 手机当服务器完整教程
- `CHANGELOG.md` — 更新历史

## ⚠️ 注意

- 精简版隐藏了字幕/提示屏/Tally 等入口，但相关代码仍保留（解锁后恢复）
- 服务端会校验解锁码（`/api/unlock`），前端 localStorage 仅作显示开关
- 数据（`config.json` / `show.json`）不会上传，全本地存储
