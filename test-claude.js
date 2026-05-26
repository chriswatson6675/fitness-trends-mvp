require('dotenv').config({ path: require('path').resolve(__dirname, '.env.local') });
const { analyzetrend } = require('./lib/claude');

(async () => {
  try {
    const res = await analyzetrend('Micro Workouts', 1840);
    console.log('Analysis result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error calling analyzetrend:', err.message || err);
    if (err.response) console.error('Response:', err.response);
    process.exit(1);
  }
})();
