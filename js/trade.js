// =========================
// ✅ 改这里：你的 Render 后端地址
// =========================
const API_BASE = "https://backend-slxy.onrender.com"; // ← 改成你的
const UID = "demo_user_001"; // 先固定，后面接登录再换

let ws = null;
let latestPrice = 0;
let lastPrice = 0;
let currentSymbol = "BTCUSDT";
let settlingIds = new Set(); // 防止重复结算

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);

function setTips(text) {
  $("tips").innerText = text || "";
}

// =========================
// Binance WebSocket 实时行情
// =========================
function wsUrlBySymbol(symbol) {
  // Binance stream: <symbol>@trade 需要小写
  return `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`;
}

function connectWS(symbol) {
  currentSymbol = symbol;

  if (ws) {
    try { ws.close(); } catch(e) {}
    ws = null;
  }

  $("conn").innerText = "Connecting...";
  $("symbolText").innerText = `${symbol} (Binance)`;

  ws = new WebSocket(wsUrlBySymbol(symbol));

  ws.onopen = () => {
    $("conn").innerText = "Live";
    setTips("");
  };

  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    // trade: p is price
    latestPrice = Number(data.p);

    // 价格跳动效果
    const priceEl = $("price");
    priceEl.innerText = latestPrice ? latestPrice.toFixed(2) : "--";

    if (lastPrice && latestPrice) {
      priceEl.classList.remove("flash-up", "flash-down");
      // 触发重绘以重新播放动画
      void priceEl.offsetWidth;

      if (latestPrice > lastPrice) priceEl.classList.add("flash-up");
      if (latestPrice < lastPrice) priceEl.classList.add("flash-down");
    }
    lastPrice = latestPrice;
  };

  ws.onclose = () => {
    $("conn").innerText = "Reconnecting...";
    setTimeout(() => connectWS(currentSymbol), 1500);
  };

  ws.onerror = () => {
    $("conn").innerText = "Error";
  };
}

// =========================
// API 请求封装
// =========================
async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json().catch(() => null);
  if (!json) throw new Error("Invalid JSON");
  return json;
}

// =========================
// 下单
// =========================
async function placeOrder(direction) {
  if (!latestPrice) {
    alert("Price not ready");
    return;
  }

  const amount = Number($("amount").value);
  const duration = Number($("duration").value);

  if (!amount || amount <= 0) return alert("Amount invalid");

  setTips("Placing order...");

  const payload = {
    uid: UID,
    symbol: currentSymbol,
    direction,
    amount,
    duration,
    entry_price: latestPrice,
    payout_rate: 0.85,
  };

  const r = await api("/api/seconds/order", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    setTips("");
    alert(r.message || "Order failed");
    return;
  }

  setTips(`Order placed. Countdown started (${duration}s)`);
  startCountdownAndAutoSettle(r.data);
  await loadOrders();
}

// =========================
// 倒计时 + 自动结算（前端触发）
// =========================
function startCountdownAndAutoSettle(order) {
  // 给每个订单一个独立倒计时，不影响其他订单
  let left = Number(order.duration || 0);

  const tick = setInterval(async () => {
    left--;

    // 只提示，不刷屏
    if (left === 10) setTips("10s left...");
    if (left === 3) setTips("3s left...");

    if (left <= 0) {
      clearInterval(tick);
      setTips("Settling...");
      await settleOrder(order.id);
      await loadOrders();
      setTips("");
    }
  }, 1000);
}

// =========================
// 结算（调用后端）+ 结算动画弹窗
// =========================
async function settleOrder(orderId) {
  if (settlingIds.has(orderId)) return;
  settlingIds.add(orderId);

  // 打开弹窗：先显示 Settling
  openModal("Settling...", "--", "Please wait...");

  const r = await api(`/api/seconds/orders/${orderId}/settle`, {
    method: "POST",
    body: JSON.stringify({ exit_price: latestPrice }),
  });

  if (!r.ok) {
    updateModal("Settle Failed", "ERR", r.message || "Unknown error");
    settlingIds.delete(orderId);
    return;
  }

  const o = r.data;
  const isWin = o.result === "WIN";
  const title = isWin ? "Congratulations" : "Result";
  const result = isWin ? "WIN" : "LOSE";
  const desc =
    `Entry: ${Number(o.entry_price).toFixed(2)}\n` +
    `Exit: ${Number(o.exit_price).toFixed(2)}\n` +
    `PNL: ${Number(o.pnl).toFixed(2)} USDT`;

  updateModal(title, result, desc);
  settlingIds.delete(orderId);
}

// =========================
// 订单列表
// =========================
async function loadOrders() {
  const r = await api(`/api/seconds/orders?uid=${encodeURIComponent(UID)}&limit=50`, {
    method: "GET",
  });

  if (!r.ok) return;

  const list = r.data || [];
  const box = $("orders");
  box.innerHTML = "";

  if (!list.length) {
    box.innerHTML = `<div class="muted">No orders yet</div>`;
    return;
  }

  list.forEach((o) => {
    const status = o.status;
    const tagClass =
      status === "OPEN" ? "tag-open" : (o.result === "WIN" ? "tag-win" : "tag-lose");
    const tagText =
      status === "OPEN" ? "OPEN" : `${o.result}  ${Number(o.pnl).toFixed(2)}`;

    const div = document.createElement("div");
    div.className = "order";
    div.innerHTML = `
      <div class="row">
        <div class="big">${o.symbol} · ${o.direction}</div>
        <span class="tag ${tagClass}">${tagText}</span>
      </div>
      <div class="line">Amount: ${Number(o.amount).toFixed(2)} USDT · Duration: ${o.duration}s</div>
      <div class="line">Entry: ${Number(o.entry_price).toFixed(2)}${o.exit_price ? ` · Exit: ${Number(o.exit_price).toFixed(2)}` : ""}</div>
      <div class="line muted">${new Date(o.created_at).toLocaleString()}</div>
    `;
    box.appendChild(div);
  });
}

// =========================
// 弹窗控制
// =========================
function openModal(title, result, desc) {
  $("mask").style.display = "flex";
  $("spin").style.display = "block";
  $("mTitle").innerText = title;
  $("mResult").innerText = result;
  $("mDesc").innerText = desc;
}

function updateModal(title, result, desc) {
  $("spin").style.display = "none";
  $("mTitle").innerText = title;
  $("mResult").innerText = result;
  $("mDesc").innerText = desc;
}

function closeModal() {
  $("mask").style.display = "none";
}

// =========================
// 事件绑定 + 初始化
// =========================
function bind() {
  $("btnUp").addEventListener("click", () => placeOrder("UP"));
  $("btnDown").addEventListener("click", () => placeOrder("DOWN"));
  $("btnRefresh").addEventListener("click", loadOrders);
  $("mClose").addEventListener("click", closeModal);

  $("symbol").addEventListener("change", (e) => {
    const sym = e.target.value;
    latestPrice = 0;
    lastPrice = 0;
    $("price").innerText = "--";
    connectWS(sym);
  });
}

bind();
connectWS(currentSymbol);
loadOrders();
