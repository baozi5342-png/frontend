const API = "/api";

/* Mobile menu */
document.querySelector(".menu-btn").onclick = () => {
  const nav = document.querySelector(".top-nav");
  nav.style.display = nav.style.display === "flex" ? "none" : "flex";
};

/* Load page */
(async function(){
  await loadWelcome();
  await loadHotMarkets();
})();

/* Welcome text (backend controlled) */
async function loadWelcome(){
  try{
    const me = await fetch(API + "/me").then(r=>r.json());
    document.getElementById("welcomeTitle").innerText =
      `Welcome back`;
    document.getElementById("welcomeSub").innerText =
      "Markets are moving. Stay focused.";
  }catch{
    document.getElementById("welcomeTitle").innerText =
      "Welcome";
    document.getElementById("welcomeSub").innerText =
      "Trade crypto with clarity, confidence, and control.";
  }
}

/* Hot markets */
async function loadHotMarkets(){
  const data = await fetch(API + "/home/hot-markets").then(r=>r.json());

  document.getElementById("hotMarkets").innerHTML =
    data.map(m=>`
      <div class="market-card">
        <h3>${m.symbol}</h3>
        <div class="price">${m.price}</div>
        <div class="change ${m.change>=0?'up':'down'}">
          ${m.change>=0?'+':''}${m.change}%
        </div>
      </div>
    `).join("");
}
