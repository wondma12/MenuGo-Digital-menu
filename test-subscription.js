const { sequelize, Restaurant } = require('./menugo-backends/src/models');

async function testSubscription() {
  try {
    console.log('Querying recent restaurants...\n');
    
    const restaurants = await Restaurant.findAll({
      attributes: ['id', 'name', 'subscription_tier', 'subscription_start_date', 'subscription_end_date', 'subscription_status', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5,
      raw: true,
    });

    console.log('Recent Restaurants:');
    console.log('=====================================');
    restaurants.forEach((r) => {
      const startDate = new Date(r.subscription_start_date);
      const endDate = new Date(r.subscription_end_date);
      const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
      
      console.log(`
Restaurant: ${r.name}
ID: ${r.id}
Subscription Tier: ${r.subscription_tier}
Subscription Status: ${r.subscription_status}
Is Active: ${r.is_active}
Start Date: ${startDate.toLocaleDateString()}
End Date: ${endDate.toLocaleDateString()}
Days Remaining: ${daysLeft}
Created At: ${r.created_at}
`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testSubscription();
