<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>OJ平台登录</h2>
        <p>欢迎回来，请登录您的账号</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="formData"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="el-icon-user"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="el-icon-lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? "登录中..." : "登录" }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>还没有账号？<a href="#" @click="handleRegister">立即注册</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const store = useStore();

const loading = ref(false);
const formData = reactive({
  username: "",
  password: "",
});
const loginFormRef = ref(null);

const loginRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度在 3 到 20 个字符",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  if (loading.value) return;
  try {
    loading.value = true;
    await loginFormRef.value.validate();
    // 1. 登录
    await store.dispatch("user/login", {
      username: formData.username,
      password: formData.password,
    });
    // 2. 关键：登录后调用getInfo，获取包含roles的完整用户信息！
    const userInfo = await store.dispatch("user/getInfo");
    ElMessage.success(`登录成功，欢迎您，${userInfo.username}！`);
    const redirect = route.query.redirect || "/home";
    router.push(redirect);
  } catch (error) {
    ElMessage.error(error.message || "登录失败，请检查用户名和密码");
  } finally {
    loading.value = false;
  }
};

const handleRegister = () => {
  ElMessage.info("注册功能开发中...");
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}
.login-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
}
.login-header p {
  color: #666;
  font-size: 14px;
}
.login-form {
  margin-bottom: 20px;
}
.login-btn {
  width: 100%;
  margin-top: 10px;
}
.login-footer {
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 20px;
}
.login-footer p {
  color: #666;
  font-size: 14px;
}
.login-footer a {
  color: #409eff;
  text-decoration: none;
}
.login-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    margin: 20px;
    padding: 30px 20px;
  }
}
</style>
