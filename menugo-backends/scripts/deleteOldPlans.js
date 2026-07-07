#!/usr/bin/env node

const { SubscriptionPlan } = require('../src/models');
const { sequelize } = require('../src/config/database');

async function deleteOldPlans() {
  try {
    console.log('🗑️  Starting deletion of old demo plans...');
    
    // Delete by name
    const result = await SubscriptionPlan.destroy({
      where: {
        name: ['Basic Plan', 'Premium Plan', 'Enterprise Plan']
      }
    });
    
    console.log(`✅ Deleted ${result} old subscription plans`);
    
    // Show remaining plans
    const remaining = await SubscriptionPlan.findAll({
      order: [['created_at', 'DESC']]
    });
    
    console.log(`\n📋 Remaining plans (${remaining.length}):`);
    remaining.forEach(plan => {
      console.log(`   - ${plan.name} (${plan.tier}) - $${plan.price_monthly}/month`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting plans:', error.message);
    process.exit(1);
  }
}

deleteOldPlans();
