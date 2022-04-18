// hd-sdk 1.0.1
const win = window;
const doc = document;
const { sdk } = win;

/**
 * @typedef BasicFields
 * @property {number} plat - platform
 * @property {number} ts - Timestamp in mill
 * @property {number} fit - First Install Time
 * @property {number} flt - First Launch Time
 * @property {string} tz - TimeZone
 * @property {number} zo - ZoneOffset
 * @property {string} session - SessionID
 * @property {string} uid - UserID
 * @property {string} did - DeviceID
 * @property {number} dtype - DeviceType 1 | 2 | 3
 * @property {string} lang - Language Code
 * @property {string} langname - Language Name
 * @property {number} jb - JailBreak
 * @property {string} bundle - bundle
 * @property {string} make - make
 * @property {string} brand - brand
 * @property {string} model - model
 * @property {number} os - OS, 0:iOS,1:Android
 * @property {string} osv - OS version
 * @property {number} dtype - DeviceType
 * @property {string} appk - AppKey
 * @property {string} appv - App version
 * @property {string} sdkv - SDK version
 * @property {number} width - screen width
 * @property {number} height - screen height
 * @property {number} contype - Connection Type
 * @property {string} carrier - carrier
 * @property {string} mccmnc - mccmnc
 * @property {string} lip - Local IP
 * @property {string} lcountry - Local Country
 * @property {number} fm - Free memory
 * @property {number} battery - battery
 * @property {number} btch - battery charging
 * @property {number} lowp - Low power mode
 * @property {number} btime - Booting time
 * @property {number} ram - ram
 * @property {number} vpn - vpn
 * @property {number} igp - In Google Play, 0:NO,1:YES
 */

/**
 * @typedef Placement
 * @property {number} id - placementID
 * @property {number} type - AdType
 * @property {string} link - link
 * @property {string} tml - template url
 * @property {any[]} crs - Creatives
 */

/**
 * EventTarget
 * @type {EventTarget}
 * @private
 */
const _et = doc.createElement("a");

const HdSDK = {
  isSdk() {
    return !!(sdk && sdk.getBasicFields);
  },
  /**
   * 是否是新版预加载模式的 SDK
   * @returns {boolean}
   */
  isPreloadWv() {
    return this.isSdk() && !!sdk.jsLoaded;
  },
  /**
   * 通知 SDK, js 已加载完成
   */
  jsLoaded() {
    if (this.isPreloadWv()) {
      sdk.jsLoaded();
    }
  },
  /**
   * 通知 SDK, impr click
   * @param {string} type
   */
  onUserInteraction(type) {
    if (sdk && sdk.onUserInteraction) {
      sdk.onUserInteraction(type);
    }
  },
  /**
   * 通知 SDK, 页面加载错误
   */
  pageError(err) {
    if (this.isPreloadWv()) {
      sdk.pageError(JSON.stringify(err));
    }
  },
  /**
   * 注册事件监听
   * @param {'wv.resume'|'wv.pause'} type
   * @param listener
   * @param options
   */
  addEventListener(type, listener, options) {
    let l = listener;
    if (options && options.once) {
      l = (e) => {
        _et.removeEventListener(type, l);
        listener.apply(_et, [e]);
      };
    }
    _et.addEventListener(type, l, options);
  },
  removeEventListener(type, listener, options) {
    _et.removeEventListener(type, listener, options);
  },
  /**
   * 获取基础参数
   * @return {BasicFields}
   */
  getBasicFields() {
    if (!this.bfs) {
      this.bfs = JSON.parse(sdk.getBasicFields());
    }
    return { ...this.bfs };
  },
  /**
   * 获取广告位信息
   * @return {Placement}
   */
  getPlacement() {
    return JSON.parse(sdk.getPlacement());
  },
  pushEvent(e) {
    if (this.isSdk()) {
      sdk.pushEvent(JSON.stringify(e));
    }
  },
  setCloseVisible(v) {
    sdk.setCloseVisible(v);
  },
  close() {
    sdk.close();
    if (this.compareSdkv("1.4.2") < 0) {
      win.location.replace(this.getPlacement().link);
    }
  },
  openWebview(url) {
    const isSDK = this.isSdk();
    const isOldSDK = !isSDK && win.sdk && win.sdk.openBrowser; // AdTiming SDK
    if (isSDK || isOldSDK) {
      sdk.openWebview(url);
    } else {
      win.open(url);
    }
  },
  openBrowser(url) {
    sdk.openBrowser(url);
  },
  getDownloadApps(opt = {}) {
    const v = sdk.getDownloadApps(JSON.stringify(opt));
    return (v && JSON.parse(v)) || [];
  },
  openApp(appId) {
    sdk.openApp(appId);
  },
  installApp(appId) {
    sdk.installApp(appId);
  },
  reDownload(appId) {
    sdk.reDownload(appId);
  },
  /**
   * 版本比较
   * @param {string} a - version a
   * @param {string} b - version b
   * @return {number} -1: a < b, 0: a = b, 1: a > b
   */
  compareVersion(a, b) {
    const r1 = a.split(".");
    const r2 = b.split(".");
    let i = 0;
    while (i < r1.length && i < r2.length) {
      const n1 = parseInt(r1[i]);
      const n2 = parseInt(r2[i]);
      if (n1 > n2) {
        return 1;
      } else if (n1 < n2) {
        return -1;
      }
      ++i;
    }
    if (r1.length > r2.length) {
      return 1;
    } else if (r1.length < r2.length) {
      return -1;
    }
    return 0;
  },
  /**
   * SDK 版本比较
   * @param {string} sdkv - version
   * @return {number} -1: SDK < sdkv, 0: SDK = sdkv, 1: SDK > sdkv
   */
  compareSdkv(sdkv) {
    return this.compareVersion(this.getBasicFields().sdkv, sdkv);
  },
};

if (sdk) {
  const lastClickPos = {
    x: 0,
    y: 0,
  };
  win.addEventListener("touchstart", (e) => {
    const t = e.touches.item(0);
    lastClickPos.x = t.clientX;
    lastClickPos.y = t.clientY;
  });

  sdk.onMessage = (data) => {
    const { type } = data;
    delete data.type;
    const ev = doc.createEvent("Event");
    ev.initEvent(type, true, false);
    Object.assign(ev, data);
    if (type === "dl.start") {
      Object.assign(ev, lastClickPos);
    }
    _et.dispatchEvent(ev);
  };
}

win.HdSDK = HdSDK;
export { HdSDK };
