// /js/markets.js
let currentCategory = "Crypto";
let allItems = [];

function $(id) { return document.getElementById(id); }

function renderTable(list) {
  const body = $("marketsTableBody");
  const loading = document.querySelector("#marketList .loading");
  if (!body) return;

  if (loading) loading.style.display = "none";
  body.innerHTML = "";

  if (!list.length) {
    body.innerHTML = `<tr><td style="padding:20px;color:#8b93a7;">No data</td></tr>`;
    return;
  }

  list.forEach(c => {
    const chg = Number(c.priceChange || 0);
    const cls = chg >= 0 ? "positive" : "negative";
    const sign = chg >= 0 ? "+" : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="padding:14px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="crypto-icon" style="width:38px;height:38px;font-size:18px;">${c.icon || "💠"}</div>
          <div>
            <div style="color:#e1e5ee;font-weight:600;">${c.symbol}</div>
            <div style="color:#8b93a7;font-size:12px;">${c.name || ""}</div>
          </div>
        </div>
      </td>
      <td style="padding:14px;color:#e1e5ee;font-weight:600;text-align:right;">
        $${Number(c.currentPrice || 0).toLocaleString()}
      </td>
      <td style="padding:14px;text-align:right;">
        <span class="crypto-change ${cls}">${sign}${chg.toFixed(2)}%</span>
      </td>
    `;
    tr.style.cursor = "pointer";
    tr.onclick = () => window.location.href = "trade.html";
    body.appendChild(tr);
  });
}

async function loadCategory(cat) {
  currentCategory = cat;
  const loading = document.querySelector("#marketList .loading");
  if (loading) loading.style.display = "block";

  const r = await window.apiFetch(`/api/coins?category=${encodeURIComponent(cat)}`, { method: "GET" });
  allItems = (r.ok && r.data.items) ? r.data.items : [];
  applySearch();
}

function applySearch() {
  const q = ($("searchInput")?.value || "").trim().toUpperCase();
  const list = q ? allItems.filter(x => (x.symbol || "").toUpperCase().includes(q)) : allItems;
  renderTable(list);
}

(function init() {
  // tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadCategory(btn.dataset.category);
    });
  });

  // search
  const si = $("searchInput");
  if (si) si.addEventListener("input", applySearch);

  loadCategory("Crypto");
})();
