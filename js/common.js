// js/common.js
function $(id){ return document.getElementById(id); }

function toast(msg){
  const t = $("toast");
  if(!t) { alert(msg); return; }
  t.innerText = msg;
  t.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> t.style.display="none", 2000);
}

function getApiBase(){
  return (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL : "";
}

function getSession(){
  return {
    userId: localStorage.getItem("userId") || "",
    sessionToken: localStorage.getItem("sessionToken") || ""
  };
}

function isLoggedIn(){
  const s = getSession();
  return !!s.userId && !!s.sessionToken;
}

function requireLoginOrRedirect(){
  if(!isLoggedIn()){
    location.href = "login.html";
    return false;
  }
  return true;
}

async function safeFetch(url, options={}){
  try{
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : await res.text();
    return { ok: res.ok, status: res.status, data };
  }catch(e){
    return { ok:false, status:0, data:{ message: e.message || "Network error" } };
  }
}
