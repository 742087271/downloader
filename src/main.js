import Vue from "vue";
import App from "./App.vue";
import { HdSDK } from "../utils/hdsdk";

Vue.config.productionTip = false;
Vue.prototype.HdSDK = HdSDK;
if (HdSDK.isSdk() && !HdSDK.getBasicFields().igp) {
  const win = window;
  // 自定义id容器
  const rootDom = document.createElement("div");
  rootDom.id = "downloader";

  win.addEventListener("load", () => {
    document.body.appendChild(rootDom);
    win.vm = new Vue({
      render: (h) => h(App),
    }).$mount("#downloader");
  });

  // 动态加载css样式
  const style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = ``;
  document.head.appendChild(style);
}
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
