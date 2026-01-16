// /js/trade.js
let currentSymbol = "BTCUSDT";
let selectedDurationSec = 30; // 默认30秒
let priceTimer = null;

function $(id) { return document.getElementById(id); }

function requireUserId() {
  const { userId } = window.getCurrentUser();
  if (!userId) throw new Error("Missing userId, please login again.");
  return Number(userId);
}

// 交易对（你后面要扩展币种，就在这里加）
const SYMBOLS = [
  { label: "BTC/USDT", value: "BTCUSDT" },
  { label: "ETH/USDT", value: "ETHUSDT" },
  { label: "SOL/USDT", value: "SOLUSDT" }
];

// 秒合约到期选项（你页面写了“动态加载秒合约配置” :contentReference[oaicite:17]{index=17}）
const EXPIRY_OPTIONS = [
  { sec: 30, profit: "95%" },
  { sec: 60, profit: "95%" },
  { sec: 120, profit: "95%" },
  { sec: 300, profit: "95%" }
];

function renderSymbols() {
  const sel = $("tradingPairSelect");
  if (!sel) return;

  sel.innerHTML = "";
  SYMBOLS.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.value;
    opt.textContent = s.label;
    sel.appendChild(opt);
  });

  sel.value = currentSymbol;
  sel.addEventListener("change", () => {
    currentSymbol = sel.value;
    refreshPrice(true);
    loadOrders();
  });
}

function renderExpiry() {
  const wrap = $("expiryOptions");
  if (!wrap) return;

  wrap.innerHTML = "";
  EXPIRY_OPTIONS.forEach((x, idx) => {
    const btn = document.createElement("button");
    btn.className = "expiry-btn" + (idx === 0 ? " active" : "");
    btn.onclick = () => {
      selectedDurationSec = x.sec;
      [...wrap.querySelectorAll(".expiry-btn")].forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };

    btn.innerHTML = `
      <div class="expiry-time">${x.sec}s</div>
      <div class="expiry-profit">${x.profit}</div>
    `;
    wrap.appendChild(btn);
  });

  selectedDurationSec = EXPIRY_OPTIONS[0].sec;
}

async function refreshBalance() {
  try {
    const userId = requireUserId();
    const r = await window.apiFetch(`/api/wallet/${userId}`, { method: "GET" });
    if (!r.ok) return;

    // 兼容你后端返回结构：wallet.balance
    const balanceEl = $("balance");
    const w = r.data.wallet || r.data.data || r.data;
    const balance = w?.balance ?? w?.available ?? w?.availableBalance;

    if (balanceEl) balanceEl.textContent = balance != null ? balance : "0";
  } catch (e) {
    // 忽略
  }
}

async function refreshPrice(forceRefresh = false) {
  const path = forceRefresh ? "/api/market/price/refresh" : "/api/market/price";
  const r = await window.apiFetch(path, { method: "GET" });
  if (!r.ok) return;

  const d = r.data.data || r.data;
  // 你的后端建议返回：{symbol, price, updatedAt}
  if (d?.symbol && d.symbol.toUpperCase() !== currentSymbol) {
    // 如果后端只支持单symbol，这里就展示后端symbol
    currentSymbol = d.symbol.toUpperCase();
  }

  const priceEl = $("currentPrice");
  if (priceEl && d?.price != null) {
    priceEl.textContent = `$${Number(d.price).toLocaleString()}`;
  }

  const updateEl = $("chartUpdate");
  if (updateEl && d?.updatedAt) {
    updateEl.textContent = new Date(d.updatedAt).toLocaleTimeString();
  }
}

function setAmount(v) {
  const input = $("tradeAmount");
  if (!input) return;
  if (v === "all") {
    // 简单：用当前显示余额
    const bal = Number(($("balance")?.textContent || "0").replace(/,/g, ""));
    input.value = bal > 0 ? bal : 0;
  } else {
    input.value = v;
  }
}
window.setAmount = setAmount;

function updateEstimation() {
  const amt = Number($("tradeAmount")?.value || 0);
  const fee = amt * 0.001;
  const total = amt + fee;
  if ($("estimatedFee")) $("estimatedFee").textContent = fee.toFixed(2);
  if ($("estimatedTotal")) $("estimatedTotal").textContent = total.toFixed(2);
}

async function executeTrade(side) {
  // Buy = UP, Sell = DOWN（秒合约方向）
  try {
    const userId = requireUserId();
    const stake = Number($("tradeAmount")?.value || 0);
    if (!stake || stake <= 0) throw new Error("Please enter amount.");

    const direction = side === "buy" ? "UP" : "DOWN";

    const body = {
      userId,
      symbol: currentSymbol,
      direction,
      stake,
      durationSec: selectedDurationSec
    };

    const r = await window.apiFetch("/api/trade/seconds/order", {
      method: "POST",
      body: JSON.stringify(body)
    });

    if (!r.ok) throw new Error(r.data?.message || "Order failed.");

    // 刷新余额和订单
    await refreshBalance();
    await loadOrders();

    alert("Order placed successfully!");
  } catch (e) {
    alert(e.message || "Order failed.");
  }
}
window.executeTrade = executeTrade;

async function loadOrders() {
  try {
    const userId = requireUserId();
    const r = await window.apiFetch(`/api/trade/seconds/orders/${userId}`, { method: "GET" });
    if (!r.ok) return;

    const list = r.data.orders || [];
    const box = $("recentOrders");
    if (!box) return;

    if (!list.length) {
      box.innerHTML = `<div class="loading">No orders yet.</div>`;
      return;
    }

    box.innerHTML = list.slice(0, 10).map(o => {
      const dir = o.direction;
      const st = o.status;
      const res = o.result ? ` / ${o.result}` : "";
      const price = o.open_price ? Number(o.open_price).toLocaleString() : "-";
      const settle = o.settle_at ? new Date(o.settle_at).toLocaleTimeString() : "-";

      return `
        <div class="market-item" style="cursor:default;">
          <div class="market-left">
            <div class="crypto-icon">⚡</div>
            <div class="crypto-info">
              <h3>${o.symbol} · ${dir}</h3>
              <p>Open: ${price} · Settle: ${settle}</p>
            </div>
          </div>
          <div class="market-right">
            <div class="crypto-price">$${Number(o.stake).toLocaleString()}</div>
            <div class="crypto-change ${st === "SETTLED" && o.result === "WIN" ? "positive" : "negative"}">
              ${st}${res}
            </div>
          </div>
        </div>
      `;
    }).join("");
  } catch (e) {
    // 忽略
  }
}

// 初始化
(function initTradePage() {
  renderSymbols();
  renderExpiry();

  const amt = $("tradeAmount");
  if (amt) amt.addEventListener("input", updateEstimation);
  updateEstimation();

  refreshBalance();
  refreshPrice(true);
  loadOrders();

  // 每 1 秒刷新价格（实时行情显示）
  priceTimer = setInterval(() => refreshPrice(false), 1000);
})();
