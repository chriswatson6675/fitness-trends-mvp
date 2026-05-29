// YouTube Data API v3 scraper for fitness trends
const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

if (!process.env.YOUTUBE_API_KEY) {
  throw new Error('YOUTUBE_API_KEY environment variable is not set');
}

// Fitness-specific search queries
const fitnessSearches = [
  'fitness workout',
  'yoga tutorial',
  'hiit training',
  'gym workout',
  'pilates',
  'calisthenics',
  'bodyweight training',
  'home workout',
  'cardio exercise',
  'weight training',
];

async function getYouTubeTrends(region = 'GB') {
  try {
    const allVideos = [];
    const publishedAfter = new Date();
    publishedAfter.setHours(publishedAfter.getHours() - 24);

    // Search for each fitness keyword
    for (const query of fitnessSearches) {
      try {
        const searchParams = {
          part: 'snippet',
          q: query,
          type: 'video',
          order: 'viewCount',
          publishedAfter: publishedAfter.toISOString(),
          maxResults: 20,
          relevanceLanguage: 'en',
        };

        if (region !== 'GLOBAL') {
          searchParams.regionCode = region;
        }

        const response = await youtube.search.list(searchParams);

        if (response.data.items) {
          // Get video statistics for each video
          const videoIds = response.data.items
            .map((item) => item?.id?.videoId)
            .filter(Boolean);

          if (videoIds.length === 0) continue;

          const statsResponse = await youtube.videos.list({
            part: 'statistics,snippet',
            id: videoIds.join(','),
          });

          if (statsResponse?.data?.items) {
            allVideos.push(...statsResponse.data.items);
          }
        }
        } catch (err) {
        const logger = require('./logger');
        logger.error(`Error searching for "${query}": ${err?.message || err}`);
      }
    }

    // Remove duplicates by video ID
    const uniqueVideos = {};
    allVideos.forEach((video) => {
      if (!uniqueVideos[video.id]) {
        uniqueVideos[video.id] = video;
      }
    });

    const videoList = Object.values(uniqueVideos);

    // Extract fitness keywords and group videos
    const keywordMap = {};

    videoList.forEach((video) => {
      const title = String(video.snippet?.title || '').toLowerCase();
      const views = parseInt(String(video.statistics?.viewCount || '0'), 10) || 0;
      const publishedAt = video.snippet?.publishedAt ? new Date(video.snippet.publishedAt) : null;

      // Calculate velocity as views per hour since upload (min 1 hour)
      let velocity = 0;
      if (publishedAt) {
        const hoursSince = Math.max(1, (Date.now() - publishedAt.getTime()) / 3600000);
        velocity = Math.round(views / hoursSince);
      }

      // Match against fitness keywords
      fitnessSearches.forEach((keyword) => {
        if (title.includes(keyword.toLowerCase())) {
          if (!keywordMap[keyword]) {
            keywordMap[keyword] = {
              keyword,
              videos: [],
              totalViews: 0,
              count: 0,
            };
          }

          keywordMap[keyword].videos.push({
            title: String(video.snippet?.title || ''),
            url: `https://www.youtube.com/watch?v=${video.id}`,
            views,
            uploadedAt: video.snippet?.publishedAt,
            velocity,
          });

          keywordMap[keyword].totalViews += views;
          keywordMap[keyword].count += 1;
        }
      });
    });

    // Convert to array and sort by total views
    const trends = Object.values(keywordMap)
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10)
      .map((trend, index) => ({
        id: index + 1,
        name: trend.keyword,
        platform: 'youtube',
        mentions_today: trend.count,
        mentions_yesterday: 0,
        velocity: trend.count > 0 ? 100 : 0,
        videos: trend.videos.sort((a, b) => b.views - a.views).slice(0, 5),
        sentiment: 'positive',
        longevity_days: 90,
        content_ideas: generateContentIdeas(trend.keyword),
      }));

    return trends;
  } catch (error) {
    const logger = require('./logger');
    logger.error('Error fetching YouTube trends:', error);
    return [];
  }
}

function generateContentIdeas(trend) {
  const ideas = {
    'fitness workout': [
      '30-day home workout challenge for beginners',
      'Science-backed exercises for maximum results',
      'Quick 15-minute daily fitness routines',
    ],
    yoga: [
      'Beginner yoga poses for flexibility and stress relief',
      'How yoga improves mental health and mindfulness',
      'Home yoga routines for different fitness levels',
    ],
    'hiit training': [
      '30-minute HIIT workout for beginners at home',
      'Science behind why HIIT burns more calories than steady cardio',
      'HIIT vs traditional cardio: which is better for your goals?',
    ],
    pilates: [
      'Core strengthening routines for beginners',
      'Pilates vs yoga: which is right for you',
      'Celebrity pilates transformations and results',
    ],
    calisthenics: [
      'Progressive bodyweight progression routines for beginners',
      'Calisthenics vs gym training: strength gains comparison',
      'Advanced skills like handstands and muscle-ups tutorials',
    ],
    'gym workout': [
      'Complete beginner guide to gym equipment',
      'Full-body gym routine for muscle building',
      'Common gym mistakes and how to fix them',
    ],
    'bodyweight training': [
      'No-equipment workout guides for travel and home fitness',
      'Bodyweight exercise progressions from beginner to advanced',
      'Build muscle without weights: science-backed routines',
    ],
    'home workout': [
      'Space-saving home gym setup under £500',
      'Equipment-free home workouts for any fitness level',
      'High-intensity home workouts without disturbing neighbors',
    ],
    'cardio exercise': [
      'Low-impact cardio alternatives for joint health',
      'Cardio myths debunked: efficiency vs duration',
      'Best cardio workouts for different fitness goals',
    ],
    'weight training': [
      'Progressive weight training routine for beginners',
      'How to safely increase weight and intensity',
      'Common weight training injuries and prevention',
    ],
  };

  return ideas[trend] || [
    `${trend} for beginners`,
    `Advanced ${trend} techniques`,
    `${trend} transformation stories`,
  ];
}

module.exports = { getYouTubeTrends };
