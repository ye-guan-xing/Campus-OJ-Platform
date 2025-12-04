<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">OJ-Platform</router-link>
      </div>

      <!-- 主要导航菜单（分普通/管理员） -->
      <div class="navbar-menu">
        <!-- 公共导航项 -->
        <router-link
          to="/problems"
          class="navbar-item"
          active-class="navbar-item-active"
        >
          题目列表
        </router-link>
        <router-link
          to="/submissions"
          class="navbar-item"
          active-class="navbar-item-active"
        >
          提交记录
        </router-link>

        <!-- 登录后显示的用户导航项 -->
        <template v-if="isLoggedIn">
          <router-link
            to="/user/profile"
            class="navbar-item"
            active-class="navbar-item-active"
          >
            个人中心
          </router-link>
          <router-link
            to="/user/setting"
            class="navbar-item"
            active-class="navbar-item-active"
          >
            账号设置
          </router-link>

          <!-- 管理员专属导航项 -->
          <router-link
            v-if="isAdmin"
            to="/admin/problems"
            class="navbar-item admin-item"
            active-class="navbar-item-active"
          >
            管理后台
          </router-link>
        </template>
      </div>

      <div class="navbar-user">
        <!-- 登录状态显示 -->
        <div v-if="isLoggedIn" class="user-info">
          <span class="user-greeting">欢迎, {{ username }}</span>
          <span v-if="isAdmin" class="admin-tag">管理员</span>
        </div>
        <router-link v-else to="/login" class="btn btn-primary">
          登录
        </router-link>
        <button v-if="isLoggedIn" @click="logout" class="btn btn-danger">
          退出
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { computed } from "vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const store = useStore();

// 登录状态判断
const isLoggedIn = computed(() => {
  return (
    typeof store.state.user.token === "string" &&
    store.state.user.token.trim() !== ""
  );
});

// 用户名
const username = computed(() => {
  return store.state.user.userInfo?.username || "用户";
});

// 判断是否是管理员（适配roles为字符串）
const isAdmin = computed(() => {
  // 先获取roles值（从store中取）
  const roles = store.state.user.userInfo?.roles;

  // 无roles字段直接返回false
  if (!roles) return false;

  // 处理字符串类型的roles
  if (typeof roles === "string") {
    // 兼容单个角色（如"admin"）或逗号分隔的多角色（如"admin,user"）
    return roles.includes("admin");
  }

  // 其他情况（如意外的数组/其他类型）返回false
  return false;
});

// 调试打印（适配字符串类型）
console.log("用户信息：", store.state.user.userInfo);
console.log("用户角色（字符串）：", store.state.user.userInfo?.roles);

const logout = async () => {
  try {
    await store.dispatch("user/logout");
    ElMessage.success("退出登录成功");
  } catch (error) {
    ElMessage.error(error.message || "退出登录失败，请重试");
  } finally {
    router.push("/login");
  }
};
</script>

<style scoped>
.navbar {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.brand-link {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
}
.brand-link:hover {
  color: #556bda;
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.navbar-item {
  color: #333;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all 0.3s;
  position: relative;
}
.navbar-item-active {
  color: #667eea;
  font-weight: 500;
}
.navbar-item-active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #667eea;
}
.navbar-item:hover {
  color: #667eea;
}

/* 管理员项特殊样式 */
.admin-item {
  color: #e63946;
}
.admin-item-active {
  color: #e63946;
}
.admin-item-active::after {
  background-color: #e63946;
}
.admin-item:hover {
  color: #d62828;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user-greeting {
  color: #333;
  font-size: 0.95rem;
}

.admin-tag {
  background-color: #e63946;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.95rem;
  transition: opacity 0.3s;
}
.btn:hover {
  opacity: 0.9;
}
.btn-primary {
  background-color: #667eea;
  color: white;
}
.btn-danger {
  background-color: #dc3545;
  color: white;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .navbar-menu {
    gap: 1rem;
  }
  .navbar-item {
    font-size: 0.85rem;
  }
  .user-greeting {
    font-size: 0.85rem;
  }
  .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .navbar-menu {
    gap: 0.8rem;
  }
  .admin-tag {
    display: none; /* 小屏幕隐藏管理员标签 */
  }
}
</style>
