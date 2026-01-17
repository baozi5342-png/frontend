// js/auth-check.js
(function () {
  const userId = localStorage.getItem("userId");
  const loginPrompt = document.getElementById("loginPrompt");
  const tradeContent = document.getElementById("tradeContent");

  // 未登录：显示提示
  if (!userId) {
    if (loginPrompt) loginPrompt.style.display = "block";
    if (tradeContent) tradeContent.style.display = "none";
    return;
  }

  // 已登录：显示交易内容
  if (loginPrompt) loginPrompt.style.display = "none";
  if (tradeContent) tradeContent.style.display = "block";
})();
