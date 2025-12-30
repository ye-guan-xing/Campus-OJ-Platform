import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv("development", process.cwd());
  const VUE_APP_BASE_API = env.VUE_APP_BASE_API || "/api";
  const VUE_APP_PROXY_TARGET = env.VUE_APP_PROXY_TARGET;

  // console.log("=== 环境变量验证 ===");
  // console.log("VUE_APP_BASE_API:", VUE_APP_BASE_API);
  // console.log("VUE_APP_PROXY_TARGET:", VUE_APP_PROXY_TARGET); // 现在应输出正确地址

  return {
    plugins: [vue()],
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
      port: 8081,
      open: true,
      proxy: {
        [VUE_APP_BASE_API]: {
          target: VUE_APP_PROXY_TARGET, // 现在有有效值，不会报错
          changeOrigin: true,
          ws: false,
          // 修复正则转义 + 保留/api前缀
          rewrite: (path) => {
            const escapedApi = VUE_APP_BASE_API.replace(/\//g, "\\/");
            const reg = new RegExp(`^${escapedApi}`);
            return path.replace(reg, VUE_APP_BASE_API);
          },
          logLevel: "debug", // 打印代理日志
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
