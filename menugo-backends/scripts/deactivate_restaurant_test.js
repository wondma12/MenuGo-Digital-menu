require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');

(async () => {
  try {
    const email = process.argv[2] || 'haymanotwondmagegn5@gmail.com';
    const password = process.argv[3] || 'Admin@123';
    const models = require('../src/models');
    await models.sequelize.authenticate();

    const { User, Restaurant, RestaurantStaff } = models;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }

    console.log('Found user:', { id: user.id, email: user.email, role: user.role, is_active: user.is_active });

    const restaurant = await Restaurant.findOne({ where: { owner_id: user.id } });
    if (!restaurant) {
      console.error('No restaurant found for user', user.id);
      process.exit(1);
    }

    console.log('Found restaurant:', { id: restaurant.id, name: restaurant.name, is_active: restaurant.is_active });

    // Ensure restaurant is active so we can login as the owner and run the deactivation flow
    if (!restaurant.is_active) {
      console.log('Temporarily activating restaurant for test');
      await restaurant.update({ is_active: true });
      await restaurant.reload();
      console.log('Restaurant now active:', restaurant.is_active);
    }

    // Try login on ports 5003 then 5002
    const ports = [5003, 5002];
    let token = null;
    for (const port of ports) {
      try {
        const res = await axios.post(`http://localhost:${port}/api/auth/login`, { email, password }, { withCredentials: true, timeout: 5000 });
        console.log('Login response from port', port, 'status', res.status);
        // console.log('login data', JSON.stringify(res.data).slice(0,200));
        token = res.data?.data?.token || res.data?.token || null;
        if (token) {
          console.log('Logged in, using port', port);
          break;
        }
      } catch (e) {
        console.error('Login error on port', port, e.response ? { status: e.response.status, data: e.response.data } : e.message);
      }
    }

    if (!token) {
      console.error('Failed to login to obtain token. Aborting.');
      process.exit(1);
    }

    // Call PATCH to deactivate restaurant
    let patched = false;
    for (const port of ports) {
      try {
        const r = await axios.patch(`http://localhost:${port}/api/restaurants/${restaurant.id}/status`, { is_active: false }, { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 });
        console.log('PATCH response:', r.status, r.data?.message || r.data);
        patched = true;
        break;
      } catch (e) {
        console.error('PATCH error on port', port, e.response ? { status: e.response.status, data: e.response.data } : e.message);
      }
    }

    if (!patched) {
      console.error('Failed to PATCH restaurant status');
      process.exit(1);
    }

    // Refresh states from DB
    await user.reload();
    await restaurant.reload();

    console.log('After patch - restaurant.is_active:', restaurant.is_active);

    const owner = await User.findByPk(restaurant.owner_id);
    console.log('Owner is_active:', owner ? owner.is_active : 'owner not found');

    const staff = await RestaurantStaff.findAll({ where: { restaurant_id: restaurant.id }, attributes: ['user_id'] });
    const userIds = staff.map(s => s.user_id).filter(Boolean);
    if (userIds.length) {
      const staffUsers = await User.findAll({ where: { id: userIds }, attributes: ['id', 'email', 'is_active'] });
      console.log('Staff users states:');
      staffUsers.forEach(su => console.log({ id: su.id, email: su.email, is_active: su.is_active }));
    } else {
      console.log('No staff records found for restaurant');
    }

    console.log('Test complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
