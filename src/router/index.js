import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import store from "@/store";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ? savedPosition : { top: 0 };
  },
});

// 白名单
const whiteList = ["/login"];

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - OJ平台`;
  }

  const hasToken = store.getters.token;

  if (hasToken) {
    if (to.path === "/login") {
      next({ path: "/" });
    } else {
      const hasUserInfo = store.getters.userInfo;
      if (hasUserInfo) {
        // 管理员权限判断（适配roles数组）
        if (to.meta.requiresAdmin) {
          const isAdmin = store.getters.userInfo.roles?.includes("admin");
          isAdmin ? next() : next({ path: "/" });
        } else {
          next();
        }
      } else {
        try {
          await store.dispatch("user/getInfo");
          // 再次验证管理员权限
          if (
            to.meta.requiresAdmin &&
            !store.getters.userInfo.roles?.includes("admin")
          ) {
            next({ path: "/" });
          } else {
            next();
          }
        } catch (error) {
          await store.dispatch("user/resetToken");
          next(`/login?redirect=${to.path}`);
        }
      }
    }
  } else {
    whiteList.includes(to.path) ? next() : next(`/login?redirect=${to.path}`);
  }
});

export default router;
