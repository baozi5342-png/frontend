/* frontend/app.js */
const API = "/api";

function show(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hide"));
  document.getElementById(id).classList.remove("hide");
}

/* 市场行情 */
async function loadMarket(){
  const res = await fetch(API + "/markets");
  const list = await res.json();
  marketBody.innerHTML = list.map(m=>`
    <tr>
      <td>${m.symbol}</td>
      <td>${m.price ?? "-"}</td>
      <td>${m.is_enabled ? "交易中":"停用"}</td>
    </tr>
  `).join("");
}

/* 合约列表 */
async function loadContracts(){
  const res = await fetch(API + "/contracts");
  const list = await res.json();
  contractSelect.innerHTML = list
    .filter(c=>c.is_enabled)
    .map(c=>`<option value="${c.id}">
      ${c.duration}s · ${c.profit_rate}
    </option>`).join("");
}

/* 下单 */
async function buy(direction){
  const amount = amount.value;
  const contract_id = contractSelect.value;
  const res = await fetch(API + "/trade/order", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ contract_id, amount, direction })
  });
  const data = await res.json();
  tradeMsg.innerText = res.ok ? "下单成功" : data.message;
}

/* 资产 */
async function loadAssets(){
  const res = await fetch(API + "/assets");
  const list = await res.json();
  assetBody.innerHTML = list.map(a=>`
    <tr><td>${a.symbol}</td><td>${a.balance}</td></tr>
  `).join("");
}

/* 初始化 */
loadMarket();
loadContracts();
loadAssets();
