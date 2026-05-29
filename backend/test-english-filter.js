const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const { getYouTubeTrends } = require('./youtube');

async function runTest() {
  console.log('🧪 Testing English-Only Filter...\n');
  console.log('Fetching trends from YouTube with strict English filtering...\n');

  try {
    const regions = ['GB', 'US'];

    for (const region of regions) {
      console.log(`\n📍 Region: ${region}`);
      console.log('='.repeat(60));
      
      const trends = await getYouTubeTrends(region);

      if (trends.length === 0) {
        console.log('❌ No trends found. Check API key and quota.');
        continue;
      }

      console.log(`✅ Found ${trends.length} trends\n`);

      trends.slice(0, 3).forEach((trend, i) => {
        console.log(`\n${i + 1}. ${trend.name.toUpperCase()}`);
        console.log('-'.repeat(60));
        console.log(`   Mentions: ${trend.mentions_today}`);
        console.log(`   Videos found: ${trend.videos.length}`);
        
        if (trend.videos.length > 0) {
          console.log(`   Example: "${trend.videos[0].title}"`);
          console.log(`   Views: ${trend.videos[0].views.toLocaleString()}`);
        }
      });
    }

    console.log('\n\n✅ Test complete! Check above for:\n');
    console.log('1. Videos are in ENGLISH (not Russian, Hindi, etc.)');
    console.log('2. Titles are proper fitness content');
    console.log('3. Views are realistic');
    console.log('4. Same niche should vary by region\n');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    process.exit(1);
  }
}

runTest();
