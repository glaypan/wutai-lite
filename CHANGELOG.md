# wutai 舞台流程表 wutai-lite 变更记录
## 版本：1.5.0（2026-08-20）控制端修复
- 主控锁+runbook 横幅并入顶部状态栏居中固定（不再遮挡标题/按钮；ctrl-mode 下主控锁随横幅、runbook 隐藏）
- ctrl-mode 专注界面隐藏残留「返回执行台」按钮
- 修复提示屏控制端「无法读取提示屏链接」（server-info links 放行 client-screenCtrl）
- 修复登录后 ctrlMode 参数丢失（登录跳转保留 ctrlMode）
- 入口页补「🖥️ 显示终端→提示屏」卡片（此前入口只 5 张工作端卡）
- 修复 ctrl-mode 下控制端 header 残留显示（CSS 选择器 header.app-header→header.header）
- 入口页图标 i-display 未定义修复（统一改 i-prompt）

## 版本：1.4.0（2026-08-20）runbook 流程编排
- 节目级 runbook：进入节目时按 delaySec 绝对秒数排队执行动作序列（lite 白名单裁剪为 screen_mode/clear 2 动作 + autoAdvance，无字幕/无 Tally 基础设施）
- 服务端唯一 runbookTimer + programRunId 生命周期管理（切节目/手动接管取消旧 run，runId 幂等防残留）
- autoAdvance 自动推进：唯一 timer + 手动关键操作优先取消 + 熔断（min 5s + 连续自动推进链 ≤5 暂停告警）
- 编辑面板「📋 runbook 流程编排」配置区（仅 control）+ 控制端/导演端 runbook banner（执行中闪烁）
- 白名单规范化并入 mergeState（双端同构，静态校验即规范化，老数据零迁移）；审计 runbook_executed / runbook_state_changed 广播

## 版本：1.3.0（2026-08-20）统一输出面
- 统一输出面（output surfaces）：提示屏/字幕屏/叠加层同一状态模型，服务端 buildOutputs 派生统一快照（screen/subtitle/overlay）
- full_state 带 outputs 快照；新增 outputs_changed 广播（叠加层变化即时同步）
- 新增 overlay_update（仅 control）：控制端/runbook 可手动设置叠加层（字幕/媒体）
- cue 字幕叠加层服务端化：cue 触发自动同步叠加层 + 按 durationMs 自动清空
- 前端统一渲染入口 renderOutputs + 叠加层渲染 renderOverlay

## 版本：1.2.0（2026-08-20）主控锁
- 主控锁（strict 默认）：多控制端协同，GO/切节目/字幕跳句/清空/提示屏设置须先持锁；服务端权威拦截；持锁者掉线自动释放；loose 模式兼容现状
- 主控锁条（控制端右上角）：获取/释放/接管 + strict/loose 一键切换

## 版本：1.1.7（2026-08-20）
### ✨ 新增：提示屏控制端 P1 优化（与正式版 7.2.1 同步，lite 无字幕端）
- ✨ 新增：屏幕状态总览（提示屏在线数 + 模式 + 连接态，WS 断开自动禁操作+红条提示）
- 🐛 修复：提示屏控制端 modal-box 顶部 padding 适配状态条（40px→64px）
## 版本：1.1.6（2026-08-20）
### 🐛 修复 + ✨ 增强：提示屏控制端 P0 优化（与正式版 7.2.0 同步，lite 无字幕端）
- 🐛 修复：ctrl-mode 下弹窗 ✕ 关闭按钮失效（CSS 特异性提权）
- 🐛 修复：「← 返回入口页」跳错（动态取 entryPort 回 18088）
- ✨ 新增：提示屏设置生效模型二分（字号/显示项草稿态 + 「有未应用修改」提示）
# wutai 舞台流程表 wutai-lite 变更记录

## 版本：1.1.5（2026-08-20）

### 🎨 提示屏控制端弹窗三区升级（与正式版 7.1.2 同步）
- **modal-screen-setting 升级 console-modal 三区**：header 固定 / 内容独立滚动 / 「关闭·保存」按钮固定底部
- 验证：桌面/手机端三区 rect 正确，提示屏控制端正常

## 版本：1.1.4（2026-08-20）

### 🎯 本节目任务（与正式版同步）
- **设置模式「编辑节目」弹窗新增「本节目任务」区**：每行 = 角色下拉 + 任务内容 + 删除，底部「＋ 添加任务」；保存时收集进 timeline.cues（保留原 Cue 身份/时间/多角色）
- **演出模式节目详情卡可设置本节目任务**：详情弹窗新增任务列表 + 添加/删除（角色下拉 + 内容输入，即时保存）
- **演出模式节目卡显示本节目任务**：当前节目卡展示本节目任务（角色中文 + 内容，按时间排序；无任务不显示）
- 新增 `editTasks` 权限（控制/导演/助理/控台可编辑；幕后只读）
- 角色显示统一走中文映射（自定义角色名 → 内置中文标签 → 原始 id）

### 🐛 修复
- **角色端口撞生产 bug**：`normalizeConfig` 漏了 rolePorts 字段 → 精简版角色端口误用生产 18092-18095 冲突回退 → 已支持 rolePorts 配置，精简版独立使用 **18392-18395 / 18399**

## 版本：1.1.1（2026-08-20）

### 🐛 修复（与正式版 v7.1.0 同步）
- 手机端左下角「节目列表」按钮弹出空白页（CSS 特异性坑，抽屉 transform 无法覆盖）→ 高特异性 + `!important`
- 控制端点击「控」徽标跳客户端端口(18390)而非入口门户 → 改为跳入口门户 entryPort(18388)，可重新选角色


### 👥 角色管理（从正式版移植）
- 角色管理弹窗：添加负责人/岗位、角色列表、角色工作时间总览、轮到我（CueApp 式）
- 前端 mergeState 补齐 rolePlans（修复 rolePlans 恒 undefined 导致的角色管理/轨道缺失）
- 桌面端角色管理入口仅控制端可见；手机底导「角色」入口同步权限

### 📋 电子台本（从正式版移植）
- 轻量电子台本视图：导入 + 列表展示 + 角色筛选（v6.9.9-P5）
- 桌面端台本入口仅控制端可见

### 🔓 解锁服务端校验（v6.9.x-FIX-L4）
- 解锁从「前端 localStorage 门闩」升级为「服务端校验」：解锁成功生成服务端 token + HttpOnly cookie（30 天），懂行的直接改 localStorage 也过不了服务端
- 项目中心/模板库等完整功能未解锁时返回 403 unlock_required
- 解锁状态落盘 `unlock-state.json`；`unlockCode` 留空 = 未启用解锁，全部功能默认可用（维持现状）

### 🛡️ 稳定性修复
- **入口端口注入**（v6.9.x-FIX-L3）：渲染时注入入口端口，提示屏断线「返回入口」导航可用
- **GO 按钮改回 onclick 直发**（v6.9.9-FIX）：attachLongPress 100ms 长按会吞掉快速点击
- **syncLocalCueRunKey/maybeRunLocalAutomaticCues 补回**：精简删模块时误删定义致渲染链 ReferenceError（点了没反应刷新才好），已从正式版移植
- **loadScript 重试死循环修复**：retries 参数归一化 + settled 幂等回调 + 失败节点移除
- **set_current 上界校验**：非法 index 拒绝执行
- **节目列表点击选中绿框跟随**：切 class 不重渲染，切模式/切节目重置选中索引

## 版本：1.0.1（2026-08-11）

### 🔓 解锁 UI 完成
- 解锁弹窗 + 设置入口 + localStorage 记录解锁状态
- normalizeConfig 保留 unlockCode 字段

## 版本：1.0.0（2026-08-11）

### 🎉 wutai-lite 精简免费版首发
- 控制端 + 助理端 + 节目单 + GO/重置，最简单最稳定的舞台流程管理
- 验证码解锁完整功能 API（/api/unlock）+ LITE 模式隐藏字幕/提示屏/Tally 入口
- 完整版功能通过解锁码激活（Tally / 字幕屏 / 提示屏 / OSC / Cue 等）

---

# wutai 舞台流程表 v6.6.0 更新说明

## 版本：6.6.0（2026-08-11）

### 🎛️ 方案B：独立操作客户端（字幕控制端 / 提示屏控制端）

1. **新增「字幕控制端」端口 18098**：字幕员专用操作端，专注字幕输入与切换控制，进入后自动全屏字幕管理界面
2. **新增「提示屏控制端」端口 18099**：提示屏专用操作端，选屏、开关与显示设置集中管理
3. **入口页按「操作岗位 / 显示终端」两组分区**：操作岗位（控制/导演/助理/幕后/控台/字幕控制端/提示屏控制端）带「操作」徽标，显示终端（提示屏/字幕屏）虚线边框区分
4. 控制端采用**专注模式**：打开后自动隐藏主界面、全屏显示对应操作面板，顶部横幅可返回入口页
5. 凭据复用控制端密码，不新增角色；https 反代路径 `/wutai-subtitle-ctrl`、`/wutai-screen-ctrl`

### 🔧 操作体验修复

6. **重置全部节目**：取消「确认后还需长按 700ms」两步操作，改为确认弹窗后直接执行（与手机端一致）
7. **GO 按钮**：长按触发阈值 500ms → 100ms，响应更快
8. **入口页字幕屏卡片修复**：字幕屏认证角色统一为 screen（服务端契约），通过 subtitleMode=1 区分字幕/提示屏模式，修复 https 反代错走提示屏端口的问题

---

# wutai 舞台流程表 v6.5.4 更新说明

## 版本：6.5.4（2026-08-11）

### 🔌 端口统一（180xx 全家桶）

1. **提示屏端口 18091 → 18097**：与其他角色端口统一到 180xx 段，18091 废弃腾空
2. **字幕屏端口 3004 → 18096**：与其他角色端口统一到 180xx 段，3004 废弃
3. **端口布局**：18088 入口 / 18089 控制 / 18090 客户端 / 18092 导演 / 18093 助理 / 18094 幕后 / 18095 控台 / 18096 字幕屏 / 18097 提示屏
4. **所有端口均可自由修改**：入口/控制/客户端/提示屏/字幕屏 5 个端口在 `config.json` 直接改；导演/助理/幕后/控台 4 个角色端口在 `server-standalone.js` 的 `ROLE_PORTS` 改（改完重启服务生效）

### 🌐 HTTP 免证书访问（Caddy 新增）

5. **门户 HTTP 端口 13140**：`http://<IP>:13140` 免证书访问 My Portal（原 13142 仅 HTTPS）
6. **wutai HTTP 端口 8080**：`http://<IP>:8080/wutai/` 免证书访问 wutai 入口页（原 8443 仅 HTTPS）
7. 内网 Windows/安卓设备直连 IP 即可，无需改 hosts、无需信任证书；外网建议仍走 HTTPS（8443/13142）

---

# wutai 舞台流程表 v6.5.3 更新说明

## 版本：6.5.3（2026-08-11）

### 🖥️ 弹窗与布局修复（iOS Safari）

1. **字幕/提示屏/OSC 弹窗移出滚动容器**：modal-subtitle、modal-screen-setting、modal-osc-midi 从 `.panel-stage`（overflow-y:auto）移到 `</main>` 后成为 body 直接子元素——iOS Safari 上 position:fixed 在滚动祖先内失效的根因修复，弹窗关闭按钮恢复可见可点
2. **字幕独占屏视图移出 main-layout**：subtitle-exclusive-view 从 panel-stage 移到 body 级，避免 main-layout display:none 祖先隐藏导致字幕屏空白

### 🎛️ 执行台布局（手机端）

3. **exec-bar 信息行移到舞台卡片上方**：从 nav-controls 移到 performance-view 顶部，底部只留 ◀上一个/GO/下一个▶ 3 按钮 flex 占满整条横条（GO 1.4 倍宽更醒目）
4. **exec-bar 全局隐藏规则**：避免桌面端误显示；压缩 padding/字号使信息行更紧凑
5. **📋 节目列表悬浮按钮挪位**：从右下（遮挡"下一个"按钮）移到左下并抬高，完全浮在底栏上方

### 📡 Tally 提示升级

6. **雷达环扩散更明显**：tallyRadarPing 扩散半径 8px→12px、周期 1.4s→1s
7. **桌面端节目卡铃铛也加雷达环**：`.prog-tally-btn.is-active` 脉冲+雷达环；keyframes 提升为全局（手机/桌面共用）
8. **拖动性能优化（RAF + transform）**：makeTallyDraggable 改为 requestAnimationFrame 节流 + transform:translate3d 移动 + 尺寸缓存（不再每帧读 offsetWidth 触发 reflow），横屏拖动更流畅；释放时 transform 落定 left/top 防偏移累积
9. **iOS 兼容性修复**：WebKitCSSMatrix 降级 DOMMatrix + 正则解析；passive 事件选项特性检测（旧 Safari 不支持）

### 📱 手机横屏适配

10. **横屏快捷入口条**：横屏（高度≤600）时 header 下方显示一行 icon 按钮——计时/Cue、字幕、提示屏、项目中心；权限与 renderAll 同步（控制端才显示计时/项目），竖屏自动隐藏

### 🎨 全局设置弹窗

11. **底部按钮分组**：取消+恢复默认（次级）一行、3 个保存按钮（主级）一行，手机端两行铺满消灭空位；桌面端保持右对齐

### 📺 字幕屏独立端口

12. **字幕屏 3004 独立端口**：config 启用 subtitlePort=3004 + subtitleEnabled；buildAccessLinks 生成 links.subtitle（role=screen&subtitleMode=1 → 字幕独占视图）；控制端提示屏设置弹窗新增"字幕屏独立链接"区块（复制/打开窗口/选择屏幕并打开，独立屏幕下拉框）
13. **Caddy 反代 /wutai-subtitle**：外网 https://你的域名:8443/wutai-subtitle/ 访问字幕屏

---
