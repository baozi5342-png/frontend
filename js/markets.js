// js/markets.js
async function loadMarkets(){
  const symbols = ["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT"];
  const tbody = $("mkRows");
  tbody.innerHTML = "";

  for(const s of symbols){
    const r = await safeFetch("https://api.binance.com/api/v3/ticker/24hr?symbol=" + s);
    if(!r.ok) continue;

    const price = Number(r.data.lastPrice || 0);
    const chg = Number(r.data.priceChangePercent || 0);
    const cls = chg >= 0 ? "badge-win" : "badge-lose";

    tbody.innerHTML += `
      <tr>
        <td>${s}</td>
        <td>${price.toFixed(2)}</td>
        <td><span class="badge ${cls}">${chg.toFixed(2)}%</span></td>
      </tr>
    `;
  }
}

loadMarkets();
setInterval(loadMarkets, 3000);
