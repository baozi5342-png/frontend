// /js/config.js
// 你的 Render 后端地址（例：https://xxx.onrender.com）
window.API_BASE_URL = "https://YOUR_RENDER_BACKEND_URL";

// 统一封装请求
window.apiFetch = async function apiFetch(path, options = {}) {
  const url = `${window.API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // 如果你后端需要 token，就从 localStorage 带上
  const sessionToken = localStorage.getItem("sessionToken");
  if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
};

// 常用：取当前用户
window.getCurrentUser = function getCurrentUser() {
  return {
    sessionToken: localStorage.getItem("sessionToken"),
    userId: localStorage.getItem("userId"),
    username: localStorage.getItem("username"),
    email: localStorage.getItem("email")
  };
};
