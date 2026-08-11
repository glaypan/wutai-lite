'use strict';

/**
 * 生成舞台流程表总控入口页面的 HTML。
 *
 * @param {Object} config - 配置端口 { entryPort, port, clientPort, screenPort }
 * @param {Object} passwordStatus - 各角色是否需要密码
 *   { control, director, assistant, backstage, console, screen }
 * @param {Object} ports - 实际运行时端口（角色独立端口缺失时回退 clientPort）
 * @returns {string} 完整的 HTML 字符串
 */
function buildEntryPortalHtml(config, passwordStatus, ports) {
  var controlPort = ports.port;
  var clientPort = ports.clientPort;
  var directorPort = ports.directorPort || clientPort;
  var assistantPort = ports.assistantPort || clientPort;
  var backstagePort = ports.backstagePort || clientPort;
  var consolePort = ports.consolePort || clientPort;
  var screenPort = ports.screenPort;
  var entryPort = ports.entryPort;
  var subtitlePort = ports.subtitlePort || 0;
  var subtitleEnabled = ports.subtitleEnabled || false;
  // v6.6.0: 方案B 独立操作客户端 —— 字幕控制端 / 提示屏控制端端口
  var subtitleCtrlPort = ports.subtitleCtrlPort || 0;
  var screenCtrlPort = ports.screenCtrlPort || 0;

  // 操作岗位卡片（含新增控制端）
  var operationCards = [
    {
      icon: 'i-control',
      title: '控制端',
      desc: '舞台流程总控制台，管理全部流程节点与设备调度',
      role: 'control',
      port: controlPort,
      path: '/?role=control',
      needsPassword: true,
      placeholder: '默认: admin'
    },
    {
      icon: 'i-director',
      title: '导演端',
      desc: '导演工作台，掌控流程推进与 cue 点触发',
      role: 'director',
      port: directorPort,
      path: '/?role=director',
      needsPassword: !!passwordStatus.director,
      placeholder: '请输入密码'
    },
    {
      icon: 'i-assistant',
      title: '助理端',
      desc: '舞台助理工作台，协助流程管理与状态跟踪',
      role: 'assistant',
      port: assistantPort,
      path: '/?role=assistant',
      needsPassword: !!passwordStatus.assistant,
      placeholder: '请输入密码'
    },
    {
      icon: 'i-backstage',
      title: '幕后端',
      desc: '幕后工作人员视图，实时查看当前流程状态',
      role: 'backstage',
      port: backstagePort,
      path: '/?role=backstage',
      needsPassword: !!passwordStatus.backstage,
      placeholder: '请输入密码'
    },
    {
      icon: 'i-console',
      title: '控台端',
      desc: '控台视角，与助理权限相同',
      role: 'console',
      port: consolePort,
      path: '/?role=console',
      needsPassword: !!passwordStatus.console,
      placeholder: '请输入密码'
    }
  ];

  // v6.6.0: 方案B 字幕控制端卡片（独立端口，需 control 密码登录，进入 ctrlMode=subtitle 专注界面）
  if (subtitleCtrlPort > 0) {
    operationCards.push({
      icon: 'i-control',
      title: '字幕控制端',
      desc: '字幕员专用操作端，专注字幕输入与切换控制',
      role: 'control',
      port: subtitleCtrlPort,
      path: '/?role=control&ctrlMode=subtitle',
      needsPassword: true,
      placeholder: '请输入控制端密码',
      ctrlMode: 'subtitle',
      badge: '操作'
    });
  }
  // v6.6.0: 方案B 提示屏控制端卡片
  if (screenCtrlPort > 0) {
    operationCards.push({
      icon: 'i-display',
      title: '提示屏控制端',
      desc: '提示屏专用操作端，选屏、开关与显示设置集中管理',
      role: 'control',
      port: screenCtrlPort,
      path: '/?role=control&ctrlMode=screen',
      needsPassword: true,
      placeholder: '请输入控制端密码',
      ctrlMode: 'screen',
      badge: '操作'
    });
  }

  // 显示终端卡片
  var displayCards = [
    {
      icon: 'i-prompt',
      title: '提示屏',
      desc: '舞台提示屏，全屏显示当前流程与提示信息',
      role: 'screen',
      port: screenPort,
      path: '/',
      needsPassword: false,
      placeholder: ''
    }
  ];

  // 字幕屏卡片仅在启用且端口有效时显示
  // v6.6.0 修复: role 必须为 screen（服务端 subtitle 端口 validForServer 只接受 loginRole=screen），
  // 通过 subtitleMode=1 参数进入字幕独占模式；data-role 保持 subtitle 仅用于样式/图标
  if (subtitleEnabled && subtitlePort > 0) {
    displayCards.push({
      icon: 'i-prompt',
      title: '字幕屏',
      desc: '独立字幕显示屏，全屏显示字幕内容',
      role: 'screen',
      port: subtitlePort,
      path: '/',
      needsPassword: false,
      placeholder: '',
      subtitleMode: '1'
    });
  }

  function renderCard(card) {
    var passwordHtml = '';
    if (card.needsPassword) {
      passwordHtml =
        '        <div class="card-password">\n' +
        '          <input type="password" class="password-input" placeholder="' + card.placeholder + '">\n' +
        '        </div>\n';
    }
    var badgeHtml = card.badge
      ? '        <span class="card-badge">' + card.badge + '</span>\n'
      : '';
    return (
      '      <div class="card role-card' + (card.badge ? ' is-operator' : ' is-display') + (card.subtitleMode === '1' ? ' is-subtitle-screen' : '') + '" data-role="' + card.role + '" data-port="' + card.port +
      '" data-path="' + card.path + '" data-needs-password="' + card.needsPassword + '" data-ctrl-mode="' + (card.ctrlMode || '') + '" data-subtitle-mode="' + (card.subtitleMode || '') + '">\n' +
      badgeHtml +
      '        <div class="card-icon"><svg aria-hidden="true"><use href="#' + card.icon + '"></use></svg></div>\n' +
      '        <h2 class="card-title">' + card.title + '</h2>\n' +
      '        <p class="card-desc">' + card.desc + '</p>\n' +
      passwordHtml +
      '        <button class="card-btn" type="button">进入</button>\n' +
      '      </div>'
    );
  }

  function renderSection(title, cardsArr, subtitle) {
    if (!cardsArr.length) return '';
    var cardsHtml = cardsArr.map(renderCard).join('\n');
    return (
      '    <section class="portal-section">\n' +
      '      <div class="section-head">\n' +
      '        <h2 class="section-title">' + title + '</h2>\n' +
      (subtitle ? '        <p class="section-sub">' + subtitle + '</p>\n' : '') +
      '      </div>\n' +
      '      <div class="grid">\n' +
      cardsHtml +
      '      </div>\n' +
      '    </section>\n'
    );
  }

  var sectionsHtml =
    renderSection('🛠️ 操作岗位', operationCards, '各岗位工作台与专用操作端（操作端带「操作」标识）') +
    renderSection('🖥️ 显示终端', displayCards, '大屏显示设备，打开后自动全屏展示');

  var html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>舞台流程表 - 总控入口</title>
  <style>
    :root {
      --role-control: #28a9ff;
      --role-director: #a879ff;
      --role-assistant: #3d9bff;
      --role-backstage: #36c98b;
      --role-console: #ff9f43;
      --role-prompt: #5ed9e8;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      background-color: #1a1a2e;
      background-image:
        radial-gradient(circle at 18% 8%, rgba(40, 169, 255, 0.10), transparent 34%),
        radial-gradient(circle at 84% 18%, rgba(168, 121, 255, 0.08), transparent 30%);
      color: #e0e0e0;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      width: 100%;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .main-title {
      font-size: 2.2rem;
      color: #e94560;
      margin-bottom: 10px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .subtitle {
      font-size: 1rem;
      color: #a0a0b0;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    .portal-section { margin-bottom: 8px; }
    .section-head { margin-bottom: 20px; }
    .section-title {
      font-size: 1.15rem;
      color: #e0e0e0;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .section-sub {
      font-size: 0.85rem;
      color: #606080;
      margin-bottom: 0;
    }
    .card-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      font-size: 0.68rem;
      font-weight: 700;
      color: #fff;
      background: var(--accent);
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 1px;
      opacity: 0.9;
    }
    .role-card.is-operator { border-color: rgba(40, 169, 255, 0.35); }
    .role-card.is-display { border-style: dashed; }
    .card {
      --accent: var(--role-control);
      position: relative;
      overflow: hidden;
      background-color: #16213e;
      border: 1px solid #0f3460;
      border-radius: 8px;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .role-card::before {
      content: "";
      position: absolute;
      inset: 0 0 auto;
      height: 3px;
      background: var(--accent);
    }
    .role-card[data-role="control"] { --accent: var(--role-control); }
    .role-card[data-role="director"] { --accent: var(--role-director); }
    .role-card[data-role="assistant"] { --accent: var(--role-assistant); }
    .role-card[data-role="backstage"] { --accent: var(--role-backstage); }
    .role-card[data-role="console"] { --accent: var(--role-console); }
    .role-card[data-role="screen"],
    .role-card[data-role="subtitle"],
    .role-card.is-subtitle-screen { --accent: var(--role-prompt); }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px color-mix(in srgb, var(--accent) 18%, transparent);
      border-color: var(--accent);
    }
    .card-icon {
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      color: var(--accent);
      margin-bottom: 16px;
    }
    .card-icon svg { width: 42px; height: 42px; }
    .card-title {
      font-size: 1.3rem;
      color: #ffffff;
      margin-bottom: 10px;
    }
    .card-desc {
      font-size: 0.9rem;
      color: #a0a0b0;
      line-height: 1.5;
      margin-bottom: 20px;
      min-height: 54px;
    }
    .card-password {
      width: 100%;
      margin-bottom: 20px;
    }
    .password-input {
      width: 100%;
      padding: 10px 14px;
      background-color: #1a1a2e;
      border: 1px solid #0f3460;
      border-radius: 8px;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.25s ease;
    }
    .password-input:focus { border-color: var(--accent); }
    .password-input::placeholder { color: #606080; }
    .card-btn {
      width: 100%;
      padding: 12px 20px;
      background-color: #0f3460;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.25s ease, transform 0.15s ease;
      margin-top: auto;
    }
    .card-btn:hover { background-color: var(--accent); }
    .card-btn:active { transform: scale(0.97); }
    .footer {
      text-align: center;
      padding: 24px 0;
      color: #606080;
      font-size: 0.85rem;
      border-top: 1px solid #0f3460;
    }
    .footer p { margin: 4px 0; }
    .footer .server-host { color: #a0a0b0; }
    @media (max-width: 600px) {
      .container { padding: 24px 16px; }
      .main-title { font-size: 1.6rem; }
      .grid { grid-template-columns: 1fr; gap: 16px; }
      .card { padding: 20px 16px; }
      .card-icon { width: 44px; height: 44px; margin-bottom: 10px; }
      .card-icon svg { width: 36px; height: 36px; }
      .card-title { font-size: 1.1rem; }
      .card-desc { font-size: 0.85rem; min-height: 40px; }
      .footer { font-size: 0.75rem; }
      .footer p { word-break: break-all; }
    }
    @media (max-width: 400px) {
      .main-title { font-size: 1.3rem; }
      .card { padding: 16px 12px; }
    }
  </style>
</head>
<body>
  <svg aria-hidden="true" style="display:none">
    <symbol id="i-control" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5v14M12 5v14M20 5v14M2 9h4M10 15h4M18 11h4"/><circle cx="4" cy="9" r="1.5"/><circle cx="12" cy="15" r="1.5"/><circle cx="20" cy="11" r="1.5"/></symbol>
    <symbol id="i-director" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v6H4zM4 4l3 6M9 4l3 6M14 4l3 6M6 10v10M18 10v10M6 15h12M9 15l-3 5M15 15l3 5"/></symbol>
    <symbol id="i-assistant" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3.5h6M8 9l1.5 1.5L12 8M14 10h2M8 15l1.5 1.5L12 14M14 16h2"/></symbol>
    <symbol id="i-backstage" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18v16H3zM3 4c3 2 4 5 4 8s-1 6-4 8M21 4c-3 2-4 5-4 8s1 6 4 8M8 17h8M9 14h6"/></symbol>
    <symbol id="i-console" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><circle cx="16" cy="10" r="2"/><path d="M6 16h4M14 16h4M8 14v4M16 14v4"/></symbol>
    <symbol id="i-prompt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M7 9h10M7 13h7M9 22h6M12 18v4"/></symbol>
  </svg>
  <div class="container">
    <header class="header">
      <h1 class="main-title">舞台流程表 - 总控入口</h1>
      <p class="subtitle">请选择要进入的工作端</p>
    </header>
    <main>
${sectionsHtml}
    </main>
    <footer class="footer">
      <p>服务器地址：<span class="server-host" id="server-host"></span></p>
      <p>入口端口: ${entryPort} ｜ 控制端口: ${controlPort} ｜ 客户端端口: ${clientPort} ｜ 导演端口: ${directorPort} ｜ 助理端口: ${assistantPort} ｜ 幕后端口: ${backstagePort} ｜ 控台端口: ${consolePort} ｜ 提示屏端口: ${screenPort}${subtitleEnabled ? ' ｜ 字幕屏端口: ' + subtitlePort : ''}</p>
    </footer>
  </div>
  <script>
    (function() {
      var host = window.location.hostname;
      document.getElementById("server-host").textContent = host;

      // 保存入口端口到 localStorage 供其他页面使用
      try { localStorage.setItem("stage-entry-port", String(${entryPort})); } catch(e) {}

      function navigateFromCard(card) {
        var port = card.getAttribute("data-port");
        var path = card.getAttribute("data-path");
        var role = card.getAttribute("data-role");
        var ctrlMode = card.getAttribute("data-ctrl-mode");
        var subtitleMode = card.getAttribute("data-subtitle-mode");
        var input = card.querySelector(".password-input");
        var form = document.createElement("form");
        form.method = "POST";
        // v6.5.1 修复：https（Caddy 8443 反代）场景跳反代路径，http（内网直连）场景跳独立端口
        // v6.6.0: 控制端（subtitleCtrl/screenCtrl）https 场景走独立反代路径 + ctrlMode 隐藏字段
        var proto = window.location.protocol;
        var base;
        if (proto === "https:") {
          var rolePath = { control: 'wutai-ctrl', client: 'wutai-client', screen: 'wutai-screen',
                           director: 'wutai-director', assistant: 'wutai-assistant',
                           backstage: 'wutai-backstage', console: 'wutai-console' }[role] || 'wutai';
          if (ctrlMode === 'subtitle') rolePath = 'wutai-subtitle-ctrl';
          else if (ctrlMode === 'screen') rolePath = 'wutai-screen-ctrl';
          // v6.6.0 修复: 字幕屏（subtitleMode=1）必须走 /wutai-subtitle 反代（18096），
          // 不能走 /wutai-screen（18097）——否则 https 场景下字幕屏会打到提示屏端口
          if (subtitleMode === '1') rolePath = 'wutai-subtitle';
          base = proto + "//" + host + ":8443/" + rolePath;
        } else {
          base = proto + "//" + host + ":" + port;
        }
        form.action = base + "/api/auth/login";
        var roleField = document.createElement("input");
        roleField.type = "hidden";
        roleField.name = "role";
        roleField.value = role;
        form.appendChild(roleField);
        if (ctrlMode) {
          var ctrlField = document.createElement("input");
          ctrlField.type = "hidden";
          ctrlField.name = "ctrlMode";
          ctrlField.value = ctrlMode;
          form.appendChild(ctrlField);
        }
        if (subtitleMode) {
          var subField = document.createElement("input");
          subField.type = "hidden";
          subField.name = "subtitleMode";
          subField.value = subtitleMode;
          form.appendChild(subField);
        }
        if (input) {
          var passwordField = document.createElement("input");
          passwordField.type = "hidden";
          passwordField.name = "password";
          passwordField.value = input.value;
          form.appendChild(passwordField);
        }
        document.body.appendChild(form);
        form.submit();
      }

      var buttons = document.querySelectorAll(".card-btn");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function() {
          navigateFromCard(this.closest(".card"));
        });
      }

      var inputs = document.querySelectorAll(".password-input");
      for (var j = 0; j < inputs.length; j++) {
        inputs[j].addEventListener("keypress", function(e) {
          if (e.key === "Enter" || e.keyCode === 13) {
            e.preventDefault();
            navigateFromCard(this.closest(".card"));
          }
        });
      }
    })();
  </script>
</body>
</html>`;

  return html;
}

module.exports = buildEntryPortalHtml;
