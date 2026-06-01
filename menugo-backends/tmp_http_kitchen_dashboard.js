(async ()=>{
  const fetch = require('node-fetch');
  const base = 'http://localhost:5012/api';
  const restaurantId = '8abe8e86-c4fc-4f55-b85a-b346432569d3';
  try{
    // login first to get token
    const login = await fetch(`${base}/auth/login`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email: 'haymanotwondmagegn3@gmail.com', password: 'Admin@123' }) });
    const lj = await login.json();
    if(!lj.data || !lj.data.token) { console.error('login failed', lj); process.exit(1); }
    const token = lj.data.token;
    const r = await fetch(`${base}/kitchen/dashboard/${restaurantId}?date=2026-06-01`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('status', r.status);
    console.log(await r.text());
  }catch(e){ console.error(e && e.message ? e.message : e); }
  process.exit(0);
})();