const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
console.log = () => {};
console.error = () => {};
const { searchTrendingFitness } = require('./lib/youtube');
const KEYWORDS = [
  'pilates','calisthenics','hiit','yoga','crossfit','strength training','functional training','barre','mobility','bodyweight','kettlebell','spin','dance fitness','bootcamp','stretch','cardio','boxing','interval training','core training','stretching'
];
const escapeKeyword = (keyword) => keyword.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
const matchKeywords = (title) => {
  const matched = [];
  const normalized = title || '';
  KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${escapeKeyword(keyword)}\\b`, 'gi');
    if (regex.test(normalized)) matched.push(keyword);
  });
  return matched;
};
const countKeywordMentions = (titles) => {
  const counts = {};
  titles.forEach((title) => {
    const normalized = title || '';
    KEYWORDS.forEach((keyword) => {
      const regex = new RegExp(`\\b${escapeKeyword(keyword)}\\b`, 'gi');
      const matches = normalized.match(regex);
      if (matches && matches.length > 0) {
        counts[keyword] = (counts[keyword] || 0) + matches.length;
      }
    });
  });
  return counts;
};
const groupVideosByKeyword = (videos) => {
  const groups = {};
  videos.forEach((video) => {
    const matched = matchKeywords(video.title);
    matched.forEach((keyword) => {
      groups[keyword] = groups[keyword] || [];
      groups[keyword].push(video);
    });
  });
  return groups;
};
searchTrendingFitness('GB').then((result) => {
  console.log = process.stdout.write.bind(process.stdout);
  console.error = process.stderr.write.bind(process.stderr);
  console.log(JSON.stringify({
    videoCount: result.videos.length,
    topKeywords: Object.entries(countKeywordMentions(result.videos.map(v => v.title))).filter(([k,v]) => v > 0).sort((a,b) => b[1]-a[1]).slice(0,10),
    groupedCounts: Object.entries(groupVideosByKeyword(result.videos)).map(([k,v]) => [k, v.length]).sort((a,b) => b[1]-a[1]).slice(0,10)
  }, null, 2));
}).catch((err) => {
  console.log = process.stdout.write.bind(process.stdout);
  console.error = process.stderr.write.bind(process.stderr);
  console.error('ERR', err, '\n');
  process.exit(1);
});
