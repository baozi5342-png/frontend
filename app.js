const API = "/api";

/* AUTH */
const Auth = {
  async login(){
    const r = await fetch(API+"/auth/login",{method:"POST",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    });
    const d = await r.json();
    if(r.ok){ localStorage.token=d.token; location.href="index.html"; }
    else alert(d.message);
  },
  async register(){
    const r = await fetch(API+"/auth/register",{method:"POST",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    });
    if(r.ok) location.href="login.html";
  }
};

/* FINANCE */
const Finance = {
  async load(){
    const r = await fetch(API+"/finance");
    const d = await r.json();
    financeList.innerHTML = d.map(p=>`
      <div>
        <b>${p.name}</b>
        <p>Rate: ${p.rate}</p>
        <button onclick="Finance.buy(${p.id})">Join</button>
      </div>
    `).join("");
  },
  buy(id){
    fetch(API+"/finance/join",{method:"POST",headers:{ "Content-Type":"application/json"},body:JSON.stringify({id})});
  }
};

/* LOAN */
const Loan = {
  async load(){
    const r = await fetch(API+"/loan");
    const d = await r.json();
    loanList.innerHTML = d.map(p=>`
      <div>
        <b>${p.name}</b>
        <p>Rate: ${p.rate}</p>
        <button onclick="Loan.apply(${p.id})">Apply</button>
      </div>
    `).join("");
  },
  apply(id){
    fetch(API+"/loan/apply",{method:"POST",headers:{ "Content-Type":"application/json"},body:JSON.stringify({id})});
  }
};

/* ORDERS */
const Orders = {
  async load(){
    const r = await fetch(API+"/orders");
    const d = await r.json();
    orderList.innerHTML = d.map(o=>`
      <div>${o.type} · ${o.amount} · ${o.status}</div>
    `).join("");
  }
};

/* ASSETS */
const Assets = {
  async load(){
    const r = await fetch(API+"/assets");
    const d = await r.json();
    assetList.innerHTML = d.map(a=>`
      <div>${a.symbol} : ${a.balance}</div>
    `).join("");
  },
  deposit(){ location.href="deposit.html"; },
  withdraw(){ location.href="withdraw.html"; }
};
