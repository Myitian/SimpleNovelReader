// ==UserScript==
// @name          SimpleNovelReader
// @namespace     net.myitian.js.SimpleNovelReader
// @version       0.7.3
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
// @match         *://*.qe19.cc/read/*/*.html
// @match         *://*.biquge66.net/book/*/*.html*
// @match         *://*.52bqg.org/book_*/*.html*
// @match         *://*.bqg78.cc/book/*/*.html*
// @match         *://*.bige3.cc/book/*/*.html*
// @match         *://*.biqg.cc/book/*/*.html*
// @match         *://*.wxsc8.com/book/*/*.html*
// @match         *://*.5scw.com/book_*/*.html*
// @match         *://*.zhenhunxiaoshuo.com/*.html*
// @match         *://*.xyyuedu.com/writer/*/*/*.html*
// @match         *://*.wxzpyd.com/novel/chapter/*.html*
// @match         *://*.e365xs.com/*/read_*.html*
// @match         *://*.xbanxia.com/books/*/*.html
// @match         *://*.faloo.com/*.html
// @match         *://funs.me/text/*/*.html
// @match         *://*.trxs.cc/tongren/*/*.html
// @match         *://trxs.cc/tongren/*/*.html
// @match         *://*.hjwzw.com/Book/Read/*,*
// @match         *://www.69shuba.pro/txt/*/*
// @match         *://bh3.mihoyo.com/news/*
// @match         *://ys.mihoyo.com/main/news/detail/*
// @match         *://sr.mihoyo.com/news/*
// @match         *://zzz.mihoyo.com/news/*
// @match         file:///*.txt
// @match         file:///*.htm
// @match         file:///*.html
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @grant         GM_listValues
// @grant         GM_registerMenuCommand
// ==/UserScript==
const StandalonePageRegex = [
    /.*:\/\/(?:sr|zzz)\.mihoyo\.com\/.*/,
    /file:\/\/\/.*\.txt/,
    /file:\/\/\/.*\.htm/,
    /file:\/\/\/.*\.html/
];
const DynamicPageRegex = [
    /.*:\/\/.*\.mihoyo\.com\/.*/,
    /file:\/\/\/.*\.txt/,
    /file:\/\/\/.*\.htm/,
    /file:\/\/\/.*\.html/
];
const ProcessLFRegex = [
    /file:\/\/\/.*\.txt/
];
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
const ActivePageRegex = PageRegex.find(x => x.test(window.location.href));
const IsDynamicPage = DynamicPageRegex.findIndex(x => x.test(window.location.href)) != -1;
const IsStandalonePage = StandalonePageRegex.findIndex(x => x.test(window.location.href)) != -1;
const IsProcessingLF = ProcessLFRegex.findIndex(x => x.test(window.location.href)) != -1;

/**
 * @param {Document} doc
 */
function extractPageData(doc) {
    const pageTitle = doc.title.trim();
    /** @type {?HTMLElement} */
    const title = (
        doc.querySelector("#arcxs_title>h1,.bookname>h1,.pt-read-cont>.pt-read-title>h1,.pt-read>div") ??
        doc.querySelector(".article-title,.bookname,#nr_title,.title,.zhong,.cont-title,.article__title,.news-detail__title,tr>td[background='/image/bgheader.gif']") ??
        doc.querySelector("h1")
    );
    /** @type {string} */
    const content = (
        doc.querySelector("#onearcxsbd,#cont-body,.pt-read-text,.article__bd,#nr1") ??
        doc.querySelector(".article-content,#content,#chaptercontent,#nr,.article,.pt-read-cont,.main-wrap,.article__content,.news-detail__content,.read_chapterDetail,.txtnav,.nodeContent,#AllySite+div,#ChSize") ??
        doc.querySelector("article:not(#myt-snr-content)") ??
        doc.querySelector("html>body>pre") // for txt in Firefox
    )?.innerHTML.replaceAll("　", "");
    /** @type {?HTMLAnchorElement} */
    const prev = (
        doc.querySelector("[rel=prev],#prev_url,#pb_prev,#link-preview,.pt-prechapter>a") ??
        doc.querySelector(".bottem1>a:nth-child(1),.col-md-6.text-center>a[href]:nth-child(1),b>a.prevPage:nth-child(1),td.prev>a,article>ul.pages>li:nth-child(2)>a,.page_chapter>ul>li:nth-child(1)>a,.pt-prechapter,.buttombar__prev:not(.buttombar__prev--disabled),.article__ft>a[href]:nth-child(1),.pageNav>a:nth-child(2),.page1>a:nth-child(1),.bl_pre,center>a.pages:nth-of-type(1)") ??
        doc.querySelector("body>table:has(#AllySite)+div>a:nth-child(1)")
    );
    /** @type {?HTMLAnchorElement} */
    const info = (
        doc.querySelector("[rel='category tag'],#info_url,#pb_mulu,#link-indexz,.pt-catalogue>a") ??
        doc.querySelector(".bottem1>a:nth-child(2),.col-md-6.text-center>a[href]:nth-child(2),a.returnIndex,td.mulu>a,article>ul.pages>li:nth-child(4)>a,.page_chapter>ul>li:nth-child(2)>a,.pt-prechapter+a,.news-detail .btn-back,.topbar__back,.nuxt-link-active,.pageNav>a:nth-child(5),.page1>a:nth-child(3),#page_muLu,tr>td>li>a:nth-of-type(3)") ??
        doc.querySelector("body>table:has(#AllySite)+div>a:nth-child(2)")
    );
    /** @type {?HTMLAnchorElement} */
    const next = (
        doc.querySelector("[rel=next],#next_url,#pb_next,#link-next,.pt-nextchapter>a") ??
        doc.querySelector(".bottem1>a:nth-child(3),.col-md-6.text-center>a[href]:nth-child(3),b>a.prevPage:nth-child(2),td.next>a,article>ul.pages>li:nth-child(3)>a,.page_chapter>ul>li:nth-child(3)>a,.pt-nextchapter,.buttombar__next:not(.buttombar__next--disabled),.article__ft>a[href]:nth-child(2),.pageNav>a:nth-child(3),.page1>a:nth-child(4),.bl_next,center>a.pages:nth-of-type(2)") ??
        doc.querySelector("body>table:has(#AllySite)+div>a:nth-child(3)")
    );
    const prevText = prev?.href ?? "";
    const nextText = next?.href ?? "";
    return {
        pageTitle: pageTitle,
        title: title?.innerText?.trim() ?? pageTitle,
        content: content?.trim() ?? "",
        prev: ActivePageRegex.test(prevText) ? prevText?.trim() : "",
        info: info?.href.trim() ?? "",
        next: ActivePageRegex.test(nextText) ? nextText?.trim() : ""
    };
}

/**
 * @param {?{pageTitle:string,title:string,content:string,prev:string,info:string,next:string}} data
 */
function loadPageData(data) {
    if (data) {
        document.title = data.pageTitle;
        /** @type {HTMLHeadingElement} */
        const title = SimpleNovelReader.querySelector("#myt-snr-title");
        title.innerText = data.title;
        if (IsProcessingLF) {
            const lines = data.content.split("\n");
            SimpleNovelReader.querySelector("#myt-snr-content").innerHTML = "<p>" + lines.join("</p><p>") + "</p>";
        } else {
            SimpleNovelReader.querySelector("#myt-snr-content").innerHTML = data.content;
        }
        /** @type {HTMLButtonElement} */
        const prev = SimpleNovelReader.querySelector("#myt-snr-prev");
        prev.dataset.href = data.prev;
        prev.disabled = !data.prev;
        /** @type {HTMLButtonElement} */
        const info = SimpleNovelReader.querySelector("#myt-snr-info");
        info.dataset.href = data.info;
        /** @type {HTMLButtonElement} */
        const next = SimpleNovelReader.querySelector("#myt-snr-next");
        next.dataset.href = data.next;
        next.disabled = !data.next;
    } else {
        SimpleNovelReader.querySelector("#myt-snr-title").innerHTML = "";
        SimpleNovelReader.querySelector("#myt-snr-content").innerHTML = "";
        /** @type {HTMLButtonElement} */
        const prev = SimpleNovelReader.querySelector("#myt-snr-prev");
        prev.dataset.href = "";
        prev.disabled = true;
        /** @type {HTMLButtonElement} */
        const info = SimpleNovelReader.querySelector("#myt-snr-info");
        info.dataset.href = "";
        /** @type {HTMLButtonElement} */
        const next = SimpleNovelReader.querySelector("#myt-snr-next");
        next.dataset.href = "";
        next.disabled = true;
    }
}

/**
 * @param {HTMLMediaElement} media 
 */
function pause(media) {
    media.autoplay = false;
    media.pause();
}

function loadPreload() {
    /** @type {HTMLIFrameElement} */
    const preloadFrame = SimpleNovelReader.querySelector("#myt-snr-preload");
    const doc = preloadFrame.contentWindow.document;
    doc.querySelectorAll("audio").forEach(pause);
    doc.querySelectorAll("video").forEach(pause);
    loadPageData(extractPageData(doc));
    SimpleNovelReader.querySelector("#myt-snr-content").scrollTop = 0;
}

/**
 * @param {URL} url
 */
function loadUrl(url) {
    if (IsStandalonePage) {
        loadPageData(extractPageData(document));
    } else if (IsDynamicPage) {
        /** @type {HTMLIFrameElement} */
        const preloadFrame = SimpleNovelReader.querySelector("#myt-snr-preload");
        url.hash = "disable-simple-novel-reader";
        if (preloadFrame.contentWindow && preloadFrame.src == url.href) {
            loadPageData(extractPageData(preloadFrame.contentWindow.document));
            SimpleNovelReader.querySelector("#myt-snr-content").scrollTop = 0;
        } else {
            loadPageData(null);
            preloadFrame.src = url.href;
        }
    } else {
        get(url).then(
            xhr => {
                loadPageData(extractPageData(xhr.response));
                SimpleNovelReader.querySelector("#myt-snr-content").scrollTop = 0;
            }
        );
    }
}

/**
 * GET 请求
 * @param {string | URL} url 请求地址
 * @param {XMLHttpRequestResponseType} responseType 响应类型
 * @param {number} timeout 超时
 * @returns {Promise<XMLHttpRequest>} Promise 对象，其 resolve 和 reject 均传入请求所用的 XMLHttpRequest 对象
 */
function get(url, responseType = "document", timeout = 0) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.timeout = timeout;
        xhr.withCredentials = true;
        xhr.responseType = responseType;
        xhr.send();
        xhr.ontimeout = () => reject(timeout);
        xhr.onload = () => {
            if (xhr.status < 300) {
                resolve(xhr);
            } else {
                reject(xhr);
            }
        };
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

let prevUrl = "";

/**
 * 
 * @param {?string} url 
 */
function show(url = undefined) {
    window.location.hash = "simple-novel-reader";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (url || prevUrl != window.location.href) {
        const newUrl = new URL(url ?? window.location.href);
        newUrl.hash = "simple-novel-reader";
        history.pushState(null, "", newUrl.toString());
        SimpleNovelReader.scrollTop = 0;
        loadUrl(newUrl);
    }
}

function hide() {
    const newUrl = window.location.origin + window.location.pathname + window.location.search;
    if (newUrl != OriginalUrl) {
        window.location.href = newUrl;
    } else {
        window.location.hash = "";
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
    }
    prevUrl = newUrl;
}

function toggleSettingDisplay() {
    /** @type {HTMLDivElement} */
    const settings = SimpleNovelReader.querySelector("#myt-snr-setting-items");
    /** @type {HTMLButtonElement} */
    const settingBtn = SimpleNovelReader.querySelector("#myt-snr-setting");
    if (settings.toggleAttribute("hidden")) {
        settingBtn.innerText = "展开样式设置";
    } else {
        settingBtn.innerText = "收起样式设置";
    }
}

/**
 * @param {Event} event
 */
function switchChapter(event) {
    /** @type {HTMLButtonElement} */
    // @ts-ignore
    const btn = event.target;
    if (btn.dataset.href) {
        show(btn.dataset.href);
    }
}

function viewInfo() {
    /** @type {HTMLButtonElement} */
    const e = SimpleNovelReader.querySelector("#myt-snr-info");
    if (e?.dataset.href) {
        window.location.href = e.dataset.href;
    }
}

function updateCustomFontButtonStyle() {
    /** @type {HTMLLabelElement} */
    const label = SimpleNovelReader.querySelector("[for=myt-snr-setting-font-family-custom]");
    label.style.fontFamily = GM_getValue("config.font-family.custom", "sans-serif");
    /** @type {HTMLInputElement} */
    const input = SimpleNovelReader.querySelector("#myt-snr-setting-font-family-custom-name");
    input.style.fontFamily = GM_getValue("config.font-family.custom", "sans-serif");
}

function updateContentStyle() {
    const fontSizeStr = FontSizes[GM_getValue("config.font-size", 3)];
    const lineHeightStr = GM_getValue("config.line-height", 1.5).toFixed(1);
    const maxWidthStr = GM_getValue("config.max-width", 40) + "em";
    /** @type {HTMLSpanElement} */
    const fontSizeE = SimpleNovelReader.querySelector("#myt-snr-setting-font-size-value");
    fontSizeE.innerText = fontSizeStr[1];
    /** @type {HTMLSpanElement} */
    const lineHeightE = SimpleNovelReader.querySelector("#myt-snr-setting-line-height-value");
    lineHeightE.innerText = lineHeightStr;
    /** @type {HTMLSpanElement} */
    const maxWidthE = SimpleNovelReader.querySelector("#myt-snr-setting-max-width-value");
    maxWidthE.innerText = maxWidthStr;
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
    /** @type {HTMLInputElement} */
    const radio = SimpleNovelReader.querySelector(`input[name=${name}][data-value=${CSS.escape(value)}]`);
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
}

/**
 * @param {Event} event
 */
function updateRadioButton(event) {
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const radio = event.target;
    SimpleNovelReader.querySelector(`label[for=${radio.id}]`).toggleAttribute("checked", true);
    for (const r of SimpleNovelReader.querySelectorAll(`input[name=${radio.name}]:not([id=${radio.id}])`)) {
        SimpleNovelReader.querySelector(`label[for=${r.id}]`).toggleAttribute("checked", false);
    }
}

/**
 * @param {Event} event
 */
function updateFontFamilyByRadio(event) {
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const radio = event.target;
    /** @type {HTMLInputElement} */
    const customE = SimpleNovelReader.querySelector("#myt-snr-setting-font-family-custom-name");
    const custom = customE.value;
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
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const input = event.target;
    // @ts-ignore
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
    const oldVal = GM_getValue("config.font-size", 3) + diff;
    let newVal = oldVal;
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
    const oldVal = GM_getValue("config.line-height", 1.5) + diff;
    let newVal = oldVal;
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
    const oldVal = GM_getValue("config.max-width", 40) + diff;
    let newVal = oldVal;
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
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const radio = event.target;
    GM_setValue("config.color-scheme", radio.dataset.value);
    SimpleNovelReader.dataset.colorScheme = radio.dataset.value;
}

/**
 * @param {Event} event
 */
function importCustomStyle(event) {
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const input = event.target;
    input.files[0].text().then(
        s => {
            /** @type {HTMLInputElement} */
            const input = SimpleNovelReader.querySelector("#myt-snr-setting-custom-style");
            input.value = s;
            GM_setValue("config.custom-style", s);
        }
    );
}

function applyCustomStyle() {
    /** @type {HTMLInputElement} */
    const input = SimpleNovelReader.querySelector("#myt-snr-setting-custom-style");
    GM_setValue("config.custom-style", input.value);
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

function main() {
    SimpleNovelReader.id = "myt-snr-root";
    SimpleNovelReader.className = "x-scroll-container";
    SimpleNovelReader.innerHTML = `
$$$$$replace$$$$$
`;
    GM_registerMenuCommand("切换阅读模式", toggle);
    GM_registerMenuCommand("切换设置界面", toggleSettingDisplay);
    GM_registerMenuCommand("删除样式数据", deleteData);
    SimpleNovelReader.querySelector("#myt-snr-exit").addEventListener("click", hide);
    SimpleNovelReader.querySelector("#myt-snr-settings").addEventListener("click", toggleSettingDisplay);
    SimpleNovelReader.querySelector("#myt-snr-close-settings").addEventListener("click", toggleSettingDisplay);
    SimpleNovelReader.querySelector("#myt-snr-prev").addEventListener("click", switchChapter);
    SimpleNovelReader.querySelector("#myt-snr-info").addEventListener("click", viewInfo);
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

    for (const btn of SimpleNovelReader.querySelectorAll(".x-myt-hidden-radio")) {
        btn.addEventListener("change", updateRadioButton);
    }
    for (const btn of SimpleNovelReader.querySelectorAll(".x-myt-snr-setting-font-family")) {
        btn.addEventListener("change", updateFontFamilyByRadio);
    }
    for (const btn of SimpleNovelReader.querySelectorAll(".x-myt-setting-color-scheme")) {
        btn.addEventListener("change", updateColorScheme);
    }

    /** @type {HTMLInputElement} */
    const customFontFamily = SimpleNovelReader.querySelector("#myt-snr-setting-font-family-custom-name");
    customFontFamily.value = GM_getValue("config.font-family.custom", "");
    customFontFamily.addEventListener("input", updateFontFamilyByInput);

    SimpleNovelReader.querySelector("#myt-snr-preload").addEventListener("load", loadPreload);

    updateRadioButtonGroup("font-family", GM_getValue("config.font-family", "sans-serif"));
    updateRadioButtonGroup("color-scheme", GM_getValue("config.color-scheme", "auto"));
    updateCustomFontButtonStyle();
    updateContentStyle();
    updateCustomStyle();
    if (!IsDynamicPage) {
        loadUrl(new URL(window.location.href));
    }
    if (window.location.hash == "#simple-novel-reader") {
        SimpleNovelReader.style.top = "0";
        show();
    }
    document.body.appendChild(SimpleNovelReader);
    if (IsDynamicPage) {
        loadUrl(new URL(window.location.href));
    }
    window.addEventListener("hashchange", detectHashChange);
}

if (!window.location.hash.includes("disable-simple-novel-reader")) {
    main();
}