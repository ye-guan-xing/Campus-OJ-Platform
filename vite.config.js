<<<<<<< HEAD
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
=======
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { viteMockServe } from "vite-plugin-mock";

export default defineConfig(({ command, mode }) => {
  // const env = loadEnv(mode, process.cwd(), ["VUE_APP_", "VITE_"]);
  // console.log("当前环境变量 VITE_USE_MOCK:", env.VITE_USE_MOCK); // 调试日志
  // console.log("当前环境变量 VITE_USE_MOCK 类型:", typeof env.VITE_USE_MOCK); // 调试日志

  const env = loadEnv(mode, process.cwd(), ["VUE_APP_", "VITE_"]);
  const VUE_APP_BASE_API = env.VUE_APP_BASE_API || "/api";
  const VUE_APP_PROXY_TARGET = env.VUE_APP_PROXY_TARGET;
  const VITE_USE_MOCK = (env.VITE_USE_MOCK || "false").trim() === "true"; // 读取 Mock 开关
  // console.log("最终 Mock 开关状态:", VITE_USE_MOCK); // 调试日志

  return {
    plugins: [
      vue(),
      viteMockServe({
        mockPath: "src/mock", // mock文件存放目录
        enable: VITE_USE_MOCK, // 通用开关（新版插件可能使用此字段）
        localEnabled: command === "serve" && VITE_USE_MOCK, // 开发环境
        prodEnabled: command !== "serve" && VITE_USE_MOCK, // 生产环境
        supportTs: false, // 是否支持 TS
        watchFiles: true, // 监听文件变化
        logger: true, // 输出日志
        injectCode: `
          import { setupProdMockServer } from './mockProdServer';
          setupProdMockServer();
        `,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".js", ".vue", ".scss", ".css", ".json"],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
          silenceDeprecations: [
            "import",
            "global-builtin",
            "color-functions",
            "legacy-js-api",
          ],
          additionalData: `@use "@/assets/styles/variables.scss" as *;`,
        },
      },
    },
    server: {
      port: 5057,
      open: true,
      proxy: {
        // 当 Mock 开启时，让 Mock 插件处理请求；否则代理到后端
        [VUE_APP_BASE_API]: {
          target: VUE_APP_PROXY_TARGET, // 后端8080地址
          changeOrigin: true, // 必须开启，伪装Origin避免跨域
          ws: false,
          logLevel: "debug",
          bypass: (req, res, options) => {
            // 如果开启了 Mock 且请求路径匹配 Mock 规则，则不走代理
            if (VITE_USE_MOCK && req.url.startsWith(VUE_APP_BASE_API)) {
              return req.url; // 返回请求路径，让 vite-plugin-mock 拦截
            }
          },
        },
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router", "vuex"],
            element: ["element-plus"],
            editor: ["monaco-editor", "@monaco-editor/loader"],
          },
        },
      },
    },
    envPrefix: ["VUE_APP_", "VITE_"],
    define: {
      "process.env": JSON.stringify(env),
    },
  };
});
>>>>>>> 046ac67a20409f8a754c8ee24bba851179f9a0bd
