require('dotenv').config();
const { ensureReviewsTableCols, getSafeReviewAttributes } = require('./src/controllers/reviewController');
(async () => {
  try {
    const cols = await ensureReviewsTableCols();
    console.log('describe cols', cols && Object.keys(cols));
    const attrs = getSafeReviewAttributes(cols);
    console.log('safe attrs', attrs);
  } catch (e) {
    console.error('ERROR', e.stack || e.message || e);
  }
})();
