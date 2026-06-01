(async()=>{
  try{
    const loginRes = await fetch('http://localhost:5010/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'haymanotwondmagegn3@gmail.com', password: 'Admin@123' }),
    });
    const loginJson = await loginRes.json();
    console.log('login status', loginRes.status, loginJson.success ? 'OK' : loginJson);
    if (!loginJson.success) return;
    const token = loginJson.data.token;
    const meRes = await fetch('http://localhost:5010/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    const meJson = await meRes.json();
    console.log('/api/auth/me', meRes.status, meJson);
  } catch(e){ console.error(e); }
})();
