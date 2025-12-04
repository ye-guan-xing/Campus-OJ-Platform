// vue.config.js
const VUE_APP_BASE_API = process.env.VUE_APP_BASE_API || "/api";
const VUE_APP_PROXY_TARGET = process.env.VUE_APP_PROXY_TARGET;

module.exports = {
  devServer: {
    port: 8081,
    open: true,
    proxy: {
      [VUE_APP_BASE_API]: {
        target: VUE_APP_PROXY_TARGET,
        changeOrigin: true,
        pathRewrite: { [`^${VUE_APP_BASE_API}`]: "" },
        // 注释掉WebSocket配置（如果有），或显式关闭ws
        ws: false, // 关键：关闭WebSocket代理，避免冲突
      },
    },
  },
  productionSourceMap: false,
};
