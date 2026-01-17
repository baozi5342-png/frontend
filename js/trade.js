// js/trade.js
(function () {
  const API_BASE = window.CONFIG?.API_BASE;
  if (!API_BASE) {
    alert("config.js 没有设置 API_BASE");
    return;
  }

  const userId = localStorage.getItem("userId");

  const pairSelect = document.getElementById("tradingPairSelect");
  const currentPriceEl = document.getElementById("currentPrice");
  const priceChangeEl = document.getElementById("priceChange");
  const balanceEl = document.getElementById("balance");
  const amountInput = document.getElementById("tradeAmount");
  const estimatedTotalEl = document.getElementById("estimatedTotal");
  const estimatedFeeEl = document.getElementById("estimatedFee");
  const expiryOptionsEl = document.getElementById("expiryOptions");
  const recentOrdersEl = document.getElementById("recentOrders");
  const chartUpdateEl = document.getElementById("chartUpdate");

  let coins = [];
  let products = [];
  let selectedSymbol = "";
  let selectedProductId = null;
  let selectedPayout = 0;

  // ========= 工具 =========
  function fmt(n, d = 2) {
    const x = Number(n);
    if (Number.isNaN(x)) return "-";
    return x.toFixed(d);
  }

  function showToast(msg) {
    alert(msg);
  }

  function getAmount() {
    const v = Number(amountInput.value);
    return Number.isFinite(v) ? v : 0;
  }

  // trade.html 里按钮调用 setAmount()
  window.setAmount = function (v) {
    if (v === "all") {
      // 用余额（USDT）
      const b = Number((balanceEl?.textContent || "0").replace(/[^\d.]/g, ""));
      amountInput.value = String(Number.isFinite(b) ? b : 0);
    } else {
      amountInput.value = String(v);
    }
    updateSummary();
  };

  function updateSummary() {
    const amt = getAmount();
    const fee = amt * 0.001; // 0.1%
    estimatedTotalEl.textContent = fmt(amt, 2);
    estimatedFeeEl.textContent = fmt(fee, 2);
  }

  amountInput.addEventListener("input", updateSummary);

  // ========= API =========
  async function apiGet(path) {
    const r = await fetch(`${API_BASE}${path}`);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || "Request failed");
    return j;
  }

  async function apiPost(path, body) {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || "Request failed");
    return j;
  }

  // ========= 加载币种 / 价格 =========
  async function loadCoins() {
    const data = await apiGet("/api/market/coins");
    coins = Array.isArray(data) ? data : data.data || [];
    if (!coins.length) {
      pairSelect.innerHTML = `<option value="">No coins</option>`;
      return;
    }

    pairSelect.innerHTML = coins
      .map(c => `<option value="${c.symbol}">${c.symbol}</option>`)
      .join("");

    selectedSymbol = coins[0].symbol;
    pairSelect.value = selectedSymbol;

    renderPrice();
  }

  function renderPrice() {
    const c = coins.find(x => x.symbol === selectedSymbol);
    if (!c) return;
    currentPriceEl.textContent = `$${fmt(c.current_price, 2)}`;
    const chg = Number(c.price_change || 0);
    priceChangeEl.textContent = `${chg >= 0 ? "+" : ""}${fmt(chg, 2)}%`;
    priceChangeEl.className = `change-value ${chg >= 0 ? "positive" : "negative"}`;
  }

  pairSelect.addEventListener("change", () => {
    selectedSymbol = pairSelect.value;
    renderPrice();
  });

  async function refreshCoins() {
    try {
      const data = await apiGet("/api/market/coins");
      coins = Array.isArray(data) ? data : data.data || [];
      renderPrice();
      if (chartUpdateEl) chartUpdateEl.textContent = new Date().toLocaleTimeString();
    } catch (e) {
      // 静默
    }
  }

  // ========= 秒合约产品 =========
  async function loadProducts() {
    const data = await apiGet("/api/contract/products");
    products = Array.isArray(data) ? data : data.data || [];

    if (!products.length) {
      expiryOptionsEl.innerHTML = `<div style="color:#8b93a7;">No contract products</div>`;
      return;
    }

    selectedProductId = products[0].id;
    selectedPayout = Number(products[0].payout_ratio || 0);

    expiryOptionsEl.innerHTML = products.map((p, idx) => {
      const active = idx === 0 ? "active" : "";
      return `
        <button class="expiry-btn ${active}" data-id="${p.id}" data-payout="${p.payout_ratio}">
          <div style="font-weight:700;">${p.seconds}s</div>
          <div style="font-size:12px; color:#8b93a7;">Profit ${fmt(p.payout_ratio * 100, 0)}%</div>
          <div style="font-size:12px; color:#8b93a7;">${fmt(p.min_amount,0)} - ${fmt(p.max_amount,0)}</div>
        </button>
      `;
    }).join("");

    expiryOptionsEl.querySelectorAll(".expiry-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        expiryOptionsEl.querySelectorAll(".expiry-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedProductId = Number(btn.dataset.id);
        selectedPayout = Number(btn.dataset.payout || 0);
      });
    });
  }

  // ========= 余额 / 订单 =========
  async function loadBalance() {
    if (!userId) return;
    const data = await apiGet(`/api/wallet/balance?userId=${encodeURIComponent(userId)}&currency=USDT`);
    balanceEl.textContent = fmt(data.balance || 0, 2);
  }

  async function loadRecentOrders() {
    if (!userId) return;
    const data = await apiGet(`/api/contract/orders?userId=${encodeURIComponent(userId)}`);
    const list = Array.isArray(data) ? data : data.data || [];

    if (!list.length) {
      recentOrdersEl.innerHTML = `<div style="color:#8b93a7;">No orders</div>`;
      return;
    }

    recentOrdersEl.innerHTML = list.map(o => {
      const st = o.status;
      const res = o.result || "-";
      return `
        <div class="order-item" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-weight:700;">${o.symbol} • ${o.direction}</div>
            <div style="color:#8b93a7;font-size:12px;">${new Date(o.created_at).toLocaleString()}</div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;color:#8b93a7;font-size:13px;">
            <div>Stake: ${fmt(o.stake,2)} USDT</div>
            <div>Payout: ${fmt(o.payout_ratio * 100,0)}%</div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;">
            <div style="color:#8b93a7;">Status: <span style="color:#e1e5ee;">${st}</span></div>
            <div style="color:#8b93a7;">Result: <span style="color:#e1e5ee;">${res}</span></div>
          </div>
        </div>
      `;
    }).join("");
  }

  // ========= 下单 =========
  window.executeTrade = async function (side) {
    if (!userId) {
      showToast("Please sign in first.");
      return;
    }
    if (!selectedProductId) {
      showToast("No contract product selected.");
      return;
    }

    const amount = getAmount();
    if (!amount || amount <= 0) {
      showToast("Please enter amount.");
      return;
    }

    const direction = side === "buy" ? "BUY" : "SELL";

    try {
      const r = await apiPost("/api/contract/order", {
        userId,
        symbol: selectedSymbol,
        direction,
        amount,
        productId: selectedProductId
      });

      showToast(`Order created: #${r.orderId}`);
      await loadBalance();
      await loadRecentOrders();
    } catch (e) {
      showToast(e.message);
    }
  };

  // ========= 初始化 =========
  async function init() {
    updateSummary();
    await loadCoins();
    await loadProducts();
    await loadBalance();
    await loadRecentOrders();

    // 轮询刷新价格/订单
    setInterval(refreshCoins, 2000);
    setInterval(loadRecentOrders, 3000);
  }

  init().catch(err => {
    console.error(err);
    showToast(err.message || "Init failed");
  });
})();
