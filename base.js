// ==UserScript==
// @name          SimpleNovelReader
// @namespace     net.myitian.js.SimpleNovelReader
// @version       0.3
// @description   简单的笔趣阁类网站小说阅读器
// @source        https://github.com/Myitian/SimpleNovelReader
// @author        Myitian
// @license       MIT
// @match         *://*.xiaoshuohu.com/*/*/*.html*
// @match         *://*.bqgpp.com/read/*/*.html*
// @match         *://*.52bqg.org/book_*/*.html*
// @match         *://*.bqg78.cc/book/*/*.html*
// @match         *://*.beqege.com/*/*.html*
// @match         *://*.beqege.cc/*/*.html*
// @match         *://*.biquge66.net/book/*/*.html*
// @match         *://*.wxsc8.com/book/*/*.html*
// @match         *://*.zhenhunxiaoshuo.com/*.html*
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @grant         GM_registerMenuCommand
// ==/UserScript==

/**
 * @param {Document} doc
 */
function extractPageData(doc) {
    /**
     * @type {string}
     */
    var title = (
        doc.querySelector(".bookname>h1") ??
        doc.querySelector(".article-title,.bookname,#nr_title,.title,.zhong,.cont-title")
    )?.innerText;
    /**
     * @type {string}
     */
    var content = (
        doc.querySelector("#cont-body") ??
        doc.querySelector(".article-content,#content,#chaptercontent,#nr")
    )?.innerHTML.replace("　", "");
    /**
     * @type {?string}
     */
    var prev = (
        doc.querySelector("[rel=prev],#prev_url,#pb_prevz,#link-preview") ??
        doc.querySelector(".bottem1>a:nth-child(1),.col-md-6.text-center>a[href]:nth-child(1)")
    )?.href;
    /**
     * @type {?string}
     */
    var info = (
        doc.querySelector("[rel='category tag'],#info_url,#pb_mulu,#link-index") ??
        doc.querySelector(".bottem1>a:nth-child(2),.col-md-6.text-center>a[href]:nth-child(2)")
    )?.href;
    /**
     * @type {?string}
     */
    var next = (
        doc.querySelector("[rel=next],#next_url,#pb_next,#link-next") ??
        doc.querySelector(".bottem1>a:nth-child(3),.col-md-6.text-center>a[href]:nth-child(3)")
    )?.href;
    return {
        pageTitle: doc.title.trim(),
        title: title?.trim() ?? "",
        content: content?.trim() ?? "",
        prev: prev?.includes(".html") ? prev.trim() : "",
        info: info?.trim() ?? "",
        next: next?.includes(".html") ? next.trim() : ""
    }
}
/**
 * @param {{pageTitle:string,title:string,content:string,prev:string,info:string,next:string}} data
 */
function loadPageData(data) {
    document.title = data.pageTitle;
    SimpleNovelReader.querySelector("#myt-snr-title").innerText = data.title;
    SimpleNovelReader.querySelector("#myt-snr-content").innerHTML = data.content;
    var prev = SimpleNovelReader.querySelector("#myt-snr-prev");
    prev.dataset.href = data.prev;
    prev.disabled = !data.prev;
    SimpleNovelReader.querySelector("#myt-snr-info").dataset.href = data.info;
    var next = SimpleNovelReader.querySelector("#myt-snr-next");
    next.dataset.href = data.next;
    next.disabled = !data.next;
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
 * @param {Event} event
 */
function toggleSettingDisplay(event) {
    /**
     * @type {HTMLDivElement}
     */
    var settings = document.querySelector("#myt-snr-setting-items");
    if (settings.toggleAttribute("hidden")) {
        document.querySelector("#myt-snr-settings").innerText = "展开样式设置";
    } else {
        document.querySelector("#myt-snr-settings").innerText = "收起样式设置";
    }
}

/**
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

function updateCustomFontButtonStyle() {
    SimpleNovelReader.querySelector("[for=myt-snr-setting-font-family-custom]").style.fontFamily = GM_getValue("config.font-family.custom", "sans-serif");
}

function updateContentStyle() {
    SimpleNovelReader.querySelector("#myt-snr-content-style").innerHTML = `
#myt-snr-root .x-myt-content-style {
    font-family: ${GM_getValue("config.font-family.name", "sans-serif")};
    font-size: ${GM_getValue("config.font-size", "medium")};
    line-height: ${GM_getValue("config.line-height", "1.5")};
}

#myt-snr-root {
    --width-limit: ${GM_getValue("config.width-limit", "40em")};
}
`;
}

/**
 * @param {boolean} useCustomStyle
 */
function updateCustomStyle(useCustomStyle) {
    if (useCustomStyle) {
        SimpleNovelReader.querySelector("#myt-snr-custom-style").innerHTML = GM_getValue("config.custom-style", "");
    } else {
        SimpleNovelReader.querySelector("#myt-snr-custom-style").innerHTML = "";
    }
}

function updateRadioButtonGroup(name, value) {
    /**
     * @type {HTMLInputElement}
     */
    var radio = SimpleNovelReader.querySelector(`input[name=${name}][data-value=${CSS.escape(value)}]`);
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
}

/**
 * @param {Event} event
 */
function updateRadioButton(event) {
    /**
     * @type {HTMLInputElement}
     */
    var radio = event.target;
    SimpleNovelReader.querySelector(`label[for=${radio.id}]`).toggleAttribute("checked", true);
    for (var r of SimpleNovelReader.querySelectorAll(`input[name=${radio.name}]:not([id=${radio.id}])`)) {
        SimpleNovelReader.querySelector(`label[for=${r.id}]`).toggleAttribute("checked", false);
    }
}

/**
 * @param {Event} event
 */
function updateFontFamilyByRadio(event) {
    /**
     * @type {HTMLInputElement}
     */
    var radio = event.target;
    var custom = SimpleNovelReader.querySelector("#myt-snr-setting-font-family-custom-name").value;
    GM_setValue("config.font-family.custom", custom);
    GM_setValue("config.font-family", radio.dataset.value);
    if (radio.dataset.value == "custom") {
        GM_setValue("config.font-family.name", custom);
    } else {
        GM_setValue("config.font-family.name", radio.dataset.value);
    }
    updateCustomFontButtonStyle();
    updateContentStyle();
}
/**
 * @param {Event} event
 */
function updateFontFamilyByInput(event) {
    /**
     * @type {HTMLInputElement}
     */
    var input = event.target;
    if (GM_getValue("config.font-family", "sans-serif") == "custom") {
        GM_setValue("config.font-family.name", input.value);
        updateContentStyle();
    }
    GM_setValue("config.font-family.custom", input.value);
    updateCustomFontButtonStyle();
}

/**
 * @param {Event} event
 */
function updateColorScheme(event) {
    /**
     * @type {HTMLInputElement}
     */
    var radio = event.target;
    GM_setValue("config.color-scheme", radio.dataset.value);
    SimpleNovelReader.dataset.colorScheme = radio.dataset.value;
}

function deleteData() {
    if (confirm("确认删除储存的样式数据？")) {
        GM_deleteValue("config.font-family");
        GM_deleteValue("config.font-family.name");
        GM_deleteValue("config.font-family.custom");
        GM_deleteValue("config.font-size");
        GM_deleteValue("config.line-height");
        GM_deleteValue("config.width-limit");
        GM_deleteValue("config.custom-style");
        GM_deleteValue("config.color-scheme");
    }
}

function main() {
    SimpleNovelReader.id = "myt-snr-root";
    SimpleNovelReader.className = "x-scroll-container";
    SimpleNovelReader.innerHTML = `
$$$$$replace$$$$$
`;
    GM_registerMenuCommand("切换阅读模式", toggle);
    GM_registerMenuCommand("删除样式数据", deleteData);
    SimpleNovelReader.querySelector("#myt-snr-exit").addEventListener("click", hide);
    SimpleNovelReader.querySelector("#myt-snr-settings").addEventListener("click", toggleSettingDisplay);
    SimpleNovelReader.querySelector("#myt-snr-close-settings").addEventListener("click", toggleSettingDisplay);
    SimpleNovelReader.querySelector("#myt-snr-prev").addEventListener("click", switchChapter);
    SimpleNovelReader.querySelector("#myt-snr-next").addEventListener("click", switchChapter);
    for (var btn of SimpleNovelReader.querySelectorAll(".x-myt-hidden-radio")) {
        btn.addEventListener("change", updateRadioButton);
    }
    for (var btn of SimpleNovelReader.querySelectorAll(".x-myt-snr-setting-font-family")) {
        btn.addEventListener("change", updateFontFamilyByRadio);
    }
    for (var btn of SimpleNovelReader.querySelectorAll(".x-myt-setting-color-scheme")) {
        btn.addEventListener("change", updateColorScheme);
    }
    SimpleNovelReader.querySelector("#myt-snr-setting-font-family-custom-name").value = GM_getValue("config.font-family.custom", "");
    SimpleNovelReader.querySelector("#myt-snr-setting-font-family-custom-name").addEventListener("input", updateFontFamilyByInput);
    updateRadioButtonGroup("font-family", GM_getValue("config.font-family", "sans-serif"));
    updateRadioButtonGroup("color-scheme", GM_getValue("config.color-scheme", "auto"));
    updateCustomFontButtonStyle();
    updateContentStyle();
    updateCustomStyle();
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