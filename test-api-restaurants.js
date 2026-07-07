const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5005,
  path: '/api/restaurants',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);
    
    if (res.statusCode === 200) {
      try {
        const restaurants = JSON.parse(data);
        if (Array.isArray(restaurants)) {
          console.log(`\nTotal restaurants: ${restaurants.length}`);
          console.log('\nLast 3 restaurants:');
          restaurants.slice(-3).forEach((r, idx) => {
            console.log(`\n${idx + 1}. ${r.name}`);
            console.log(`   ID: ${r.id}`);
            console.log(`   Subscription Tier: ${r.subscription_tier}`);
            console.log(`   Subscription Status: ${r.subscription_status}`);
            console.log(`   Is Active: ${r.is_active}`);
            console.log(`   Start Date: ${r.subscription_start_date}`);
            console.log(`   End Date: ${r.subscription_end_date}`);
            console.log(`   Created: ${r.created_at}`);
          });
        } else {
          console.log('Restaurants data:', JSON.stringify(restaurants, null, 2));
        }
      } catch (err) {
        console.error('Error parsing JSON:', err.message);
        console.log('Raw data:', data.substring(0, 500));
      }
    } else {
      console.log('Response data:', data.substring(0, 200));
    }
    
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  process.exit(1);
});

req.end();
