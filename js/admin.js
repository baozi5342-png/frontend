// js/admin.js
(function () {
  const API_BASE = window.CONFIG?.API_BASE;
  const ADMIN_KEY = window.CONFIG?.ADMIN_KEY;

  const msgOk = document.getElementById("msgOk");
  const msgErr = document.getElementById("msgErr");

  function showOk(t) {
    msgErr.style.display = "none";
    msgOk.textContent = t;
    msgOk.style.display = "block";
    setTimeout(() => (msgOk.style.display = "none"), 2200);
  }
  function showErr(t) {
    msgOk.style.display = "none";
    msgErr.textContent = t;
    msgErr.style.display = "block";
  }

  async function adminGet(path) {
    const r = await fetch(`${API_BASE}${path}`, {
      headers: { "x-admin-key": ADMIN_KEY }
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || "Request failed");
    return j;
  }

  async function adminPost(path, body) {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify(body)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || "Request failed");
    return j;
  }

  async function adminPut(path, body) {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify(body)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || "Request failed");
    return j;
  }

  async function adminDel(path) {
    const r = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: { "x-admin-key": ADMIN_KEY }
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || "Request failed");
    return j;
  }

  // ===== Tabs =====
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  if (!API_BASE || !ADMIN_KEY) {
    showErr("config.js 没有设置 API_BASE 或 ADMIN_KEY");
    return;
  }

  // ===============================
  // 1) coins CRUD
  // ===============================
  const coinForm = document.getElementById("coinForm");
  const coinTable = document.getElementById("coinTable");
  const coinEditId = document.getElementById("coinEditId");
  const coinSymbol = document.getElementById("coinSymbol");
  const coinName = document.getElementById("coinName");
  const coinIcon = document.getElementById("coinIcon");
  const coinCategory = document.getElementById("coinCategory");
  const coinPrice = document.getElementById("coinPrice");
  const coinChange = document.getElementById("coinChange");
  const coinCancel = document.getElementById("coinCancel");

  async function loadCoins() {
    const list = await adminGet("/admin/coins");
    const coins = Array.isArray(list) ? list : list.data || [];

    if (!coins.length) {
      coinTable.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b93a7;">No data</td></tr>`;
      return;
    }

    coinTable.innerHTML = coins.map(c => `
      <tr>
        <td>${c.symbol}</td>
        <td>${c.name}</td>
        <td>${Number(c.current_price || 0).toFixed(2)}</td>
        <td>${Number(c.price_change || 0).toFixed(2)}%</td>
        <td>${c.category || "-"}</td>
        <td>
          <button class="btn small" data-act="edit-coin" data-id="${c.symbol}">编辑</button>
          <button class="btn small red" data-act="del-coin" data-id="${c.symbol}">删除</button>
        </td>
      </tr>
    `).join("");

    coinTable.querySelectorAll("button").forEach(b => {
      b.addEventListener("click", async () => {
        const act = b.dataset.act;
        const id = b.dataset.id;

        if (act === "edit-coin") {
          const item = coins.find(x => x.symbol === id);
          coinEditId.value = item.symbol;
          coinSymbol.value = item.symbol;
          coinName.value = item.name || "";
          coinIcon.value = item.icon || "";
          coinCategory.value = item.category || "Crypto";
          coinPrice.value = item.current_price || 0;
          coinChange.value = item.price_change || 0;
          coinCancel.style.display = "inline-block";
        }

        if (act === "del-coin") {
          if (!confirm("确定删除该币种？")) return;
          await adminDel(`/admin/coins/${encodeURIComponent(id)}`);
          showOk("已删除");
          await loadCoins();
        }
      });
    });
  }

  coinCancel.addEventListener("click", () => {
    coinEditId.value = "";
    coinForm.reset();
    coinCancel.style.display = "none";
  });

  coinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        symbol: coinSymbol.value.trim(),
        name: coinName.value.trim(),
        icon: coinIcon.value.trim(),
        category: coinCategory.value,
        current_price: Number(coinPrice.value),
        price_change: Number(coinChange.value || 0)
      };

      // 有 editId => 更新，否则新增
      if (coinEditId.value) {
        await adminPut(`/admin/coins/${encodeURIComponent(coinEditId.value)}`, payload);
        showOk("已更新");
      } else {
        await adminPost("/admin/coins", payload);
        showOk("已新增");
      }

      coinEditId.value = "";
      coinForm.reset();
      coinCancel.style.display = "none";
      await loadCoins();
    } catch (err) {
      showErr(err.message);
    }
  });

  // ===============================
  // 2) contract_products CRUD
  // ===============================
  const productForm = document.getElementById("productForm");
  const productTable = document.getElementById("productTable");
  const productEditId = document.getElementById("productEditId");
  const productName = document.getElementById("productName");
  const productSeconds = document.getElementById("productSeconds");
  const productPayout = document.getElementById("productPayout");
  const productMin = document.getElementById("productMin");
  const productMax = document.getElementById("productMax");
  const productStatus = document.getElementById("productStatus");
  const productCancel = document.getElementById("productCancel");

  async function loadProducts() {
    const list = await adminGet("/admin/contract-products");
    const items = Array.isArray(list) ? list : list.data || [];

    if (!items.length) {
      productTable.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#8b93a7;">No data</td></tr>`;
      return;
    }

    productTable.innerHTML = items.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.seconds}</td>
        <td>${Number(p.payout_ratio || 0).toFixed(4)}</td>
        <td>${Number(p.min_amount || 0).toFixed(2)}</td>
        <td>${Number(p.max_amount || 0).toFixed(2)}</td>
        <td>${p.status}</td>
        <td>
          <button class="btn small" data-act="edit-prod" data-id="${p.id}">编辑</button>
          <button class="btn small red" data-act="del-prod" data-id="${p.id}">删除</button>
        </td>
      </tr>
    `).join("");

    productTable.querySelectorAll("button").forEach(b => {
      b.addEventListener("click", async () => {
        const act = b.dataset.act;
        const id = Number(b.dataset.id);

        if (act === "edit-prod") {
          const it = items.find(x => Number(x.id) === id);
          productEditId.value = it.id;
          productName.value = it.name || "";
          productSeconds.value = it.seconds || 0;
          productPayout.value = it.payout_ratio || 0;
          productMin.value = it.min_amount || 0;
          productMax.value = it.max_amount || 0;
          productStatus.value = it.status || "ACTIVE";
          productCancel.style.display = "inline-block";
        }

        if (act === "del-prod") {
          if (!confirm("确定删除该产品？")) return;
          await adminDel(`/admin/contract-products/${id}`);
          showOk("已删除");
          await loadProducts();
        }
      });
    });
  }

  productCancel.addEventListener("click", () => {
    productEditId.value = "";
    productForm.reset();
    productCancel.style.display = "none";
  });

  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productName.value.trim(),
        seconds: Number(productSeconds.value),
        payout_ratio: Number(productPayout.value),
        min_amount: Number(productMin.value),
        max_amount: Number(productMax.value),
        status: productStatus.value
      };

      if (productEditId.value) {
        await adminPut(`/admin/contract-products/${Number(productEditId.value)}`, payload);
        showOk("已更新");
      } else {
        await adminPost("/admin/contract-products", payload);
        showOk("已新增");
      }

      productEditId.value = "";
      productForm.reset();
      productCancel.style.display = "none";
      await loadProducts();
    } catch (err) {
      showErr(err.message);
    }
  });

  // ===============================
  // 3) users risk controls
  // ===============================
  const userTable = document.getElementById("userTable");

  async function loadUsers() {
    const list = await adminGet("/admin/users");
    const users = Array.isArray(list) ? list : list.data || [];

    if (!users.length) {
      userTable.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#8b93a7;">No users</td></tr>`;
      return;
    }

    userTable.innerHTML = users.map(u => `
      <tr>
        <td style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${u.id}</td>
        <td>
          <select data-k="status" data-id="${u.id}">
            <option value="ACTIVE" ${u.status === "ACTIVE" ? "selected" : ""}>ACTIVE</option>
            <option value="BANNED" ${u.status === "BANNED" ? "selected" : ""}>BANNED</option>
          </select>
        </td>
        <td>
          <input data-k="win_rate" data-id="${u.id}" type="number" step="0.01" placeholder="例如 60" value="${u.win_rate ?? ""}">
        </td>
        <td>
          <select data-k="force_result" data-id="${u.id}">
            <option value="" ${!u.force_result ? "selected" : ""}>NORMAL</option>
            <option value="WIN" ${u.force_result === "WIN" ? "selected" : ""}>WIN</option>
            <option value="LOSE" ${u.force_result === "LOSE" ? "selected" : ""}>LOSE</option>
          </select>
        </td>
        <td>
          <button class="btn small" data-act="save-user" data-id="${u.id}">保存</button>
        </td>
      </tr>
    `).join("");

    userTable.querySelectorAll("button").forEach(b => {
      b.addEventListener("click", async () => {
        if (b.dataset.act !== "save-user") return;

        const id = b.dataset.id;
        const status = userTable.querySelector(`select[data-k="status"][data-id="${id}"]`).value;
        const force = userTable.querySelector(`select[data-k="force_result"][data-id="${id}"]`).value;
        const winRateVal = userTable.querySelector(`input[data-k="win_rate"][data-id="${id}"]`).value;
        const win_rate = winRateVal === "" ? null : Number(winRateVal);

        await adminPut(`/admin/users/${encodeURIComponent(id)}/risk`, {
          status,
          win_rate,
          force_result: force || null
        });

        showOk("已保存");
        await loadUsers();
      });
    });
  }

  // init
  (async () => {
    try {
      await loadCoins();
      await loadProducts();
      await loadUsers();
      showOk("后台已加载");
    } catch (e) {
      showErr(e.message);
    }
  })();
})();
