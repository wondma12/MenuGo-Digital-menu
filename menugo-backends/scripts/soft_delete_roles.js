const { sequelize, User, UserSession, Restaurant } = require('../src/models');

// Roles to delete and emails to exclude
const TARGET_ROLES = ['restaurant_admin', 'waiter'];
const EXCLUDE_EMAILS = ['haymanotwondmagegn1111@gmail.com', 'admin@menugo.com'];

async function main() {
  console.log('Starting soft-delete for roles:', TARGET_ROLES.join(', '));

  await sequelize.authenticate();

  const results = {
    processed: 0,
    deleted: 0,
    skippedOwners: [],
    errors: [],
  };

  try {
    const users = await User.findAll({ where: { role: TARGET_ROLES } });

    for (const user of users) {
      results.processed++;

      if (EXCLUDE_EMAILS.includes((user.email || '').toLowerCase())) {
        console.log(`Skipping excluded email: ${user.email}`);
        continue;
      }

      // If restaurant_admin and owns restaurants, skip and report
      if (user.role === 'restaurant_admin') {
        const ownedCount = await Restaurant.count({ where: { owner_id: user.id, deleted_at: null } });
        if (ownedCount > 0) {
          console.log(`Skipping restaurant owner: ${user.email} (owns ${ownedCount} restaurants)`);
          results.skippedOwners.push({ id: user.id, email: user.email, ownedCount });
          continue;
        }
      }

      try {
        await user.update({ deleted_at: new Date(), is_active: false });
        await UserSession.update({ revoked_at: new Date() }, { where: { user_id: user.id } });
        console.log(`Soft-deleted user: ${user.email} (${user.role})`);
        results.deleted++;
      } catch (e) {
        console.error(`Failed to delete ${user.email}:`, e.message || e);
        results.errors.push({ id: user.id, email: user.email, error: e.message || String(e) });
      }
    }
  } catch (e) {
    console.error('Fatal error during deletion run:', e.message || e);
    process.exitCode = 2;
  } finally {
    console.log('Summary:', results);
    await sequelize.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
