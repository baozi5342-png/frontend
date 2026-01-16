// /js/assets.js
function $(id) { return document.getElementById(id); }

function requireUserId() {
  const u = window.getCurrentUser();
  if (!u.userId) throw new Error("Missing userId, please login again.");
  return Number(u.userId);
}

function money(n) {
  return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function loadWallet() {
  const userId = requireUserId();
  const r = await window.apiFetch(`/api/wallet/${userId}`, { method: "GET" });
  if (!r.ok) return;

  const w = r.data.wallet;
  const balance = Number(w.balance || 0);
  const frozen = Number(w.frozen || 0);
  const total = balance + frozen;

  if ($("totalAssets")) $("totalAssets").textContent = money(total);
  if ($("lockedAmount")) $("lockedAmount").textContent = money(frozen);
  if ($("availableBalance")) $("availableBalance").textContent = money(balance);
  if ($("wealthAssets")) $("wealthAssets").textContent = money(0);

  // 你资产列表如果后面要做多币种，可以扩展 /api/assets 明细
}

window.showDepositModal = function () {
  const m = $("depositModal");
  if (m) m.style.display = "flex";
};
window.closeDepositModal = function () {
  const m = $("depositModal");
  if (m) m.style.display = "none";
};

window.showWithdrawModal = function () {
  const m = $("withdrawModal");
  if (m) m.style.display = "flex";
};
window.closeWithdrawModal = function () {
  const m = $("withdrawModal");
  if (m) m.style.display = "none";
};

// MVP：Deposit 直接走后端“模拟入金”
window.submitDeposit = async function () {
  try {
    const userId = requireUserId();
    const amtEl = document.querySelector("#depositModal input[type='number']");
    const amount = Number(amtEl?.value || 0);
    if (!amount || amount <= 0) throw new Error("Enter amount.");

    const r = await window.apiFetch("/api/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({ userId, amount })
    });
    if (!r.ok) throw new Error(r.data?.message || "Deposit failed");

    alert("Deposit success");
    window.closeDepositModal();
    await loadWallet();
  } catch (e) {
    alert(e.message);
  }
};

// Withdraw：先做“申请记录”，后面再接真实链上/审核
window.submitWithdraw = async function () {
  try {
    const userId = requireUserId();
    const amountEl = document.querySelector("#withdrawModal input[type='number']");
    const addrEl = document.querySelector("#withdrawModal input[type='text']");
    const amount = Number(amountEl?.value || 0);
    const address = (addrEl?.value || "").trim();
    if (!amount || amount <= 0) throw new Error("Enter amount.");
    if (!address) throw new Error("Enter address.");

    const r = await window.apiFetch("/api/withdraw/request", {
      method: "POST",
      body: JSON.stringify({ userId, amount, address })
    });
    if (!r.ok) throw new Error(r.data?.message || "Withdraw failed");

    alert("Withdraw request submitted");
    window.closeWithdrawModal();
    await loadWallet();
  } catch (e) {
    alert(e.message);
  }
};

(async function init() {
  await loadWallet();
})();
