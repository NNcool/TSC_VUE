// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App";
import router from "./router";
import axios from "axios";

Vue.config.productionTip = false;
Vue.use(ElementUI);
const axiosInstance = axios.create({
  baseURL: "http://localhost:9001" // 后端的地址
  // 其他配置选项
});

Vue.prototype.$axios = axiosInstance;

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
