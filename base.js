// ==UserScript==
// @name          SimpleNovelReader
// @namespace     net.myitian.js.SimpleNovelReader
// @version       0.5.0.2
// @description   简单的笔趣阁类网站小说阅读器
// @source        https://github.com/Myitian/SimpleNovelReader
// @author        Myitian
// @license       MIT
// @match         *://*.xiaoshuohu.com/*/*/*.html*
// @match         *://*.ibiquge.cc/*/*.html*
// @match         *://*.beqege.com/*/*.html*
// @match         *://*.beqege.cc/*/*.html*
// @match         *://*.biqiuge.net/*_*/*.html*
// @match         *://*.biquge11.cc/read/*/*.html*
// @match         *://*.bqgpp.com/read/*/*.html*
// @match         *://*.biquge66.net/book/*/*.html*
// @match         *://*.52bqg.org/book_*/*.html*
// @match         *://*.bqg78.cc/book/*/*.html*
// @match         *://*.bige3.cc/book/*/*.html*
// @match         *://*.biqg.cc/book/*/*.html*
// @match         *://*.wxsc8.com/book/*/*.html*
// @match         *://*.zhenhunxiaoshuo.com/*.html*
// @match         *://*.xyyuedu.com/writer/*/*/*.html*
// @match         *://*.wxzpyd.com/novel/chapter/*.html*
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @grant         GM_listValues
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
        doc.querySelector("#arcxs_title>h1,.bookname>h1") ??
        doc.querySelector(".article-title,.bookname,#nr_title,.title,.zhong,.cont-title") ??
        doc.querySelector("h1")
    )?.innerText;
    /**
     * @type {string}
     */
    var content = (
        doc.querySelector("#onearcxsbd,#cont-body") ??
        doc.querySelector(".article-content,#content,#chaptercontent,#nr,.article") ??
        doc.querySelector("article")
    )?.innerHTML.replace("　", "");
    /**
     * @type {?string}
     */
    var prev = (
        doc.querySelector("[rel=prev],#prev_url,#pb_prev,#link-preview") ??
        doc.querySelector(".bottem1>a:nth-child(1),.col-md-6.text-center>a[href]:nth-child(1),b>a.prevPage:nth-child(1),td.prev>a,article>ul.pages>li:nth-child(2)>a,.page_chapter>ul>li:nth-child(1)>a")
    )?.href;
    /**
     * @type {?string}
     */
    var info = (
        doc.querySelector("[rel='category tag'],#info_url,#pb_mulu,#link-index") ??
        doc.querySelector(".bottem1>a:nth-child(2),.col-md-6.text-center>a[href]:nth-child(2),a.returnIndex,td.mulu>a,article>ul.pages>li:nth-child(4)>a,.page_chapter>ul>li:nth-child(2)>a")
    )?.href;
    /**
     * @type {?string}
     */
    var next = (
        doc.querySelector("[rel=next],#next_url,#pb_next,#link-next") ??
        doc.querySelector(".bottem1>a:nth-child(3),.col-md-6.text-center>a[href]:nth-child(3),b>a.prevPage:nth-child(2),td.next>a,article>ul.pages>li:nth-child(3)>a,.page_chapter>ul>li:nth-child(3)>a")
    )?.href;
    return {
        pageTitle: doc.title.trim(),
        title: title?.trim() ?? "",
        content: content?.trim() ?? "",
        prev: prev?.includes(".html") ? prev.trim() : "",
        info: info?.trim() ?? "",
        next: next?.includes(".html") ? next.trim() : ""
    };
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
    );
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
        SimpleNovelReader.scrollTop = 0;
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

function toggleSettingDisplay() {
    /**
     * @type {HTMLDivElement}
     */
    var settings = SimpleNovelReader.querySelector("#myt-snr-setting-items");
    if (settings.toggleAttribute("hidden")) {
        SimpleNovelReader.querySelector("#myt-snr-settings").innerText = "展开样式设置";
    } else {
        SimpleNovelReader.querySelector("#myt-snr-settings").innerText = "收起样式设置";
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
    SimpleNovelReader.querySelector("#myt-snr-setting-font-family-custom-name").style.fontFamily = GM_getValue("config.font-family.custom", "sans-serif");
}

function updateContentStyle() {
    var fontSizeStr = FontSizes[GM_getValue("config.font-size", 3)];
    var lineHeightStr = GM_getValue("config.line-height", 1.5).toFixed(1);
    var maxWidthStr = GM_getValue("config.max-width", 40) + "em";
    SimpleNovelReader.querySelector("#myt-snr-setting-font-size-value").innerText = fontSizeStr[1];
    SimpleNovelReader.querySelector("#myt-snr-setting-line-height-value").innerText = lineHeightStr;
    SimpleNovelReader.querySelector("#myt-snr-setting-max-width-value").innerText = maxWidthStr;
    SimpleNovelReader.querySelector("#myt-snr-content-style").innerHTML = `
#myt-snr-root * {
    font-family: ${GM_getValue("config.font-family.name", "sans-serif")};
    font-size: ${fontSizeStr[0]};
    line-height: ${lineHeightStr};
}

#myt-snr-root {
    --x-max-width: ${maxWidthStr};
}
`;
}

/**
 * @param {boolean} useCustomStyle
 */
function updateCustomStyle() {
    if (GM_getValue("config.custom-style.enabled", false)) {
        SimpleNovelReader.querySelector("#myt-snr-custom-style").innerHTML = GM_getValue("config.custom-style", "");
    } else {
        SimpleNovelReader.querySelector("#myt-snr-custom-style").innerHTML = "";
    }
}

/**
 * @param {string} name
 * @param {string} value 
 */
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
 * @param {number} diff 
 */
function updateFontSize(diff) {
    const min = 0;
    const max = FontSizes.length - 1;
    var oldVal = GM_getValue("config.font-size", 3) + diff;
    var newVal = oldVal;
    if (oldVal <= min) {
        newVal = min;
        SimpleNovelReader.querySelector("#myt-snr-setting-font-size-minus").toggleAttribute("disabled", true);
    } else {
        SimpleNovelReader.querySelector("#myt-snr-setting-font-size-minus").toggleAttribute("disabled", false);
    }
    if (oldVal >= max) {
        newVal = max;
        SimpleNovelReader.querySelector("#myt-snr-setting-font-size-plus").toggleAttribute("disabled", true);
    } else {
        SimpleNovelReader.querySelector("#myt-snr-setting-font-size-plus").toggleAttribute("disabled", false);
    }
    GM_setValue("config.font-size", newVal);
    updateContentStyle();
}

/**
 * @param {number} diff 
 */
function updateLineSpace(diff) {
    const min = 0.5;
    const max = 5;
    var oldVal = GM_getValue("config.line-height", 1.5) + diff;
    var newVal = oldVal;
    if (oldVal <= min) {
        newVal = min;
        SimpleNovelReader.querySelector("#myt-snr-setting-line-height-minus").toggleAttribute("disabled", true);
    } else {
        SimpleNovelReader.querySelector("#myt-snr-setting-line-height-minus").toggleAttribute("disabled", false);
    }
    if (oldVal >= max) {
        newVal = max;
        SimpleNovelReader.querySelector("#myt-snr-setting-line-height-plus").toggleAttribute("disabled", true);
    } else {
        SimpleNovelReader.querySelector("#myt-snr-setting-line-height-plus").toggleAttribute("disabled", false);
    }
    GM_setValue("config.line-height", parseFloat(newVal.toFixed(1)));
    updateContentStyle();
}

/**
 * @param {number} diff 
 */
function updateMaxWidth(diff) {
    const min = 5;
    const max = 10000;
    var oldVal = GM_getValue("config.max-width", 40) + diff;
    var newVal = oldVal;
    if (oldVal <= min) {
        newVal = min;
        SimpleNovelReader.querySelector("#myt-snr-setting-max-width-minus").toggleAttribute("disabled", true);
    } else {
        SimpleNovelReader.querySelector("#myt-snr-setting-max-width-minus").toggleAttribute("disabled", false);
    }
    if (oldVal >= max) {
        newVal = max;
        SimpleNovelReader.querySelector("#myt-snr-setting-max-width-plus").toggleAttribute("disabled", true);
    } else {
        SimpleNovelReader.querySelector("#myt-snr-setting-max-width-plus").toggleAttribute("disabled", false);
    }
    GM_setValue("config.max-width", newVal);
    updateContentStyle();
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

/**
 * @param {Event} event
 */
function importCustomStyle(event) {
    /**
     * @type {HTMLInputElement}
     */
    var input = event.target;
    input.files[0].text().then(
        s => {
            SimpleNovelReader.querySelector("#myt-snr-setting-custom-style").value = s;
            GM_setValue("config.custom-style", s);
        }
    );
}

function applyCustomStyle() {
    GM_setValue("config.custom-style", SimpleNovelReader.querySelector("#myt-snr-setting-custom-style").value);
    GM_setValue("config.custom-style.enabled", true);
    updateCustomStyle();
}

function disableCustomStyle() {
    GM_setValue("config.custom-style.enabled", false);
    updateCustomStyle();
}

function deleteData() {
    if (confirm("确认删除储存的样式数据？")) {
        GM_deleteValue("config.font-family");
        GM_deleteValue("config.font-family.name");
        GM_deleteValue("config.font-family.custom");
        GM_deleteValue("config.font-size");
        GM_deleteValue("config.line-height");
        GM_deleteValue("config.max-width");
        GM_deleteValue("config.color-scheme");
        GM_deleteValue("config.custom-style");
        GM_deleteValue("config.custom-style.enabled");
    }
}

function debug_DeleteValue(key) {
    GM_deleteValue(key);
}

function debug_ListValues() {
    const keys = GM_listValues();
    for (var key of keys) {
        console.log(`${key}\n${GM_getValue(key)}`);
    }
}

function main() {
    SimpleNovelReader.id = "myt-snr-root";
    SimpleNovelReader.className = "x-scroll-container";
    SimpleNovelReader.innerHTML = `
$$$$$replace$$$$$
`;
    unsafeWindow.SNRDebug_DeleteValue = debug_DeleteValue;
    unsafeWindow.SNRDebug_ListValues = debug_ListValues;
    GM_registerMenuCommand("切换阅读模式", toggle);
    GM_registerMenuCommand("删除样式数据", deleteData);
    SimpleNovelReader.querySelector("#myt-snr-exit").addEventListener("click", hide);
    SimpleNovelReader.querySelector("#myt-snr-settings").addEventListener("click", toggleSettingDisplay);
    SimpleNovelReader.querySelector("#myt-snr-close-settings").addEventListener("click", toggleSettingDisplay);
    SimpleNovelReader.querySelector("#myt-snr-prev").addEventListener("click", switchChapter);
    SimpleNovelReader.querySelector("#myt-snr-info").addEventListener("click", () => {
        var e = SimpleNovelReader.querySelector("#myt-snr-info");
        if (e?.dataset.href) {
            window.location = e.dataset.href;
        }
    });
    SimpleNovelReader.querySelector("#myt-snr-next").addEventListener("click", switchChapter);

    SimpleNovelReader.querySelector("#myt-snr-setting-font-size-minus").addEventListener("click", () => updateFontSize(-1));
    SimpleNovelReader.querySelector("#myt-snr-setting-font-size-plus").addEventListener("click", () => updateFontSize(1));
    SimpleNovelReader.querySelector("#myt-snr-setting-line-height-minus").addEventListener("click", () => updateLineSpace(-0.1));
    SimpleNovelReader.querySelector("#myt-snr-setting-line-height-plus").addEventListener("click", () => updateLineSpace(0.1));
    SimpleNovelReader.querySelector("#myt-snr-setting-max-width-minus").addEventListener("click", () => updateMaxWidth(-1));
    SimpleNovelReader.querySelector("#myt-snr-setting-max-width-plus").addEventListener("click", () => updateMaxWidth(1));

    SimpleNovelReader.querySelector("#myt-snr-setting-custom-style-import").addEventListener("change", importCustomStyle);
    SimpleNovelReader.querySelector("#myt-snr-setting-custom-style-apply").addEventListener("click", applyCustomStyle);
    SimpleNovelReader.querySelector("#myt-snr-setting-custom-style-disable").addEventListener("click", disableCustomStyle);

    var btn;
    for (btn of SimpleNovelReader.querySelectorAll(".x-myt-hidden-radio")) {
        btn.addEventListener("change", updateRadioButton);
    }
    for (btn of SimpleNovelReader.querySelectorAll(".x-myt-snr-setting-font-family")) {
        btn.addEventListener("change", updateFontFamilyByRadio);
    }
    for (btn of SimpleNovelReader.querySelectorAll(".x-myt-setting-color-scheme")) {
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
];
const SimpleNovelReader = document.createElement("div");
const OriginalUrl = window.location.origin + window.location.pathname + window.location.search;
main();