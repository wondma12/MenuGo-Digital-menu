require('dotenv').config();
const { ensureRestaurantSchema } = require('../src/utils/ensureRestaurantSchema');

async function main() {
  const result = await ensureRestaurantSchema();
  if (result && result.applied && result.applied.length) {
    console.log(`Added restaurant columns: ${result.applied.join(', ')}`);
  } else {
    console.log('Restaurant columns already exist; nothing to do.');
  }
}

main().catch((error) => {
  console.error('Failed to ensure restaurant columns:', error && error.message ? error.message : error);
  process.exit(1);
});
