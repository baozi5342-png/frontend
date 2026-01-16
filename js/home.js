// /js/home.js
(async function () {
  const listBox = document.getElementById("popularCryptos");
  if (!listBox) return;

  listBox.innerHTML = `<div class="loading">Loading market data...</div>`;

  const r = await window.apiFetch("/api/coins?category=Popular", { method: "GET" });
  if (!r.ok) {
    listBox.innerHTML = `<div class="loading">Failed to load data.</div>`;
    return;
  }

  const items = r.data.items || [];
  if (!items.length) {
    listBox.innerHTML = `<div class="loading">No data.</div>`;
    return;
  }

  listBox.innerHTML = items.map(c => {
    const chg = Number(c.priceChange || 0);
    const cls = chg >= 0 ? "positive" : "negative";
    const sign = chg >= 0 ? "+" : "";
    return `
      <div class="crypto-item" onclick="window.location.href='trade.html'">
        <div class="crypto-left">
          <div class="crypto-icon">${c.icon || "💠"}</div>
          <div class="crypto-info">
            <h3>${c.symbol}</h3>
            <p>${c.name || ""}</p>
          </div>
        </div>
        <div class="crypto-right">
          <div class="crypto-price">$${Number(c.currentPrice || 0).toLocaleString()}</div>
          <div class="crypto-change ${cls}">${sign}${chg.toFixed(2)}%</div>
        </div>
      </div>
    `;
  }).join("");
})();
