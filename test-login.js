const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5005,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const loginData = JSON.stringify({
  email: 'testsubscription2026@gmail.com',
  password: 'TestPass123!'
});

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Login Response Status:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      console.log('\nResponse:', JSON.stringify(response, null, 2));
      
      if (response.accessToken) {
        console.log('\n✓ Login successful!');
        console.log('Access Token:', response.accessToken.substring(0, 50) + '...');
        console.log('User:', response.user);
      }
    } catch (err) {
      console.error('Error parsing response:', err.message);
      console.log('Raw response:', data.substring(0, 300));
    }
    
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  process.exit(1);
});

req.write(loginData);
req.end();
