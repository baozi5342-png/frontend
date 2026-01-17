// js/auth.js
// Login/register helpers (will fallback to Demo login if backend auth is not ready)

async function demoLogin(){
  // Demo account: userId=1
  localStorage.setItem("userId", "1");
  localStorage.setItem("sessionToken", "demo_token");
  toast("Demo login success");
  setTimeout(()=> location.href="trade.html", 600);
}

async function loginWithBackend(username, password){
  const base = getApiBase();
  if(!base) return { ok:false, message:"Missing API_BASE_URL" };

  // If your backend auth routes exist later, this will work:
  // POST /auth/login { username, password }
  const r = await safeFetch(base + "/auth/login", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ username, password })
  });

  if(!r.ok){
    return { ok:false, message: (r.data && r.data.message) ? r.data.message : "Backend auth not available" };
  }

  // Expected: { userId, token }
  const token = r.data.token || r.data.sessionToken || "";
  const userId = r.data.userId || "";
  if(!token || !userId){
    return { ok:false, message:"Invalid auth response" };
  }

  localStorage.setItem("userId", String(userId));
  localStorage.setItem("sessionToken", String(token));
  return { ok:true };
}

async function registerWithBackend(username, password){
  const base = getApiBase();
  if(!base) return { ok:false, message:"Missing API_BASE_URL" };

  const r = await safeFetch(base + "/auth/register", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ username, password })
  });

  if(!r.ok){
    return { ok:false, message: (r.data && r.data.message) ? r.data.message : "Backend register not available" };
  }
  return { ok:true };
}
