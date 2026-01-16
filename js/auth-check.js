// /js/auth-check.js
(function () {
  const { sessionToken } = window.getCurrentUser();

  const loginPrompt = document.getElementById("loginPrompt");
  // 兼容不同页面的内容容器命名
  const content =
    document.getElementById("tradeContent") ||
    document.getElementById("marketsContent") ||
    document.getElementById("assetsContent") ||
    document.getElementById("accountContent") ||
    document.getElementById("homeContent");

  // 没有登录态：显示提示、隐藏内容
  if (!sessionToken) {
    if (loginPrompt) loginPrompt.style.display = "block";
    if (content) content.style.display = "none";
    return;
  }

  // 有登录态：隐藏提示、显示内容
  if (loginPrompt) loginPrompt.style.display = "none";
  if (content) content.style.display = "block";
})();
