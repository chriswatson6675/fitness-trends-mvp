'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchTrends, checkHealth, detectBackendUrl } from '../../lib/api';
import TrendCard from '../../components/TrendCard';
import styles from './dashboard.module.css';

const REGION_OPTIONS = [
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'US', label: '🇺🇸 USA' },
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'GLOBAL', label: '🌍 Global' }
];

export default function Dashboard() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState('checking');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('GB');
  const [regionLabel, setRegionLabel] = useState('🇬🇧 United Kingdom');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const initialize = async () => {
      let initialRegion = 'GB';
      try {
        const savedRegion = window.localStorage.getItem('fitness-trends-region');
        if (REGION_OPTIONS.some((option) => option.code === savedRegion)) {
          initialRegion = savedRegion;
        }
      } catch (storageError) {
        console.warn('Unable to read saved region from localStorage:', storageError);
      }

      const initialLabel = REGION_OPTIONS.find((option) => option.code === initialRegion)?.label || '🇬🇧 United Kingdom';
      setSelectedRegion(initialRegion);
      setRegionLabel(initialLabel);

      try {
        await detectBackendUrl();
      } catch (err) {
        setError(err.message || 'Unable to detect backend port');
      }
      await loadData(null, initialRegion);
    };

    initialize();
    setLastUpdated(new Date().toLocaleString('en-GB'));
  }, []);

  const loadData = async (platform = selectedPlatform, region = selectedRegion) => {
    setLoading(true);
    setError(null);

    // Check API health
    let healthResponse = { status: 'offline' };
    try {
      healthResponse = await checkHealth();
    } catch (healthError) {
      console.error('Health check failed:', healthError);
    }
    setHealthStatus(healthResponse.status || 'offline');

    // Fetch trends
    const response = await fetchTrends(10, platform, region);
    const trendData = response.data || response.trends || [];

    if (response.error) {
      setError(response.error);
      setTrends(getMockTrends());
    } else {
      setTrends(trendData.length > 0 ? trendData : getMockTrends());
    }

    setLoading(false);
  };

  const handlePlatformSelect = async (platform) => {
    setSelectedPlatform(platform);
    await loadData(platform, selectedRegion);
  };

  const handleRegionChange = async (region) => {
    setSelectedRegion(region);
    const regionInfo = REGION_OPTIONS.find((option) => option.code === region);
    setRegionLabel(regionInfo?.label || region);
    try {
      window.localStorage.setItem('fitness-trends-region', region);
    } catch (storageError) {
      console.warn('Unable to save region to localStorage:', storageError);
    }
    await loadData(selectedPlatform, region);
  };

  const getMockTrends = () => [
    {
      id: 1,
      name: 'Pilates for Beginners',
      platform: 'youtube',
      category: 'workouts',
      mentions_today: 180,
      mentions_yesterday: 120,
      velocity: 50,
      sentiment: 'positive',
      longevity_days: 90,
      content_ideas: [
        '10-minute beginner Pilates routine (no equipment)',
        'Pilates vs Yoga: Which is better for weight loss?',
        'Core transformation: My 30-day Pilates challenge',
      ],
    },
    {
      id: 2,
      name: 'Cold Plunge Recovery',
      platform: 'instagram',
      category: 'recovery',
      mentions_today: 47,
      mentions_yesterday: 38,
      velocity: 23,
      sentiment: 'positive',
      longevity_days: 60,
      content_ideas: [
        'My first cold plunge experience (raw reaction)',
        'Cold plunge vs sauna: Which recovers better?',
        'Cold water therapy: Science vs hype',
      ],
    },
    {
      id: 3,
      name: 'HIIT Home Workouts',
      platform: 'tiktok',
      category: 'workouts',
      mentions_today: 203,
      mentions_yesterday: 175,
      velocity: 16,
      sentiment: 'positive',
      longevity_days: 45,
      content_ideas: [
        '20-minute full-body HIIT (apartment-friendly)',
        'HIIT vs steady cardio: Which burns more fat?',
        'HIIT recovery: Do this after intense workouts',
      ],
    },
    {
      id: 4,
      name: 'Muscle-Building Nutrition',
      platform: 'youtube',
      category: 'nutrition',
      mentions_today: 95,
      mentions_yesterday: 110,
      velocity: -14,
      sentiment: 'neutral',
      longevity_days: 120,
      content_ideas: [
        'Complete muscle-building meal plan (£50/week)',
        'Protein myths debunked: How much do you really need?',
        'Best foods for muscle growth on a budget',
      ],
    },
    {
      id: 5,
      name: 'Home Gym Setup',
      platform: 'tiktok',
      category: 'equipment',
      mentions_today: 67,
      mentions_yesterday: 72,
      velocity: -7,
      sentiment: 'positive',
      longevity_days: 180,
      content_ideas: [
        'Complete home gym setup for £500',
        'Essential equipment vs nice-to-have (ranked)',
        'Space-saving home gym hacks',
      ],
    },
  ];

  const platforms = ['youtube', 'tiktok', 'instagram'];
  const filteredTrends = selectedPlatform
    ? trends.filter((t) => t.platform === selectedPlatform)
    : trends;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>🔥 Fitness Trends Dashboard</h1>
            <p>Top trending fitness topics across platforms</p>
            <p className={styles.regionTag}>Trending in: {regionLabel}</p>
          </div>
          <div className={styles.headerMeta}>
            <div className={`${styles.status} ${styles[`status-${healthStatus}`]}`}>
              {healthStatus === 'ok' ? '🟢' : '🔴'} Backend {healthStatus}
            </div>
            <Link href="/" className="btn btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="region-select">Region:</label>
          <select
            id="region-select"
            className={styles.regionSelect}
            value={selectedRegion}
            onChange={(event) => handleRegionChange(event.target.value)}
          >
            {REGION_OPTIONS.map((region) => (
              <option key={region.code} value={region.code}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Filter by Platform:</label>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${!selectedPlatform ? styles.active : ''}`}
              onClick={() => handlePlatformSelect(null)}
            >
              All Platforms
            </button>
            {platforms.map((platform) => (
              <button
                key={platform}
                className={`${styles.filterBtn} ${
                  selectedPlatform === platform ? styles.active : ''
                }`}
                onClick={() => handlePlatformSelect(platform)}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => loadData(selectedPlatform, selectedRegion)} disabled={loading}>
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </section>

      {/* Error Message */}
      {error && (
        <div className={styles.alert}>
          <strong>⚠️ Warning:</strong> Couldn't connect to backend. Showing demo data.{' '}
          <code>{error}</code>
        </div>
      )}

      {/* Trends Grid */}
      <section className={styles.trendsGrid}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading trends...</p>
          </div>
        ) : filteredTrends.length > 0 ? (
          filteredTrends.map((trend) => <TrendCard key={trend.id} trend={trend} />)
        ) : (
          <div className={styles.empty}>
            <p>No trends found for the selected filters.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Last updated: {lastUpdated || 'Loading...'}</p>
        <p className={styles.footerNote}>
          💡 Free tier shows demo data. Upgrade to Pro for real YouTube/TikTok trends.
        </p>
      </footer>
    </div>
  );
}
