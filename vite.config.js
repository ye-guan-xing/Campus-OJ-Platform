import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig(({ mode }) => {
  // 加载环境变量：第三个参数是前缀，加载 VUE_APP_ 开头的变量
  const env = loadEnv(mode, process.cwd(), "VUE_APP_");
  const VUE_APP_BASE_API = env.VUE_APP_BASE_API || "/api";
  const VUE_APP_PROXY_TARGET = env.VUE_APP_PROXY_TARGET;

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
      port: 5057,
      open: true,
      proxy: {
        [VUE_APP_BASE_API]: {
          target: VUE_APP_PROXY_TARGET, // 后端8080地址
          changeOrigin: true, // 必须开启，伪装Origin避免跨域
          ws: false,
          logLevel: "debug", 
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