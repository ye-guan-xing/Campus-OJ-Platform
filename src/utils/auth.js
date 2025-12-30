const TOKEN_KEY = "oj_user_token";

//获取token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

//存储Token
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

//移除 token
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

//检查是否已登录
export function inAuthenticated() {
  return !!getToken();
}
