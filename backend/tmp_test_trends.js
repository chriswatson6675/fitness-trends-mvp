const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
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
  console.log('videos len', result.videos.length);
  const titles = result.videos.map((v) => v.title);
  const counts = countKeywordMentions(titles);
  const entries = Object.entries(counts).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log('top', JSON.stringify(entries.slice(0, 10), null, 2));
  const grouped = groupVideosByKeyword(result.videos);
  console.log('grouped keys', Object.keys(grouped).slice(0, 20));
  entries.slice(0, 5).forEach(([keyword]) => {
    console.log('keyword', keyword, 'videos', (grouped[keyword] || []).length);
  });
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
