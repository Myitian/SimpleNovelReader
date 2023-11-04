// ==UserScript==
// @name          SimpleNovelReader
// @namespace     net.myitian.js.SimpleNovelReader
// @version       0.2
// @description   简单的笔趣阁类网站小说阅读器
// @source        https://github.com/Myitian/SimpleNovelReader
// @author        Myitian
// @license       MIT
// @match         *://*.xiaoshuohu.com/*/*/*.html
// @match         *://*.bqgpp.com/read/*/*.html
// @match         *://*.52bqg.org/book_*/*.html
// @match         *://*.bqg78.cc/book/*/*.html
// @match         *://*.beqege.com/*/*.html
// @grant         GM_registerMenuCommand
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
    var prev = (doc.querySelector("#prev_url,#pb_prev") ?? doc.querySelector(".bottem1>a:nth-child(1)")).href;
    /**
     * @type {string}
     */
    var info = (doc.querySelector("#info_url,#pb_mulu") ?? doc.querySelector(".bottem1>a:nth-child(2)")).href;
    /**
     * @type {string}
     */
    var next = (doc.querySelector("#next_url,#pb_next") ?? doc.querySelector(".bottem1>a:nth-child(3)")).href;
    return {
        pageTitle: doc.title,
        title: title,
        content: content,
        prev: prev.endsWith(".html") ? prev : "",
        info: info,
        next: next.endsWith(".html") ? next : ""
    }
}
/**
 * @param {{pageTitle:string,title:string,content:string,prev:string,info:string,next:string}} data
 */
function loadPageData(data) {
    document.title = data.pageTitle;
    SimpleNovelReader.querySelector("#myt-snr-title").innerText = data.title;
    SimpleNovelReader.querySelector("#myt-snr-content").innerHTML = data.content;
    SimpleNovelReader.querySelector("#myt-snr-prev").dataset.href = data.prev;
    SimpleNovelReader.querySelector("#myt-snr-info").dataset.href = data.info;
    SimpleNovelReader.querySelector("#myt-snr-next").dataset.href = data.next;
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
    if (window.location.hash == "#simple-novel-reader") {
        SimpleNovelReader.style.top = "0";
    } else {
        SimpleNovelReader.style.top = "200%";
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
        SimpleNovelReader.scrollTop = 0
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
    SimpleNovelReader.id = "myt-snr-root";
    SimpleNovelReader.dataset.colorScheme = "auto"
    SimpleNovelReader.innerHTML = `
$$$$$replace$$$$$
`;
    GM_registerMenuCommand("切换阅读模式", toggle);
    SimpleNovelReader.querySelector("#myt-snr-exit").addEventListener("click", hide);
    SimpleNovelReader.querySelector("#myt-snr-prev").addEventListener("click", switchChapter);
    SimpleNovelReader.querySelector("#myt-snr-next").addEventListener("click", switchChapter);
    loadUrl(window.location.href);
    if (window.location.hash == "#simple-novel-reader") {
        SimpleNovelReader.style.top = "0";
        show();
    }
    window.addEventListener("hashchange", detectHashChange);
    document.body.appendChild(SimpleNovelReader);
}

const FontSizes = [
    ["xx-small", "极小"],
    ["x-small", "小"],
    ["small", "较小"],
    ["medium", "中"],
    ["large", "较大"],
    ["x-large", "大"],
    ["xx-large", "极大"]
]
const SimpleNovelReader = document.createElement("div");
const OriginalUrl = window.location.origin + window.location.pathname + window.location.search;
main();