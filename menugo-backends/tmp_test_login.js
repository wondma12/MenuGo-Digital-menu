(async()=>{
  try{
    const res = await fetch('http://localhost:5003/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'haymanotwondmagegn3@gmail.com', password: 'Admin@123' }),
    });
    const txt = await res.text();
    console.log(txt);
  } catch (e) {
    console.error('Request failed:', e.message);
  }
})();
