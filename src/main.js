// main.js 完整配置
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 1. 引入Element Plus核心库
import ElementPlus from "element-plus";
// 2. 引入Element Plus样式（必须）
import "element-plus/dist/index.css";
// 3. 引入Element Plus图标（可选，若用图标需加）
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);

// 全局注册Element Plus
app.use(ElementPlus);
// 全局注册图标（可选）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(store);
app.use(router);
app.mount("#app");
