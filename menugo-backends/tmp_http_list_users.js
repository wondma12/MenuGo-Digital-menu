(async ()=>{
  const fetch = require('node-fetch');
  const base = 'http://localhost:5011/api';
  try{
    // login
    const resp = await fetch(`${base}/auth/login`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email: 'haymanotwondmagegn3@gmail.com', password: 'Admin@123' }) });
    const j = await resp.json();
    if(!j || !j.data || !j.data.token){ console.error('Login failed', j); process.exit(1); }
    const token = j.data.token;
    const usersResp = await fetch(`${base}/users`, { headers: { Authorization: `Bearer ${token}` } });
    const users = await usersResp.json();
    console.log('users status', usersResp.status);
    console.log(JSON.stringify(users, null, 2));
  }catch(e){ console.error(e && e.message ? e.message : e); process.exit(1); }
  process.exit(0);
})();
