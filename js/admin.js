// /js/admin.js
function $(id) { return document.getElementById(id); }

async function adminFetch(path, options = {}) {
  const adminKey = localStorage.getItem("adminKey") || "";
  const headers = { ...(options.headers || {}) };
  if (adminKey) headers["x-admin-key"] = adminKey;
  return await window.apiFetch(path, { ...options, headers });
}

function showMsg(ok, text) {
  const s = $("successMessage");
  const e = $("errorMessage");
  if (s) s.style.display = "none";
  if (e) e.style.display = "none";

  if (ok && s) {
    s.textContent = text;
    s.style.display = "block";
  }
  if (!ok && e) {
    e.textContent = text;
    e.style.display = "block";
  }
}

function renderTable(items) {
  const tbody = $("cryptoTableBody");
  if (!tbody) return;

  tbody.innerHTML = items.map(x => `
    <tr>
      <td>${x.symbol}</td>
      <td>${x.name || ""}</td>
      <td>${x.icon || ""}</td>
      <td>${x.category}</td>
      <td>$${Number(x.currentPrice || 0).toLocaleString()}</td>
      <td>${Number(x.priceChange || 0).toFixed(2)}%</td>
      <td>
        <button class="action-btn btn-edit" data-sym="${x.symbol}">Edit</button>
        <button class="action-btn btn-delete" data-sym="${x.symbol}">Delete</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".btn-edit").forEach(b => {
    b.onclick = () => startEdit(b.dataset.sym);
  });
  tbody.querySelectorAll(".btn-delete").forEach(b => {
    b.onclick = () => doDelete(b.dataset.sym);
  });
}

async function loadCoins() {
  const r = await adminFetch("/admin/coins", { method: "GET" });
  if (!r.ok) {
    showMsg(false, r.data?.message || "Load failed");
    return;
  }
  renderTable(r.data.items || []);
}

function startEdit(symbol) {
  // 直接从表格里找当前行数据（简单）
  const rows = [...document.querySelectorAll("#cryptoTableBody tr")];
  const row = rows.find(tr => tr.children?.[0]?.textContent === symbol);
  if (!row) return;

  $("editMode").value = "true";
  $("originalSymbol").value = symbol;

  $("symbol").value = row.children[0].textContent.trim();
  $("name").value = row.children[1].textContent.trim();
  $("icon").value = row.children[2].textContent.trim();
  $("category").value = row.children[3].textContent.trim();
  $("currentPrice").value = String(row.children[4].textContent.replace("$", "").replace(/,/g, "").trim() || "0");
  $("priceChange").value = String(row.children[5].textContent.replace("%", "").trim() || "0");

  const t = $("submitBtnText");
  if (t) t.textContent = "Save Changes";
}

async function doDelete(symbol) {
  if (!confirm(`Delete ${symbol}?`)) return;
  const r = await adminFetch(`/admin/coins/${encodeURIComponent(symbol)}`, { method: "DELETE" });
  if (!r.ok) return showMsg(false, r.data?.message || "Delete failed");
  showMsg(true, "Deleted");
  loadCoins();
}

function resetForm() {
  $("editMode").value = "false";
  $("originalSymbol").value = "";
  $("cryptoForm").reset();
  const t = $("submitBtnText");
  if (t) t.textContent = "添加币种";
}

(function init() {
  // 让你输入一次 admin key 就保存
  const k = prompt("Enter ADMIN_API_KEY (same as Render env):");
  if (k) localStorage.setItem("adminKey", k);

  const form = $("cryptoForm");
  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      try {
        const editMode = $("editMode")?.value === "true";
        const originalSymbol = $("originalSymbol")?.value || "";

        const payload = {
          symbol: $("symbol").value.trim().toUpperCase(),
          name: $("name").value.trim(),
          icon: $("icon").value.trim(),
          category: $("category").value,
          currentPrice: Number($("currentPrice").value || 0),
          priceChange: Number($("priceChange").value || 0)
        };

        const url = editMode
          ? `/admin/coins/${encodeURIComponent(originalSymbol)}`
          : "/admin/coins";

        const r = await adminFetch(url, {
          method: editMode ? "PUT" : "POST",
          body: JSON.stringify(payload)
        });

        if (!r.ok) return showMsg(false, r.data?.message || "Save failed");

        showMsg(true, editMode ? "Updated" : "Created");
        resetForm();
        loadCoins();
      } catch (e) {
        showMsg(false, e.message || "Error");
      }
    });
  }

  loadCoins();
})();
