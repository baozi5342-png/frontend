// js/trade.js
(async function init(){
  if(!requireLoginOrRedirect()) return;
  await loadMyOrders();
  setInterval(loadMyOrders, 2000);
})();

async function placeOrder(direction){
  const base = getApiBase();
  const { userId } = getSession();
  const symbol = $("symbol").value;
  const productId = $("productId").value;
  const amount = Number($("amount").value);

  if(!amount || amount <= 0){
    toast("Please enter a valid amount.");
    return;
  }

  const r = await safeFetch(base + "/api/contract/order", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ userId, symbol, direction, amount, productId })
  });

  if(!r.ok){
    toast((r.data && r.data.message) ? r.data.message : "Order failed");
    return;
  }
  toast("Order placed");
  $("amount").value = "";
  await loadMyOrders();
}

// ⚠️ 临时做法：因为后端目前只有 /admin/orders
// 下一步我会帮你加 /api/orders?userId=xx 这种公开接口（不暴露后台 key）
async function loadMyOrders(){
  const base = getApiBase();
  const { userId } = getSession();

  const r = await safeFetch(base + "/admin/orders", {
    headers:{ "x-admin-key":"foxpro_admin_2026" }
  });
  if(!r.ok){
    $("orderRows").innerHTML = `<tr><td colspan="6">Failed to load orders</td></tr>`;
    return;
  }

  const list = (r.data.orders || []).filter(o => String(o.user_id) === String(userId));
  const tbody = $("orderRows");
  tbody.innerHTML = "";

  if(!list.length){
    tbody.innerHTML = `<tr><td colspan="6">No orders</td></tr>`;
    return;
  }

  for(const o of list){
    const isOpen = o.status === "OPEN";
    const badgeClass = isOpen ? "badge-open" : (o.result === "WIN" ? "badge-win" : "badge-lose");
    const resultText = isOpen ? "Pending" : (o.result === "WIN" ? "Win" : "Lose");

    tbody.innerHTML += `
      <tr>
        <td>${o.symbol}</td>
        <td>${o.direction}</td>
        <td>${o.stake}</td>
        <td>${(Number(o.payout_ratio) * 100).toFixed(0)}%</td>
        <td><span class="badge ${badgeClass}">${o.status}</span></td>
        <td><span class="badge ${badgeClass}">${resultText}</span></td>
      </tr>
    `;
  }
}
