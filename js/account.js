// js/account.js
(function init(){
  if(!requireLoginOrRedirect()) return;
  const s = getSession();
  $("sessionInfo").innerText = `User ID: ${s.userId} | Token: ${s.sessionToken}`;
})();

function logout(){
  localStorage.removeItem("userId");
  localStorage.removeItem("sessionToken");
  toast("Logged out");
  setTimeout(()=> location.href="login.html", 600);
}
