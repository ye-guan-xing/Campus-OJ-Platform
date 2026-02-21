// 导入Vite核心方法、Vue插件、路径模块
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// 导出Vite配置（支持环境模式动态配置）
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VUE_APP_");

  // 提取环境变量（添加默认值避免undefined）
  const VUE_APP_BASE_API = env.VUE_APP_BASE_API || "/api";
  const VUE_APP_PROXY_TARGET = env.VUE_APP_PROXY_TARGET; // 兜底默认值

  // 打印环境变量（调试用，上线可注释）
  console.log("=== 环境变量验证 ===");
  console.log("VUE_APP_BASE_API:", VUE_APP_BASE_API);
  console.log("VUE_APP_PROXY_TARGET:", VUE_APP_PROXY_TARGET);

  // 返回最终配置
  return {
    // 插件：启用Vue单文件组件支持
    plugins: [vue()],

    // 路径解析配置
    resolve: {
      // 别名配置：@ 指向 src 目录
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // 省略文件后缀名（导入时无需写.vue/.js等）
      extensions: [".js", ".vue", ".scss", ".css", ".json"],
    },

    // CSS预处理器配置（SCSS）
    css: {
      preprocessorOptions: {
        scss: {
          // 使用现代API，消除过时警告
          api: "modern",
          // 静默指定类型的弃用警告
          silenceDeprecations: [
            "import",
            "global-builtin",
            "color-functions",
            "legacy-js-api",
          ],
          // 全局注入SCSS变量（所有SCSS文件可直接用variables.scss里的变量）
          additionalData: `@use "@/assets/styles/variables.scss" as *;`,
        },
      },
    },

    // 开发服务器配置
    server: {
      port: 8081, // 前端启动端口
      open: true, // 启动后自动打开浏览器
      proxy: {
        // 接口代理：匹配VUE_APP_BASE_API前缀的请求
        [VUE_APP_BASE_API]: {
          target: VUE_APP_PROXY_TARGET, // 后端接口地址
          changeOrigin: true, // 开启跨域代理（关键）
          ws: false, // 关闭WebSocket代理（若无实时通讯需求）
          logLevel: "debug", // 打印代理日志（调试用）
          // 简化rewrite逻辑：保留/api前缀（若后端无需前缀，改为 path.replace(/^\/api/, '')）
          rewrite: (path) => path,
        },
      },
    },

    // 构建配置（生产打包）
    build: {
      sourcemap: false, // 关闭生产环境sourcemap（减小包体积）
      rollupOptions: {
        // 代码分割：拆分第三方依赖包，优化加载速度
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router", "vuex"], // 基础Vue生态
            element: ["element-plus"], // Element Plus组件库
            editor: ["monaco-editor", "@monaco-editor/loader"], // 代码编辑器
          },
        },
      },
    },

    // 环境变量前缀：Vite默认只识别VITE_，手动添加VUE_APP_兼容Vue CLI习惯
    envPrefix: ["VUE_APP_", "VITE_"],

    // 全局变量定义：兼容process.env写法（Vue CLI迁移项目用）
    define: {
      "process.env": JSON.stringify(env),
    },
  };
});
