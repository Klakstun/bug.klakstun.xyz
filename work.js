/* work.js — 动态站点子页面（bugs.）工作台脚本
 * 假设：由父站路由渲染，可能挂在 /bugs/ 或 /tools/bugs/ 等子路径下。
 * 原则：不污染全局、不依赖根路径、不和父站脚本抢事件。
 */
(function () {
  'use strict';

  /* 作用域限定在本子页面容器内，避免影响父站其他区域 */
  const root = document.getElementById('bugs-workbench') || document;

  const terminal = root.querySelector('#terminal');

  function pad(n) { return String(n).padStart(2, '0'); }

  function log(msg, type) {
    if (!terminal) return;
    const now = new Date();
    const line = document.createElement('div');
    line.className = 'terminal__line';

    const time = document.createElement('span');
    time.className = 'terminal__time';
    time.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

    const text = document.createElement('span');
    text.className = 'terminal__' + (type || 'sys');
    text.textContent = msg;

    line.appendChild(time);
    line.appendChild(text);
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;

    while (terminal.children.length > 80) terminal.removeChild(terminal.firstChild);
  }

  /* 快捷入口：子页面里链接可能是相对路径，保留原 href 不改写 */
  root.querySelectorAll('.quick').forEach(function (link) {
    link.addEventListener('click', function () {
      const label = link.querySelector('.quick__label');
      const name = label ? label.textContent.trim() : link.getAttribute('href');
      log('打开快捷入口：' + name, 'sys');
    });
  });

  /* 内嵌表单：动态页里 src 常由后端模板注入，这里只监听加载状态 */
  const embedFrame = root.querySelector('.embed-frame');
  if (embedFrame) {
    embedFrame.addEventListener('load', function () {
      log('提交表单已加载', 'ok');
    });
    const src = embedFrame.getAttribute('src');
    if (!src || src === 'about:blank' || src === '') {
      log('提示：提交表单地址尚未由后端注入', 'warn');
    }
  }

  /* 表格状态提示 */
  root.querySelectorAll('.bug-table .chip').forEach(function (chip) {
    if (chip.classList.contains('chip--warn')) {
      chip.setAttribute('title', '该漏洞仍在处理中，提交前请先确认是否重复');
    } else if (chip.classList.contains('chip--ok')) {
      chip.setAttribute('title', '该漏洞已修复，无需重复提交');
    }
  });

  /* 子页面卸载时清理（SPA 路由切换场景） */
  function cleanup() {
    if (terminal) terminal.innerHTML = '';
  }
  window.addEventListener('pagehide', cleanup, { once: true });

  log('工作台就绪 · ' + location.pathname, 'sys');
})();
