const win = window
const doc = document
const loc = location
const hash = loc.hash
const apiOrigin = process.env.NODE_ENV === "production" ? loc.origin.replace(/cdn(test)?\./i, "s.") : "/api"
const { sdk } = win
const isSDK = !!(sdk && sdk.getBasicFields)
const isIframe = win.top !== win
let data
let readyCallbacks = []

if (hash) { // 兼容老模式
  try {
    data = JSON.parse(decodeURIComponent(hash.substring(1)))
    console.log(data,'===');
  } catch (e) {
    data = { ec: {}, app: {} }
    console.error('parse hash error', e)
  }
}

const gajs = doc.createElement('script')
gajs.setAttribute('crossorigin', 'anonymous')
gajs.async = true
gajs.src = 'https://www.googletagmanager.com/gtag/js?id=UA-182972603-1'
doc.head.append(gajs)

win.dataLayer = []

function gtag() {
  win.dataLayer.push(arguments)
}

gtag('js', new Date())
gtag('config', 'UA-182972603-1')

const EndCard = {
  get data() {
    return data
  },
  ready() {
    console.log(1);
    return new Promise((resolve) => {
      if (data) {
        resolve(data)
      } else {
        readyCallbacks.push(resolve)
      }
    })
  },
  close() {
    setTimeout(() => {
      if (isIframe) {
        win.top.removeEc()
      } else if (isSDK) {
        sdk.close()
      }
    }, 3000)
  },
  click(andClose = 1) {
    try {
      gtag('event', 'ButtonClick', {
        'event_category': 'Install',
        'event_label': 'tst',
        'value': 1
      })
    } catch (e) {
      console.warn(e)
    }
    const { appId, cid, pid, clk, ec, icon, title } = data
    const url = new URL(ec.link)
    if (url.hostname.match(/\.yowin\.mobi$/)) {
      const ps = url.searchParams
      ps.set('appId', appId)
      ps.set('cid', cid)
      ps.set('pid', pid)
      ps.set('clk', clk)
    }

    if (isSDK) { // sdk 环境下, 当前 EndCard 运行环境为 独立Webview 或 外部Browser
      url.hash = hash // 拼接 hash 为了内置 apk 下载器取 app 信息
      loc.href = url.href
    } else if (isIframe) { // 如果是 iframe 打开
      const t = win.top
      if (url.protocol === 'market:') {
        t.open(url.href)
      } else if (url.hostname === 'play.google.com') {
        t.open(`market://details${url.search}`)
      } else if (/\.apk$/.test(url.pathname) && t.HdAd && t.HdAd.customDownload) {
        t.HdAd.customDownload({ appId, url: url.href, title, icon }).catch(() => this._openBrowser(url.href))
      } else {
        this._openBrowser(url.href)
      }
    } else {
      loc.href = url.href
    }
    if (andClose) {
      this.close()
    }
  },
  _openBrowser(url) {
    const t = win.top
    if (t.HdAd && t.HdAd.customOpenBrowser) {
      t.HdAd.customOpenBrowser(url).catch(() => this._openIntent(url))
    } else {
      this._openIntent(url)
    }
  },
  /**
   * open intent
   * @param {string} url
   * @private
   */
  _openIntent(url) {
    const i = url.indexOf("://")
    const scheme = url.substring(0, i)
    const ipath = url.substring(i + 3)
    win.top.open(`intent://${ipath}#Intent;scheme=${scheme};S.browser_fallback_url=${encodeURIComponent(url)};end;`)
  },
  // 发送手机号
  sendPhone(phone) {
    if (!phone) {
      return Promise.reject('empty')
    }
    const { appId, cid, pid, ec } = data
    const content = `EndcardId: ${ec.id}`
    const ps = { pid, cid, appId, email: phone.trim(), content, ts: Date.now() }
    return fetch(`${apiOrigin}/v1/spin/customer`, {
      method: "POST",
      cache: "no-store",
      body: new URLSearchParams(ps)
    })
  }
}

win.EndCard = EndCard
export default EndCard
