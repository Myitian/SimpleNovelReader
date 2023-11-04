// ==UserScript==
// @name          SimpleNovelReader
// @namespace     net.myitian.js.SimpleNovelReader
// @version       0.1.1
// @description   简单的笔趣阁类网站小说阅读器
// @source        https://github.com/Myitian/SimpleNovelReader
// @author        Myitian
// @license       MIT
// @match         *://*.xiaoshuohu.com/*/*/*.html
// @match         *://*.bqgpp.com/read/*/*.html
// @match         *://*.52bqg.org/book_*/*.html
// @match         *://*.bqg78.cc/book/*/*.html
// @match         *://*.beqege.com/*/*.html
// @grant         none
// ==/UserScript==

/**
 * @param {Document} doc 
 */
function extractPageData(doc) {
    /**
     * @type {string}
     */
    var title = doc.querySelector("h1,.title,.zhong").innerText;
    /**
     * @type {string}
     */
    var content = doc.querySelector("article,#content,#chaptercontent,#nr").innerHTML.replace("　", "");
    /**
     * @type {string}
     */
    var prev = doc.querySelector("#prev_url,#pb_prev").href;
    /**
     * @type {string}
     */
    var info = doc.querySelector("#info_url,#pb_mulu").href;
    /**
     * @type {?string}
     */
    var next = doc.querySelector("#next_url,#pb_next").href;
    return {
        title: title,
        content: content,
        prev: prev.endsWith(".html") ? prev : "",
        next: next.endsWith(".html") ? next : ""
    }
}
/**
 * @param {{title:string,content:string,prev:?string,next:?string}} data
 */
function loadPageData(data) {
    document.querySelector("#myt-snr-title").innerText = data.title;
    document.querySelector("#myt-snr-content").innerHTML = data.content;
    document.querySelector("#myt-snr-prev").dataset.href = data.prev;
    document.querySelector("#myt-snr-next").dataset.href = data.next;
}

/**
 * @param {string} url 
 */
function loadUrl(url) {
    SimpleNovelReader.querySelector("#myt-snr-content").scrollTop = 0;
    get(url).then(
        xhr => {
            loadPageData(extractPageData(xhr.response));
        }
    )
}

/**
 * GET 请求
 * @param {string} url 请求地址
 * @param {string} responseType 响应类型
 * @param {number} timeout 超时
 * @returns {Promise<XMLHttpRequest>} Promise 对象，其 resolve 和 reject 均传入请求所用的 XMLHttpRequest 对象
 */
function get(url, responseType = "document", timeout = 0) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.timeout = timeout;
        xhr.withCredentials = true;
        xhr.responseType = responseType;
        xhr.send();
        xhr.onload = () => {
            if (xhr.status < 300) {
                resolve(xhr);
            } else {
                reject(xhr);
            }
        }; xhr.ontimeout = () => reject(timeout);
    });
}

function detectHashChange() {
    var snr = SimpleNovelReader.querySelector("#myt-snr-base");
    if (window.location.hash == "#simple-novel-reader") {
        snr.style.top = "0";
    } else {
        snr.style.top = "100%";
    }
}

function toggle() {
    if (window.location.hash == "#simple-novel-reader") {
        hide();
    } else {
        show();
    }
}

function show(url = undefined) {
    window.location.hash = "#simple-novel-reader";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (url) {
        var newUrl = new URL(url);
        newUrl.hash = "#simple-novel-reader";
        history.pushState(null, "", newUrl.toString());
        loadUrl(url);
    }
}

function hide() {
    var newUrl = window.location.origin + window.location.pathname + window.location.search;
    if (newUrl != OriginalUrl) {
        window.location = newUrl;
    } else {
        window.location.hash = "";
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
    }
}

/**
 * 
 * @param {Event} event 
 */
function switchChapter(event) {
    /**
     * @type {HTMLButtonElement}
     */
    var btn = event.target;
    if (btn.dataset.href) {
        show(btn.dataset.href);
    }
}

function main() {
    SimpleNovelReader.innerHTML = `
<div id="myt-snr-base" class="x-color-scheme-auto">
    <header id="myt-snr-header">
        <h1 id="myt-snr-title"></h1>
        <div id="myt-snr-tools">
            <button id="myt-snr-exit" class="x-myt-button">退出阅读模式</button>
            <button id="myt-snr-settings" class="x-myt-button" disabled>样式设置</button>
        </div>
        <!-- WORK IN PROGRESS
        <ul id="myt-snr-setting-items" hidden>
            <li>
                <input id="myt-snr-setting-font-sans-serif" type="radio" name="font-type">
                <label for="myt-snr-setting-font-sans-serif" checked="true">无衬线</label>
                <input id="myt-snr-setting-font-radio-serif" type="radio" name="font-type">
                <label for="myt-snr-setting-font-radio-serif">衬线</label>
            </li>
            <li>
                <span>字号</span>
                <button id="myt-snr-setting-font-size-dec" class="x-myt-button">-</button>
                <span>0</span>
                <button id="myt-snr-setting-font-size-inc" class="x-myt-button">+</button>
            </li>
            <li>
                <span>内容宽度</span>
                <button id="myt-snr-setting-width-dec" class="x-myt-button">-</button>
                <span>0</span>
                <button id="myt-snr-setting-width-inc" class="x-myt-button">+</button>
            </li>
            <li>
                <span>行间距</span>
                <button id="myt-snr-setting-line-space-dec" class="x-myt-button">-</button>
                <span>0</span>
                <button id="myt-snr-setting-line-space-inc" class="x-myt-button">+</button>
            </li>
            <li>
                <button id="myt-snr-setting-color-light" class="x-myt-button x-color-scheme-light">浅色</button>
                <button id="myt-snr-setting-color-dark" class="x-myt-button x-color-scheme-dark">深色</button>
                <button id="myt-snr-setting-color-sepia" class="x-myt-button x-color-scheme-sepia">纸墨</button>
                <button id="myt-snr-setting-color-auto" class="x-myt-button x-color-scheme-auto">自动</button>
                <button id="myt-snr-setting-style-custom" class="x-myt-button x-custom-style"
                    data-style-name="">自定义样式</button>
                <input>
            </li>
        </ul>
        -->
    </header>
    <nav id="myt-snr-nav">
        <button id="myt-snr-prev" class="x-myt-button x-left">上一章</button>
        <button id="myt-snr-info" class="x-myt-button x-middle">章节列表</button>
        <button id="myt-snr-next" class="x-myt-button x-right">下一章</button>
    </nav>
    <article id="myt-snr-content">
    </article>
</div>
<style id="myt-snr-custom-style">
</style>
<style>
    #myt-snr-base {
        box-sizing: border-box;
        position: fixed;
        width: 100%;
        height: 100%;
        top: 100%;
        left: 0;
        overflow: scroll;
        background: var(--x-snr-background-level-0);
    }

    #myt-snr-base * {
        color: var(--x-snr-foreground-level-0);
        font-size: medium;
        font-family: sans-serif;
        line-height: revert;
    }

    #myt-snr-base *::selection {
        background: var(--x-snr-background-selected-text);
        color: var(--x-snr-foreground-selected-text);
    }

    #myt-snr-base a {
        background: var(--x-snr-background-link);
        color: var(--x-snr-foreground-link);
        text-decoration: underline var(--x-snr-foreground-level-0);
    }

    #myt-snr-base a:visited {
        color: var(--x-snr-foreground-visited-link);
    }

    #myt-snr-base a::selection {
        background: var(--x-snr-background-selected-link);
        color: var(--x-snr-foreground-selected-link);
    }

    #myt-snr-base>* {
        padding: 1em;
    }

    #myt-snr-header {
        text-align: center;
        max-width: 40rem;
        margin: auto;
    }

    #myt-snr-nav {
        display: flex;
        position: sticky;
        top: 0;
        border: var(--x-snr-border) solid .1em;
        border-left: none;
        border-right: none;
        padding: 0;
        background: var(--x-snr-background-level-1);
        color: var(--x-snr-foreground-level-1);
    }

    #myt-snr-content {
        max-width: 40rem;
        margin: auto;
    }

    #myt-snr-base h1 {
        margin: 0;
        font-size: revert;
    }

    #myt-snr-base p {
        text-indent: 2em;
        margin: revert;
        padding: revert;
    }

    .x-myt-button {
        border: none;
        background: transparent no-repeat center center;
        padding: .5em 1em;
        border-radius: .3em;
        margin: .5em 1em;
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--x-snr-background-button);
        color: var(--x-snr-foreground-button);
        fill: var(--x-snr-foreground-button);
    }

    .x-myt-button:enabled:hover {
        background: var(--x-snr-background-button-hover);
        color: var(--x-snr-foreground-button-hover);
        fill: var(--x-snr-foreground-button-hover);
    }

    .x-myt-button:enabled:active {
        background: var(--x-snr-background-button-active);
        color: var(--x-snr-foreground-button-active);
        fill: var(--x-snr-foreground-button-active);
    }


    .x-middle {
        margin: auto;
    }

    .x-color-scheme-light {
        --x-snr-background-level-0: #fff;
        --x-snr-background-level-1: #eee;
        --x-snr-background-button: #eee;
        --x-snr-background-button-hover: #ddd;
        --x-snr-background-button-active: #ccc;
        --x-snr-background-selected: rgba(0, 97, 224, 0.3);
        --x-snr-background-selected-text: var(--x-snr-background-selected);
        --x-snr-background-selected-link: var(--x-snr-background-selected);
        --x-snr-background-link: inherit;
        --x-snr-background-visited-link: inherit;
        --x-snr-foreground-level-0: rgb(21, 20, 26);
        --x-snr-foreground-level-1: var(--x-snr-foreground-level-0);
        --x-snr-foreground-button: var(--x-snr-foreground-level-0);
        --x-snr-foreground-button-hover: var(--x-snr-foreground-level-0);
        --x-snr-foreground-button-active: var(--x-snr-foreground-link);
        --x-snr-foreground-selected-text: inherit;
        --x-snr-foreground-selected-link: #333;
        --x-snr-foreground-link: rgb(0, 97, 224);
        --x-snr-foreground-visited-link: #b5007f;
        --x-snr-foreground-disabled: rgba(91, 91, 102, 0.4);
        --x-snr-border: #ccc;
    }

    .x-color-scheme-sepia {
        --x-snr-background-level-0: rgb(244, 236, 216);
        --x-snr-background-level-1: #eee;
        --x-snr-background-button: #eee;
        --x-snr-background-button-hover: #ddd;
        --x-snr-background-button-active: #ccc;
        --x-snr-background-selected: rgba(0, 97, 224, 0.3);
        --x-snr-background-selected-text: var(--x-snr-background-selected);
        --x-snr-background-selected-link: var(--x-snr-background-selected);
        --x-snr-background-link: inherit;
        --x-snr-background-visited-link: inherit;
        --x-snr-foreground-level-0: rgb(91, 70, 54);
        --x-snr-foreground-level-1: var(--x-snr-foreground-level-0);
        --x-snr-foreground-button: var(--x-snr-foreground-level-0);
        --x-snr-foreground-button-hover: var(--x-snr-foreground-level-0);
        --x-snr-foreground-button-active: var(--x-snr-foreground-link);
        --x-snr-foreground-selected-text: inherit;
        --x-snr-foreground-selected-link: #333;
        --x-snr-foreground-link: rgb(0, 97, 224);
        --x-snr-foreground-visited-link: #b5007f;
        --x-snr-foreground-disabled: rgba(91, 70, 54, 0.4);
        --x-snr-border: var(--main-foreground);
    }

    .x-color-scheme-dark {
        --x-snr-background-level-0: rgb(28, 27, 34);
        --x-snr-background-level-1: rgb(28, 27, 34);
        --x-snr-background-button: var(--x-snr-background-level-0);
        --x-snr-background-button-hover: rgb(82, 82, 94);
        --x-snr-background-button-active: rgb(91, 91, 102);
        --x-snr-background-selected: rgba(0, 221, 255, 0.3);
        --x-snr-background-selected-text: var(--x-snr-background-selected);
        --x-snr-background-selected-link: var(--x-snr-background-selected);
        --x-snr-background-link: inherit;
        --x-snr-background-visited-link: inherit;
        --x-snr-foreground-level-0: rgb(251, 251, 254);
        --x-snr-foreground-level-1: var(--x-snr-foreground-level-0);
        --x-snr-foreground-button: var(--x-snr-foreground-level-0);
        --x-snr-foreground-button-hover: var(--x-snr-foreground-level-0);
        --x-snr-foreground-button-active: var(--x-snr-foreground-link);
        --x-snr-foreground-selected-text: inherit;
        --x-snr-foreground-selected-link: #fff;
        --x-snr-foreground-link: rgb(0, 221, 255);
        --x-snr-foreground-visited-link: #e675fd;
        --x-snr-foreground-disabled: rgba(251, 251, 254, 0.4);
        --x-snr-border: #ccc;
    }

    @media (prefers-color-scheme: light) {
        .x-color-scheme-auto {
            --x-snr-background-level-0: #fff;
            --x-snr-background-level-1: #eee;
            --x-snr-background-button: #eee;
            --x-snr-background-button-hover: #ddd;
            --x-snr-background-button-active: #ccc;
            --x-snr-background-selected: rgba(0, 97, 224, 0.3);
            --x-snr-background-selected-text: var(--x-snr-background-selected);
            --x-snr-background-selected-link: var(--x-snr-background-selected);
            --x-snr-background-link: inherit;
            --x-snr-background-visited-link: inherit;
            --x-snr-foreground-level-0: rgb(21, 20, 26);
            --x-snr-foreground-level-1: var(--x-snr-foreground-level-0);
            --x-snr-foreground-button: var(--x-snr-foreground-level-0);
            --x-snr-foreground-button-hover: var(--x-snr-foreground-level-0);
            --x-snr-foreground-button-active: var(--x-snr-foreground-link);
            --x-snr-foreground-selected-text: inherit;
            --x-snr-foreground-selected-link: #333;
            --x-snr-foreground-link: rgb(0, 97, 224);
            --x-snr-foreground-visited-link: #b5007f;
            --x-snr-foreground-disabled: rgba(91, 91, 102, 0.4);
            --x-snr-border: #ccc;
        }
    }

    @media (prefers-color-scheme: dark) {
        .x-color-scheme-auto {
            --x-snr-background-level-0: rgb(28, 27, 34);
            --x-snr-background-level-1: rgb(28, 27, 34);
            --x-snr-background-button: var(--x-snr-background-level-0);
            --x-snr-background-button-hover: rgb(82, 82, 94);
            --x-snr-background-button-active: rgb(91, 91, 102);
            --x-snr-background-selected: rgba(0, 221, 255, 0.3);
            --x-snr-background-selected-text: var(--x-snr-background-selected);
            --x-snr-background-selected-link: var(--x-snr-background-selected);
            --x-snr-background-link: inherit;
            --x-snr-background-visited-link: inherit;
            --x-snr-foreground-level-0: rgb(251, 251, 254);
            --x-snr-foreground-level-1: var(--x-snr-foreground-level-0);
            --x-snr-foreground-button: var(--x-snr-foreground-level-0);
            --x-snr-foreground-button-hover: var(--x-snr-foreground-level-0);
            --x-snr-foreground-button-active: var(--x-snr-foreground-link);
            --x-snr-foreground-selected-text: inherit;
            --x-snr-foreground-selected-link: #fff;
            --x-snr-foreground-link: rgb(0, 221, 255);
            --x-snr-foreground-visited-link: #e675fd;
            --x-snr-foreground-disabled: rgba(251, 251, 254, 0.4);
            --x-snr-border: #ccc;
        }
    }
</style>
`;
    SimpleNovelReader.querySelector("#myt-snr-exit").addEventListener("click", hide);
    SimpleNovelReader.querySelector("#myt-snr-prev").addEventListener("click", switchChapter);
    SimpleNovelReader.querySelector("#myt-snr-next").addEventListener("click", switchChapter);
    /**
     * @type {HTMLDivElement}
     */
    var snr = SimpleNovelReader.querySelector("#myt-snr-base");
    loadUrl(window.location.href);
    if (window.location.hash == "#simple-novel-reader") {
        snr.style.top = "0";
        show();
    }
    window.addEventListener("hashchange", detectHashChange);
    document.body.appendChild(SimpleNovelReader);
}

const SimpleNovelReader = document.createElement("div");
const OriginalUrl = window.location.origin + window.location.pathname + window.location.search;
main();