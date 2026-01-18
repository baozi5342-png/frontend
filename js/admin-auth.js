// ===== 后台登录认证（前端） =====

// 登录
function login() {
  const token = document.getElementById("tokenInput").value.trim();

  if (!token) {
    alert("请输入 Admin Token");
    return;
  }

  // 保存到本地（只在浏览器里）
  localStorage.setItem("ADMIN_TOKEN", token);

  // 跳转到后台主页（暂时是 admin.html）
  window.location.href = "admin.html";
}

// 页面加载时，如果已经登录过，自动跳转
(function autoRedirect() {
  const token = localStorage.getItem("ADMIN_TOKEN");
  if (token) {
    // 已有 token，直接进后台
    window.location.href = "admin.html";
  }
})();
