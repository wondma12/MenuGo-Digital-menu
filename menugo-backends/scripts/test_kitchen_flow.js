/*
Simple E2E kitchen flow tester.
Usage:
  TEST_API_URL=http://localhost:5008 TEST_TOKEN=ey... TEST_RESTAURANT_ID=<id> TEST_ORDER_ID=<orderId> node scripts/test_kitchen_flow.js
If TEST_API_URL is not provided, the script will probe localhost ports 5003..5010 to find a responsive API health endpoint.
The script requires a valid bearer token with a role authorized to access kitchen routes (chef/admin/kitchen/restaurant_admin).
*/

const axios = require('axios');

const portsToProbe = [5003,5004,5005,5006,5007,5008,5009,5010];

async function findApiUrl() {
  if (process.env.TEST_API_URL) {
    return process.env.TEST_API_URL.replace(/\/$/, '');
  }
  for (const p of portsToProbe) {
    const url = `http://localhost:${p}`;
    try {
      const r = await axios.get(`${url  }/api/health`, { timeout: 2000 });
      if (r && r.data && r.data.status === 'success') {
        return url;
      }
    } catch (e) {
      // ignore
    }
  }
  throw new Error(`Could not find running API on localhost ports ${  portsToProbe.join(',')}`);
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function run() {
  try {
    const apiUrl = await findApiUrl();
    console.log('Using API URL:', apiUrl);

    const token = process.env.TEST_TOKEN;
    if (!token) {
      console.error('\nNo TEST_TOKEN provided. Obtain a bearer token by logging in via /api/auth/login and set TEST_TOKEN env var.');
      process.exit(2);
    }

    const restaurantId = process.env.TEST_RESTAURANT_ID;
    if (!restaurantId) {
      console.error('\nNo TEST_RESTAURANT_ID provided. Provide the restaurant id to target.');
      process.exit(2);
    }

    const orderId = process.env.TEST_ORDER_ID; // optional

    const client = axios.create({ baseURL: `${apiUrl  }/api/kitchen`, headers: { ...authHeaders(token) }, timeout: 5000 });

    console.log('\n1) GET /dashboard/:restaurantId');
    let r = await client.get(`/dashboard/${restaurantId}`);
    console.log('dashboard.status=', r.status, 'orders=', (r.data && r.data.data && r.data.data.orders ? r.data.data.orders.length : 'n/a'));

    console.log('\n2) GET /stations/:restaurantId');
    r = await client.get(`/stations/${restaurantId}`);
    console.log('stations.status=', r.status, 'count=', (r.data && r.data.data ? r.data.data.length : 'n/a'));

    console.log('\n3) GET /inventory-alerts/:restaurantId');
    r = await client.get(`/inventory-alerts/${restaurantId}`);
    console.log('alerts.status=', r.status, 'count=', (r.data && r.data.data ? r.data.data.length : 'n/a'));

    console.log('\n4) GET /completed/:restaurantId');
    r = await client.get(`/completed/${restaurantId}`);
    console.log('completed.status=', r.status);

    console.log('\n5) GET /analytics/:restaurantId');
    r = await client.get(`/analytics/${restaurantId}`);
    console.log('analytics.status=', r.status);

    if (orderId) {
      console.log(`\n6) GET /orders/${orderId}`);
      r = await client.get(`/orders/${orderId}`);
      console.log('order.status=', r.status, 'found=', !!(r.data && r.data.data));

      console.log(`\n7) PUT /orders/${orderId}/status -> preparing`);
      r = await client.put(`/orders/${orderId}/status`, { status: 'preparing', notes: 'Automated test update' });
      console.log('update.status=', r.status, 'response.success=', r.data && r.data.success);

      console.log(`\n8) PUT /orders/${orderId}/status -> ready`);
      r = await client.put(`/orders/${orderId}/status`, { status: 'ready' });
      console.log('update2.status=', r.status, 'response.success=', r.data && r.data.success);
    } else {
      console.log('\nNo TEST_ORDER_ID provided: skipping order-specific tests.');
    }

    console.log('\n9) POST /orders/bulk-update (dry)');
    try {
      const sampleOrderIds = orderId ? [orderId] : [];
      r = await client.post('/orders/bulk-update', { orderIds: sampleOrderIds, status: 'completed' });
      console.log('bulk.status=', r.status, 'response=', r.data && r.data.success);
    } catch (e) {
      console.warn('bulk-update failed (may require real order ids):', e.message);
    }

    console.log('\nE2E kitchen flow test finished. Review outputs above for failures.');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
