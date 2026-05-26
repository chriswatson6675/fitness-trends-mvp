const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const { analyzetrend } = require('./lib/claude');
const { searchTrendingFitness } = require('./lib/youtube');
const { saveTrend, getTrends } = require('./lib/database');

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: process.uptime() });
});

app.get('/api/trends', async (req, res) => {
  const placeholderTrends = [
    { name: 'Micro Workouts', mentions: 1840 },
    { name: 'Resistance Band Training', mentions: 1565 },
    { name: 'Smart Home Gym Gear', mentions: 1420 },
    { name: 'HIIT Recovery', mentions: 1290 },
    { name: 'Wearable Heart Rate Zones', mentions: 1175 },
    { name: 'Mindful Movement', mentions: 1098 },
    { name: 'Plant-Based Sports Nutrition', mentions: 995 },
    { name: 'Outdoor Cross-Training', mentions: 870 },
    { name: 'Sleep Optimization', mentions: 765 },
    { name: 'Virtual Fitness Challenges', mentions: 650 }
  ];

  res.json({ trends: placeholderTrends });
});

app.post('/api/analyze', async (req, res) => {
  const { trendName, mentions } = req.body;
  if (!trendName) {
    return res.status(400).json({ error: 'trendName is required' });
  }

  try {
    const analysis = await analyzetrend(trendName, Number(mentions) || 0);

    try {
      await saveTrend({
        trendName,
        mentions: Number(mentions) || 0,
        ...analysis
      });
    } catch (saveError) {
      console.warn('Warning: supabase saveTrend failed:', saveError.message);
    }

    res.json({ trendName, mentions: Number(mentions) || 0, analysis });
  } catch (error) {
    console.error('Analyze endpoint error:', error);
    res.status(500).json({ error: 'Unable to analyze trend' });
  }
});

app.get('/api/youtube/trending', (req, res) => {
  res.json({ videos: searchTrendingFitness() });
});

app.listen(PORT, () => {
  console.log(`Fitness Trends MVP backend running on http://localhost:${PORT}`);
});
