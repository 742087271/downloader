import App from "./App.vue";

const components = {
  // 通过install来安装组件
  install(Vue) {
    Vue.component("xxBtn", App);
  },
};

// 注意这里的判断，很重要
if (typeof windwo !== "undefined" && window.Vue) {
  window.Vue.use(App);
}

// 导出组件库
export default components;
