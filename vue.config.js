const VUE_APP_BASE_API = process.env.VUE_APP_BASE_API; // 现在是 '/api'
const VUE_APP_PROXY_TARGET = process.env.VUE_APP_PROXY_TARGET; // 现在是 'http://10.245.30.86:8080'

module.exports = {
  css: {
    loaderOptions: {
      sass: {},
    },
  },
  devServer: {
    port: 8081,
    open: true,
    proxy: {
      // 代理所有以 /api 开头的请求
      [VUE_APP_BASE_API]: {
        target: VUE_APP_PROXY_TARGET,
        changeOrigin: true,
        // 因为我们的后端接口路径有/api，所以不需要重写，直接转发过去
        // 如果后端接口没有/api，那么需要重写去掉/api
        // 这里后端有/api，所以不重写，即保留/api
        pathRewrite: {
          [`^${VUE_APP_BASE_API}`]: VUE_APP_BASE_API, // 将/api重写为/api，相当于不变
        },
        ws: false,
      },
    },
  },
  productionSourceMap: false,
};
