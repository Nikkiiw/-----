// ==UserScript==
// @name         带鱼屏助手
// @namespace    http://trycatch.xyz/dyp
// @version      0.2
// @description  有些网站对超宽屏支持不好，这个插件可以强制将网页宽度设置成1440居中显示，可以勉强用一下。
// @author       Yang
// @match        https://www.google.com/search?q=*
// @grant        GM_log
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-start
// @downloadURL https://update.greasyfork.org/scripts/395826/%E5%B8%A6%E9%B1%BC%E5%B1%8F%E5%8A%A9%E6%89%8B.user.js
// @updateURL https://update.greasyfork.org/scripts/395826/%E5%B8%A6%E9%B1%BC%E5%B1%8F%E5%8A%A9%E6%89%8B.meta.js
// ==/UserScript==

(function () {
    'use strict';

    const DB_KEY = "HOST_LIST";
    const TARGET_WIDTH = 1440;
    let host = window.location.hostname;

    // 在文档加载早期就应用样式以避免闪烁
    if (is_host_in_db(host)) {
        applyStyles();
    }

    // DOM加载完成后初始化菜单
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMenu);
    } else {
        initMenu();
    }

    function is_host_in_db(host) {
        let host_list = GM_getValue(DB_KEY, []);
        return host_list.indexOf(host) !== -1;
    }

    function add_host(host) {
        if (is_host_in_db(host)) {
            return;
        }
        let host_list = GM_getValue(DB_KEY, []);
        host_list.push(host)
        GM_setValue(DB_KEY, host_list);
    }

    function remove_host(host) {
        if (is_host_in_db(host)) {
            let host_list = GM_getValue(DB_KEY, []);
            let new_list = host_list.filter(item => item != host)
            GM_setValue(DB_KEY, new_list);
        }
    }

    function applyStyles() {
        // 创建样式元素而不是直接修改body样式
        const style = document.createElement('style');
        style.textContent = `
            body {
                width: ${TARGET_WIDTH}px !important;
                margin: 0 auto !important;
                position: relative !important;
                overflow-x: hidden !important;
            }
        `;
        document.documentElement.appendChild(style);
    }

    function removeStyles() {
        // 移除之前添加的样式
        const styles = document.querySelectorAll('style');
        for (let i = 0; i < styles.length; i++) {
            if (styles[i].textContent.includes('width: ' + TARGET_WIDTH + 'px')) {
                styles[i].parentNode.removeChild(styles[i]);
                break;
            }
        }
    }

    function on_do() {
        add_host(host);
        applyStyles();
        window.location.reload();
    }

    function on_undo() {
        remove_host(host);
        removeStyles();
        window.location.reload();
    }

    function initMenu() {
        let do_cmd_id = GM_registerMenuCommand("适配", on_do);
        let undo_cmd_id = GM_registerMenuCommand("取消适配", on_undo);

        // 根据当前状态显示相应的菜单项
        if (is_host_in_db(host)) {
            GM_registerMenuCommand("取消适配", on_undo);
        } else {
            GM_registerMenuCommand("适配", on_do);
        }
    }
})();