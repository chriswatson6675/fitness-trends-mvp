const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
const { searchTrendingFitness } = require('./lib/youtube');
console.log('Loaded YOUTUBE_API_KEY:', !!process.env.YOUTUBE_API_KEY);
searchTrendingFitness('GB')
  .then((result) => {
    console.log('Videos returned by scraper:', result.videos.length);
    console.log('Grouped keywords count:', Object.keys(result.grouped || {}).length);
    console.log('Keyword counts:', JSON.stringify(result.counts || {}, null, 2));
    console.log('First 3 kept videos:', JSON.stringify(result.videos.slice(0, 3), null, 2));
  })
  .catch((err) => {
    console.error('SCRAPER ERROR:', err.message || err);
    if (err.response && err.response.data) {
      console.error('ERROR details:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  });
