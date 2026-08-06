const axios = require('axios');
(async () => {
  try {
    const response = await axios.post('http://localhost:5004/auth/login', {
      email: 'test@example.com',
      password: 'password'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('STATUS', response.status);
    console.log('BODY', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('STATUS', error.response.status);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
})();
