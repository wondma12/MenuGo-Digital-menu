const axios = require('axios');

let API = process.env.API_URL || 'http://localhost:5000/api';
// Normalize whitespace to avoid accidental trailing spaces from shell envs
API = (API || '').trim();
// Remove any internal whitespace that may have been introduced by shell quoting
API = API.replace(/\s+/g, '');
// Ensure API contains /api suffix for route construction
if (!API.endsWith('/api')) {
  API = API.replace(/\/+$/, '') + '/api';
}
console.log('Using API base:', API);
const RESTAURANT_SLUG = process.env.TEST_RESTAURANT_SLUG || 'gourmet-bistro-nyc-12345';

const waiterCreds = { email: 'waiter1@menugo.com', password: 'Waiter@123' };
const ownerCreds = { email: 'restaurant.owner@menugo.com', password: 'Owner@123' };

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  try {
    console.log('1) Fetching menu and restaurant info...');
    const menuRes = await axios.get(`${API}/menu/restaurant/${RESTAURANT_SLUG}`);
    const restaurant = menuRes.data?.data?.restaurant;
    let items = menuRes.data?.data?.items || [];
    if (!restaurant) {
      console.error('No restaurant found. Aborting test.');
      process.exit(1);
    }

    // If there are no menu items, create one using restaurant owner credentials so the test can proceed
    if (items.length === 0) {
      console.log('  No menu items found — creating a category and menu item for E2E test');
      const loginOwner = await axios.post(`${API}/auth/login`, ownerCreds);
      const ownerToken = loginOwner.data?.data?.token;
      if (!ownerToken) throw new Error('Failed to obtain owner token for seeding menu item');

      // Create category
      const catRes = await axios.post(`${API}/menu/categories/${restaurant.id}`, { name: 'E2E Category' }, { headers: { Authorization: `Bearer ${ownerToken}` } });
      const categoryId = catRes.data?.data?.id;

      // Create a menu item
      const itemRes = await axios.post(`${API}/menu/items/${restaurant.id}`, {
        category_id: categoryId,
        name: 'E2E Test Dish',
        description: 'Automatically created for E2E test',
        price: 9.99,
        is_available: true,
        display_order: 0
      }, { headers: { Authorization: `Bearer ${ownerToken}` } });

      items = [ itemRes.data?.data ];
    }

    const restaurantId = restaurant.id;
    const menuItemId = items[0].id;
    console.log('  Found restaurant:', restaurant.name, restaurantId);
    console.log('  Using menu item id:', menuItemId);

    console.log('\n2) Creating a public order (simulating customer via QR)');
    const createRes = await axios.post(`${API}/orders`, {
      restaurant_id: RESTAURANT_SLUG,
      table_number: '12',
      customer_name: 'Test Guest',
      customer_phone: '+15550001000',
      items: [ { menu_item_id: menuItemId, quantity: 1 } ],
      special_instructions: 'Test order from e2e script',
    });

    const orderId = createRes.data?.data?.order_id || createRes.data?.data?.order_id;
    console.log('  Created order id:', orderId);

    console.log('\n3) Logging in as waiter to verify the order');
    // Ensure restaurant owner is available to create staff mapping if needed
    console.log('\n3) Ensuring waiter is registered as staff (owner login)');
    const loginOwnerForStaff = await axios.post(`${API}/auth/login`, ownerCreds);
    const ownerTokenForStaff = loginOwnerForStaff.data?.data?.token;
    if (!ownerTokenForStaff) throw new Error('Failed to obtain owner token for staff seeding');
    try {
      await axios.post(`${API}/staff`, { restaurant_id: restaurantId, email: waiterCreds.email, role: 'waiter' }, { headers: { Authorization: `Bearer ${ownerTokenForStaff}` } });
      console.log('  Created restaurant staff mapping for waiter');
    } catch (e) {
      console.log('  Staff create skipped or failed (may already exist):', e.response?.data?.message || e.message);
    }

    console.log('\n4) Logging in as waiter to verify the order');
    const loginWaiter = await axios.post(`${API}/auth/login`, waiterCreds);
    const waiterToken = loginWaiter.data?.data?.token;
    if (!waiterToken) throw new Error('Failed to obtain waiter token');
    console.log('  Waiter token acquired');

    console.log('5) Verifying order as waiter (method=manual)');
    await axios.post(`${API}/orders/${orderId}/verify`, { method: 'manual' }, {
      headers: { Authorization: `Bearer ${waiterToken}` }
    });
    console.log('  Order verified by waiter');

    console.log('\n5) Logging in as restaurant owner to inspect kitchen dashboard and advance statuses');
    const loginOwner = await axios.post(`${API}/auth/login`, ownerCreds);
    const ownerToken = loginOwner.data?.data?.token;
    if (!ownerToken) throw new Error('Failed to obtain owner token');
    console.log('  Owner token acquired');

    // Allow a short delay for background creation/emit
    await wait(1200);

    console.log('\n6) Polling kitchen dashboard for the new kitchen order');
    let kitchenData = null;
    for (let i = 0; i < 6; i++) {
      const dashRes = await axios.get(`${API}/kitchen/dashboard/${restaurantId}`, { headers: { Authorization: `Bearer ${ownerToken}` } });
      kitchenData = dashRes.data?.data;
      const found = (kitchenData?.orders || []).find(o => String(o.order_id) === String(orderId) || o.order_number === createRes.data?.data?.order_number);
      if (found) {
        console.log('  Kitchen order found:', found.id);
        kitchenData.found = found;
        break;
      }
      process.stdout.write('.');
      await wait(1000);
    }

    if (!kitchenData || !kitchenData.found) {
      console.error('\nFailed to locate kitchen order after verification.');
      process.exit(1);
    }

    const kitchenOrderId = kitchenData.found.id;

    console.log('\n7) Advancing kitchen order status to preparing');
    await axios.put(`${API}/kitchen/orders/${kitchenOrderId}/status`, { status: 'preparing' }, { headers: { Authorization: `Bearer ${ownerToken}` } });
    console.log('  Status -> preparing');
    await wait(800);

    console.log('8) Advancing kitchen order status to ready');
    await axios.put(`${API}/kitchen/orders/${kitchenOrderId}/status`, { status: 'ready' }, { headers: { Authorization: `Bearer ${ownerToken}` } });
    console.log('  Status -> ready');
    await wait(800);

    console.log('9) Advancing kitchen order status to completed');
    await axios.put(`${API}/kitchen/orders/${kitchenOrderId}/status`, { status: 'completed' }, { headers: { Authorization: `Bearer ${ownerToken}` } });
    console.log('  Status -> completed');

    console.log('\nTest flow completed successfully — kitchen order created and progressed through statuses.');
    process.exit(0);
  } catch (err) {
    console.error('E2E test error:', err.response ? (err.response.data || err.response.statusText || err.message || err) : (err.stack || err));
    // Dump full error for debugging
    console.error(err);
    process.exit(1);
  }
}

run();
