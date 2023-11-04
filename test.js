/**
 * @param {Document} doc 
 * @returns {{title:string,content:string,prev:?string,next:?string}}
 */
function extractPageData(doc) {
    var title = doc.querySelector("h1,.title,.zhong").innerText;
    var content = doc.querySelector("article,#content,#chaptercontent").innerHTML.replace("　", "");
    var prev = doc.querySelector("#prev_url,#pb_prev").href;
    var info = doc.querySelector("#info_url,#pb_mulu").href;
    var next = doc.querySelector("#next_url,#pb_next").href;
    return {
        title: title,
        content: content,
        prev: prev == info ? null : prev,
        next: next == info ? null : next
    }
}
/**
 * @param {{title:string,content:string,prev:?string,next:?string}} data
 */
function loadPageData(data) {
    document.querySelector("#x-myt-snr-title").innerText = data.title;
    document.querySelector("#x-myt-snr-content").innerHTML = data.content;
    document.querySelector("#x-myt-snr-prev").dataset.href = data.prev;
    document.querySelector("#x-myt-snr-next").dataset.href = data.next;
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