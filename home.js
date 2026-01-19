const API = "https://backend-slxy.onrender.com/api";

async function loadHotMarkets() {
  const res = await fetch(API + "/coins/hot");
  const data = await res.json();

  const table = document.getElementById("marketTable");
  table.innerHTML = "";

  data.forEach((coin, i) => {
    table.innerHTML += `
      <div class="market-row">
        <div>${i + 1}</div>
        <div>
          <img src="${coin.icon}" width="20" />
          ${coin.symbol}
        </div>
        <div>$${coin.current_price}</div>
        <div class="${coin.price_change >= 0 ? 'up' : 'down'}">
          ${coin.price_change}%
        </div>
      </div>
    `;
  });
}

loadHotMarkets();
