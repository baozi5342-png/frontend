// ===============================
// 登录状态
// ===============================
(function () {
  const box = document.getElementById("admin-login-status");
  const token = localStorage.getItem("ADMIN_TOKEN");

  if (!token) {
    box.innerText = "❌ 未登录";
    box.style.color = "#ff8080";
    return;
  }

  box.innerText = "👤 已登录 | Token: " + token.slice(0, 4) + "****";
})();


// ===============================
// 秒合约产品管理
// ===============================
let products = [
  { id: 1, sec: 60, rate: 0.85, min: 10, max: 1000, status: "启用" },
  { id: 2, sec: 120, rate: 0.9, min: 20, max: 2000, status: "启用" }
];

function renderProducts() {
  const tbody = document.getElementById("product-table");
  tbody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.sec}</td>
      <td>${p.rate}</td>
      <td>${p.min}</td>
      <td>${p.max}</td>
      <td><span class="badge">${p.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

renderProducts();

function openProductModal() {
  document.getElementById("product-modal").style.display = "flex";
}

function closeProductModal() {
  document.getElementById("product-modal").style.display = "none";
}

function saveProduct() {
  const sec = Number(document.getElementById("p-sec").value);
  const rate = Number(document.getElementById("p-rate").value);
  const min = Number(document.getElementById("p-min").value);
  const max = Number(document.getElementById("p-max").value);
  const status = document.getElementById("p-status").value;

  products.push({
    id: products.length + 1,
    sec, rate, min, max, status
  });

  renderProducts();
  closeProductModal();
}


// ===============================
// 用户风控管理（保持你已有逻辑）
// ===============================
(function () {
  const users = [
    { uid: 10001, status: "正常", winRate: 50, force: "none" },
    { uid: 10002, status: "正常", winRate: 50, force: "none" }
  ];

  const tbody = document.getElementById("user-table");
  tbody.innerHTML = "";

  users.forEach(u => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.uid}</td>
      <td>${u.status}</td>
      <td><input type="number" min="0" max="100" value="${u.winRate}" /></td>
      <td>
        <select>
          <option value="none">无</option>
          <option value="win">强制赢</option>
          <option value="lose">强制输</option>
        </select>
      </td>
      <td><button>保存</button></td>
    `;

    tr.querySelector("button").onclick = () => {
      alert(`已保存用户 ${u.uid}`);
    };

    tbody.appendChild(tr);
  });
})();
