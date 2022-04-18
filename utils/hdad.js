import "../mock"
import { HdSDK } from "./hdsdk"

/**
 * @typedef PageMetaData
 * @property {string} title - 玩法标题
 * @property {string} descn - 玩法说明
 * @property {string[]} rewards - 奖品图片地址列表
 * @property {string[]} wlist - 获奖列表
 * @property {number} wrate - 中奖概率%, win rate, 默认:100
 * @property {number} fc - 表示 fu 小时内该用户最多互动几次, 0:不控制
 * @property {number} fu - 修饰 fc 的时间间隔, 单位小时
 * @property {string} cob - 媒体自定义打开浏览器方法
 * @property {string} cod - 媒体自定义打开下载器方法
 * @property {null | 1} iec - iframe open endcard 标识
 */

/**
 * @typedef Campaign
 * @property {number} cid - CampaignID
 * @property {number} crid - CreativeID
 * @property {number} mid - MaterialID
 * @property {string} appId - AppID
 * @property {string} name - AppName
 * @property {string} title - Title
 * @property {string} descn - Description
 * @property {string} act - Action Text
 * @property {string} icon - icon url
 * @property {string} img - image url
 * @property {number} ot - OpenType
 * @property {string} link - Click URL
 * @property {string[]} clktks - Click Track URLs
 * @property {string[]} imptks - Impression Track URLs
 * @property {EndCard} ec - EndCard
 * @property {AppExt} app - AppExt
 * @property {number} ts - 点击时间, mills
 */

/**
 * @typedef EndCard
 * @property {number} id - EndCardID
 * @property {string} url - EndCard Template URL
 * @property {string} img - Image URL
 * @property {string} title - Title
 * @property {string[]} subtitles - Subtitle Array
 * @property {string[]} descns - Description Array
 * @property {object} ext - Extend fields
 */

/**
 * @typedef AppExt
 * @property {number} rating - AppRating, 评分
 * @property {string} rcount - AppRating, 评分人数
 * @property {string} size - AppFileSize
 * @property {string} dls - App Downloads
 * @property {string} age - App age requirement
 */

/**
 * @typedef Reward
 * @property {boolean} bingo - 是否中奖
 * @property {Campaign} c - 中奖产品
 * @property {OtherTemplate[]} next - 受限后可选的其他玩法
 */

/**
 * @typedef OtherTemplate
 * @property {number} id - 广告位模板关联ID
 * @property {string} title - 模板标题
 * @property {string} img - Template Preview Image URL
 */
const win = window
const doc = document
const loc = location
const base = loc.href
const tml = getTml()
const isSDK = HdSDK.isSdk()
const apiOrigin = process.env.NODE_ENV === "production" ? loc.origin.replace(/cdn(test)?\./i, "s.") : "/api"
const reqData = {}
let igp = 0

function getTml() {
  const path = loc.pathname
  try {
    return /\/tml\/(.+)\.html/i.exec(path)[1]
  } catch (e) {
    return path
  }
}

function getRequestParams() {
  reqData.ts = Date.now()
  const reqsp = new URLSearchParams()
  for (const [ n, v ] of Object.entries(reqData)) {
    reqsp.set(n, v.toString())
  }
  return reqsp
}

function request(path, d) {
  const reqsp = getRequestParams()
  if (d) {
    for (const [ n, v ] of Object.entries(d)) {
      if (v) reqsp.set(n, v.toString())
    }
  }
  return new Promise((resolve, reject) => {
    fetch(apiOrigin + path, {
      method: 'POST',
      cache: 'no-store',
      body: reqsp
    }).then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        const { status, statusText, url } = res
        reject({ status, url, err: statusText })
      }
    }).then(res => {
      if (res) {
        res.code ? reject(res) : resolve(res)
      }
    })
  })
}

function sendEvent(e, val) {
  let msg;
  if (val) {
    msg = e
  } else {
    msg = reqData
  }
  const { pid, ptid, tid } = msg
  e.pid = parseInt(pid) || 0
  e.ptid = parseInt(ptid) || 0
  e.tid = parseInt(tid) || 0
  const data = { tml }
  if (e.data) {
    Object.assign(e.data, data)
  } else {
    e.data = data
  }
  if (isSDK) {
    HdSDK.pushEvent(e)
  } else {
    try {
      const ps = getRequestParams()
      for (const [ n, v ] of Object.entries(e)) {
        if (n === "data") {
          for (const [ dn, dv ] of Object.entries(v)) {
            ps.set(`data[${dn}]`, dv || '')
          }
        } else {
          ps.set(n, v || '')
        }
      }
      new Image().src = apiOrigin + "/v1/spin/log?" + ps.toString()
    } catch (ex) {
      console.error("sendEvent error", ex, e)
    }
  }
}

try {
  const ps = new URLSearchParams(loc.hash.substring(2))
  ps.forEach((v, k) => {
    reqData[k] = v
  })
  reqData.zo = -new Date().getTimezoneOffset()
  reqData.lang = navigator.language
} catch (e) {
  console.error(e)
  sendEvent({ tag: "h5", eid: "hasherr", data: { err: e.toString() } })
}

if (isSDK) {
  const bfs = HdSDK.getBasicFields()
  Object.assign(reqData, bfs)

  igp = bfs.igp

  if (HdSDK.compareSdkv("1.4.2") < 0) {
    // disable history.back
    win.history.pushState(null, null, base)
    win.addEventListener("popstate", () => {
      win.history.pushState(null, null, base)
    })
  }
  // win.addEventListener("error", (e) => {
  //   const { message: msg, lineno, colno, error: err } = e
  //   sendEvent({ tag: "h5", eid: "winErr", msg, data: { err, lineno, colno } })
  // })
}

const storeData = {}
const idKey = "spinId" + reqData.ptid
const store = localStorage
try {
  const json = store.getItem(idKey)
  if (json) {
    Object.assign(storeData, JSON.parse(json))
  }
  // 互动小时记录
  if (!storeData.records) {
    storeData.records = {}
  }
  // 浏览活动记录
  if (!storeData.wcs) {
    storeData.wcs = {}
  }
  // 清理过期点击记录
  const now = Date.now() / 60000
  for (const [ k, v ] of Object.entries(store)) {
    if (k.search(/^oksClk/) === 0) {
      if (now - parseInt(v || '0') > 1440) {
        store.removeItem(k)
      }
    }
  }
} catch (e) {
  console.warn("storeData error", e)
  sendEvent({ tag: "h5", eid: "storeErr", data: { err: e.toString() } })
}

let clData
let readyCallbacks = []
let cIndex = 0 // cs 下标, 轮询中奖

const HdAd = {
  ready() {
    return new Promise((resolve) => {
      if (clData) {
        resolve(clData.meta)
      } else {
        readyCallbacks.push(resolve)
      }
    })
  },
  /**
   * @return {PageMetaData}
   */
  get meta() {
    return (clData && clData.meta) || {}
  },
  /**
   * @return {Array<OtherTemplate>}
   */
  get next() {
    return (clData && clData.next) || []
  },
  get apiOrigin() {
    return apiOrigin
  },
  /**
   * 获取基础请求参数
   * @return {URLSearchParams}
   */
  get requestParams() {
    return getRequestParams()
  },
  pushEvent(e) {
    sendEvent(e)
  },
  /**
   * 延迟执行任务
   * @param {function} callback - 任务方法
   * @param {number} delay - 延迟时长, 毫秒
   */
  setInterval(callback, delay) {
    let obj = win.interValPrecisionObj || (win.interValPrecisionObj = { num: 0 })
    obj.num++
    obj["n" + obj.num] = true
    let intervalId = obj.num
    // 开始时间
    let startTime = +new Date()
    // 已执行次数
    let count = 0
    // 页面隐藏时重置时间和次数
    doc.addEventListener("visibilitychange", visibe);

    function visibe() {
      if (doc.visibilityState === 'visible') {
        startTime = +new Date()
        count = 0
      }
    }

    // 延迟时间
    delay = delay || 0;
    (function loop() {
      // 定时器被清除，则终止
      if (!obj["n" + intervalId]) {
        doc.removeEventListener("visibilitychange", visibe);
        return
      }
      // 满足条件执行回调
      if (+new Date() > startTime + delay * (count + 1)) {
        count++
        callback(count)
      }
      requestAnimationFrame(loop)
    })()
    return intervalId
  },

  // 清除自定义的 interval
  clearInterval(timer) {
    delete win.interValPrecisionObj["n" + timer]
  },
  setTimeout(callback, delay) {
    const startTime = +new Date()
    let req
    (function loop() {
      req = requestAnimationFrame(loop)
      if (+new Date() - startTime > delay) {
        callback()
        cancelAnimationFrame(req)
      }
    })()
    return req
  },


  /**
   * 增加当前小时的互动数并上报
   */
  increasePlayTimes() {
    sendEvent({ tag: "h5", eid: 'tmlPlay' })
    const { records } = storeData
    const { meta } = this
    if (meta.fc && meta.fu) {
      const nowH = Math.floor(Date.now() / 36e5) // 1970 年以来的小时
      if (!records[nowH]) records[nowH] = 0
      records[nowH] += 1 // 记录当前小时的互动数
      store.setItem(idKey, JSON.stringify(storeData))
    }
  },
  /**
   * 获取配置小时区间内的互动次数
   * @return {number}
   */
  getPlayTimes() {
    let playTimes = 0
    try {
      const { meta } = this
      const { records } = storeData
      if (meta.fc && records) {
        const nowH = Math.floor(Date.now() / 36e5) // 1970 年以来的小时
        for (const [ h, times ] of Object.entries(records)) {
          const dur = nowH - parseInt(h)
          if (dur < meta.fu) {
            playTimes += times
          } else if (dur > 72) {
            // 清理大于三天的记录
            delete records[h]
          }
        }
      }
    } catch (e) {
      sendEvent({ tag: "h5", eid: "getPlayTimesErr", data: { err: e.toString() } })
    }
    return playTimes
  },
  /**
   * 是否互动受限
   * @return {boolean}
   */
  isLimited() {
    const { meta } = this
    if (meta.fc) {
      return this.getPlayTimes() > meta.fc
    }
    return false
  },
  /**
   * 获取中奖记录
   * @return {Array<Campaign>}
   */
  getMyRewards() {
    return Object.values(storeData.wcs).sort((a, b) => b.ts - a.ts)
  },
  /**
   * 获取中奖结果
   * @return {{cs, cIndex: number}}
   */
  getCs() {
    const { cs } = clData
    return { cs, cIndex }
  },
  /**
   * 获取其他玩法
   * @return {Promise<OtherTemplate[]>}
   */
  getOhterTmls() {
    return new Promise((resolve, reject) => {
      request('/v1/spin/tmls').then(res => resolve(res)).catch(reject)
    })
  },
  /**
   * 获取宝箱奖品
   * @return {Promise<Campaign>}
   */
  getGiftBoxReward() {
    return new Promise((resolve, reject) => {
      request('/v1/spin/gb').then(res => resolve(res.c)).catch(reject)
    })
  },
  getReward() {
    const v = { bingo: false }
    try {
      this.increasePlayTimes()
      const { wrate = 100, fc, fu } = this.meta
      const { cs, next } = clData
      if (!this.isLimited()) {
        if (Math.random() * 100 < wrate) {
          // 控制中奖概率
          v.c = cs[cIndex++ % cs.length]
        }
        v.bingo = !!v.c
      } else {
        v.next = next
      }
      if (v.bingo) {
        // 保存中奖记录
        const { wcs } = storeData
        wcs[v.c.cid] = Object.assign({ ts: Math.floor(Date.now() / 1e3) }, v.c)
        store.setItem(idKey, JSON.stringify(storeData))
      }

      let eid, cid, crid, mid
      if (v.bingo) {
        eid = "rewardBingo"
        cid = v.c.cid
        crid = v.c.crid
        mid = v.c.mid
      } else {
        eid = "rewardLose"
      }
      sendEvent({ tag: "h5", eid, cid, crid, data: { mid, wrate, fc, fu } })
    } catch (e) {
      sendEvent({ tag: "h5", eid: "getRewardErr", data: { err: e.toString() } })
    }
    return v
  },
  /**
   * 展示导流弹窗上报
   */
  showRiver(tml) {
    const { tid, ptid, pid } = this.tmlUrl(tml)
    sendEvent({ tag: "h5", eid: "divimpr", tid, ptid, pid }, true)
  },
  clickRiver(tml) {
    HdSDK.openWebview(tml.url);
    const { tid, ptid, pid } = this.tmlUrl(tml)
    sendEvent({ tag: "h5", eid: "divclick", tid, ptid, pid }, true)
  },
  tmlUrl(tml) {
    let reqData = {};
    const reqsp = new URLSearchParams(tml.url.split("#/?")[1]);
    for (const [ n, v ] of reqsp) {
      reqData[n] = v;
    }
    return reqData
  },
  /**
   * 展示产品时调用, 用于计数
   * @param {Campaign} c
   */
  showReward(c) {
    try {
      const { cid, crid, mid, imptks, ec, adSence } = c
      const ecId = ec && ec.id || 0
      if (HdSDK.onUserInteraction && isSDK) {
        HdSDK.onUserInteraction('INTERACTIVE_PLAY')
      }
      sendEvent({ tag: "h5", eid: "impr", cid, crid, data: { mid, ecId, adSence } })
      if (imptks) {
        for (const url of imptks) {
          new Image().src = url
        }
      }
    } catch (e) {
      sendEvent({ tag: "h5", eid: "showRewardErr", data: { c, err: e.toString() } })
    }
  },
  /**
   * 点击产品时调用, 用于计数和跳转
   * @param {Campaign} c
   */
  async clickReward(c) {
    try {
      HdSDK.onUserInteraction('INTERACTIVE_CLICK')
      await this._clickFetch(c)
    } catch (e) {
      sendEvent({ tag: "h5", eid: "clkErr", data: { err: e.toString() } })
    }
  },
  /**
   * fetch click 处理
   * @param {Campaign} c
   * @private
   */
  async _clickFetch(c) {
    const { cid, crid, mid, link, ot, appId, name, title, icon, ec, app, adSence } = c
    if (HdSDK.onUserInteraction && isSDK) {
      HdSDK.onUserInteraction('INTERACTIVE_CLICK')
    }
    sendEvent({ tag: "h5", eid: "click", cid, crid, data: { mid, ecId: ec && ec.id || 0, adSence } })

    const key = 'oksClk' + cid
    const lts = parseInt(store.getItem(key) || '0')
    let fetchUrl = new URL(link)
    if (lts > 0) {
      fetchUrl.searchParams.set('lcm', (Date.now() / 60000 - lts).toFixed(0))
    }
    const res = await fetch(fetchUrl.href)
    if (res.status !== 200) {
      console.warn("click error", res)
      return
    }
    const data = await res.json()
    if (!data.url) {
      console.warn("click error, empty url", res)
      return
    }
    if (data.tk) {
      new Image().src = data.tk
    }
    if (data.rk) {
      store.setItem(key, (Date.now() / 60000).toFixed(0))
    }
    let target = data.url
    // params 用于 apk 下载时, android 拦截获取 app 信息
    const params = { appId, cid, name, title, icon, pid: parseInt(reqData.pid) }

    if (ec) { // 需要跳转到 EndCard
      const ecData = { ...ec }
      delete ecData.url
      params.ec = ecData
      params.app = app
      params.ot = ot
      ecData.link = target
      target = ec.url + '#' + encodeURIComponent(JSON.stringify(params))
    } else if (ot === 2) { // apk
      target += ('#' + encodeURIComponent(JSON.stringify(params)))
    }
    if (isSDK) {
      this._sdkClick(target, ot, igp, ec)
    } else {
      if (ec && this.meta.iec) {
        this._openIframeEc(target)
      } else {
        this.customOpenBrowser(target).catch(() => {
          const url = new URL(target)
          if (url.protocol === 'market:') {
            win.open(url.href)
          } else if (url.hostname === 'play.google.com') {
            win.open(`market://details${url.search}`)
          } else if (/\.apk$/.test(url.pathname)) {
            this.customDownload({ url: target, appId, icon, title }).catch(() => this._openIntent(target))
          } else {
            this._openIntent(target)
          }
        })
      }
    }
  },
  _openIntent(url) {
    const i = url.indexOf("://")
    const scheme = url.substring(0, i)
    const ipath = url.substring(i + 3)
    win.open(`intent://${ipath}#Intent;scheme=${scheme};S.browser_fallback_url=${encodeURIComponent(url)};end;`)
  },
  /**
   * Open EndCard In IFrame
   * @param {string} target
   * @private
   */
  _openIframeEc(target) {
    const f = doc.createElement('iframe')
    f.src = target
    f.style.cssText = 'width:100vw;height:100vh;position:absolute;top:0;left:0;border:0;z-index:21'
    doc.body.append(f)

    const close = doc.createElement('div')
    close.className = 'close x'
    close.style.cssText = 'z-index:22;display:flex;left:0'
    setTimeout(() => doc.body.appendChild(close), 3000)

    win.removeEc = function () {
      f.remove()
      close.remove()
    }

    close.addEventListener('click', win.removeEc)
  },
  /**
   * 媒体自定义打开浏览器方法
   * @param {string} url
   * @returns {Promise<void>}
   */
  customOpenBrowser(url) {
    return new Promise((resolve, reject) => {
      const { cob } = this.meta
      if (cob) {
        try {
          new Function('o', cob)({ url })
          resolve()
        } catch (e) {
          reject(e)
        }
      } else {
        reject('nob')
      }
    })
  },
  /**
   * 媒体自定义打开下载器
   * @param {{url: string, appId: string, icon: string, title: string}} o
   * @returns {Promise<void>}
   */
  customDownload(o) {
    return new Promise((resolve, reject) => {
      const { cod } = this.meta
      if (cod) {
        try {
          new Function('o', cod)(o)
          resolve()
        } catch (e) {
          reject(e)
        }
      } else {
        reject('nod')
      }
    })
  },
  /**
   * click in Hudong SDK env
   * @param {string} target
   * @param {number} ot
   * @param {number} igp
   * @param {EndCard} ec
   * @private
   */
  _sdkClick(target, ot, igp, ec) {
    if (igp) {
      if (ec) {
        HdSDK.openBrowser(target)
      } else if (ot === 1) { // GP
        win.open(target)
      } else {
        HdSDK.openBrowser(target)
      }
    } else {
      if (ec) {
        HdSDK.openWebview(target)
      } else if (ot === 3) {
        HdSDK.openWebview(target)
      } else if (ot === 4 || ot === 5) {
        HdSDK.openBrowser(target)
      } /* !ot || ot === 1 || ot === 2 */ else {
        win.open(target)
      }
    }
  },
  /**
   * 加载等待
   * @constructor
   */
  newLoading() {
    return new function () {
      const cover = doc.createElement('div')
      cover.style.cssText = 'position:fixed;display:flex;justify-content:center;align-items:center;font-size:1.4rem;z-index:100;top:0;height:100vh;width:100vw;background:white'
      const bg = new Image()
      bg.src = require('../assets/loading.webp')
      cover.appendChild(bg)
      doc.body.appendChild(cover)

      this.close = function () {
        cover.remove()
      }
    }
  }
}

// 上报一次浏览行为
const reportTmlView = () => {
  sendEvent({ tag: "h5", eid: 'tmlView' })
}

let fetchTimes = 0
let load = HdAd.newLoading()

function fetchCl() {
  ++fetchTimes
  request('/v1/spin/cl').then((res) => {
    load.close()
    load = null
    clData = res
    if (HdSDK.isPreloadWv()) {
      HdSDK.addEventListener("wv.resume", reportTmlView, { once: true })
    } else {
      const checkTmlView = () => {
        if (doc.visibilityState === 'visible' && win.outerWidth > 0) {
          doc.removeEventListener('visibilitychange', checkTmlView)
          win.removeEventListener('resize', checkTmlView)
          reportTmlView()
        }
      }
      doc.addEventListener("visibilitychange", checkTmlView)
      win.addEventListener('resize', checkTmlView)
      checkTmlView()
    }
    HdSDK.jsLoaded()
    if (reqData.ml === "1") {
      // 屏蔽预加载模式
      // 主动派发 wv.resume 事件
      win.sdk.onMessage({ type: "wv.resume" })
    }
    for (const resolve of readyCallbacks) {
      resolve(clData.meta)
    }
    readyCallbacks = []
    // preload campaign and endcard
    const { cs } = clData
    if (cs) {
      const imgs = new Set()
      const urls = new Set()
      for (const c of cs) {
        if (!c.act) {
          c.act = "Get Gift"
        }
        imgs.add(c.img)
        imgs.add(c.icon)
        if (c.ec) {
          const { url, img, ext } = c.ec
          urls.add(url)
          imgs.add(img)
          if (ext) {
            c.ec.ext = typeof ext === 'string' ? JSON.parse(ext) : ext
          } else {
            c.ec.ext = {}
          }
        }
      }
      for (const src of imgs) {
        if (src) new Image().src = src
      }
      for (const url of urls) {
        if (url) {
          fetch(url).catch((e) => {
            console.error(`load url: ${url} failed`, e)
            sendEvent({ tag: "h5", eid: "loadRsErr", data: { err: e.toString(), url } })
          })
        }
      }
    }
  }).catch((e) => {
    console.error(e)
    const err = e.toString()
    sendEvent({ tag: "h5", eid: "clerr", data: { err } })
    HdSDK.pageError({ err })

    if (HdSDK.isPreloadWv()) {
      // 最多尝试 4 次
      const delay = [ 0, 5e3, 6e4, 6e5 ]
      if (fetchTimes < delay.length) {
        HdSDK.removeEventListener("wv.resume", reportTmlView)
        setTimeout(fetchCl, delay[fetchTimes])
        sendEvent({ tag: "h5", eid: "delayCl" + fetchTimes })
      } else {
        sendEvent({ tag: "h5", eid: "giveupCl" })
      }
    }
  })
}

fetchCl()
win.HdAd = HdAd
export { HdAd }
