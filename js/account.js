// /js/account.js
function $(id) { return document.getElementById(id); }

(function initAccount() {
  const u = window.getCurrentUser();
  const nameEl = $("username");
  if (nameEl && u.username) nameEl.textContent = u.username;

  // 退出（你页面里一般是按钮/列表项，这里给全局函数，方便你绑定 onclick）
  window.doLogout = function () {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    window.location.href = "login.html";
  };

  // Basic/Advanced KYC：MVP 用 prompt 收集，提交后端保存
  window.submitBasicKyc = async function () {
    try {
      const fullName = prompt("Full Name:");
      const idNo = prompt("ID Number:");
      if (!fullName || !idNo) return;

      const r = await window.apiFetch("/api/kyc/basic", {
        method: "POST",
        body: JSON.stringify({ fullName, idNo })
      });
      if (!r.ok) throw new Error(r.data?.message || "Submit failed");
      alert("Submitted. Waiting for review.");
    } catch (e) {
      alert(e.message);
    }
  };

  window.submitAdvancedKyc = async function () {
    try {
      const note = prompt("Advanced verification note (optional):") || "";
      const r = await window.apiFetch("/api/kyc/advanced", {
        method: "POST",
        body: JSON.stringify({ note })
      });
      if (!r.ok) throw new Error(r.data?.message || "Submit failed");
      alert("Submitted. Waiting for review.");
    } catch (e) {
      alert(e.message);
    }
  };
})();
