'use client';

import styles from './TrendCard.module.css';

export default function TrendCard({ trend }) {
  const {
    name,
    platform,
    velocity = 0,
    sentiment = 'neutral',
    longevity_days = 30,
    content_ideas = [],
    videos = []
  } = trend;

  // Determine momentum arrow
  const momentumIcon = velocity > 10 ? '📈' : velocity < -10 ? '📉' : '→';
  const momentumText = velocity > 0 ? `+${velocity.toFixed(0)}%` : `${velocity.toFixed(0)}%`;

  // Platform badge colors
  const platformColors = {
    youtube: '#FF0000',
    tiktok: '#000000',
    instagram: '#E4405F',
  };

  const formatViews = (value) => {
    return Number(value).toLocaleString();
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'less than 1 hour ago';
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const buildThumbnailUrl = (url) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.trendName}>{name}</h3>
          <p className={styles.platform}>
            <span
              className={styles.badge}
              style={{ backgroundColor: platformColors[platform] || '#666' }}
            >
              {platform?.toUpperCase()}
            </span>
          </p>
        </div>
        <div className={styles.momentum}>
          <div className={styles.momentumValue}>{momentumIcon}</div>
          <div className={styles.momentumText}>{momentumText}</div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Longevity</span>
          <span className={styles.statValue}>{longevity_days} days</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Sentiment</span>
          <span
            className={`${styles.statValue} ${styles[`sentiment-${sentiment}`]}`}
          >
            {sentiment}
          </span>
        </div>
      </div>

      {/* Content Ideas */}
      {content_ideas.length > 0 && (
        <div className={styles.ideas}>
          <h4>Video Ideas:</h4>
          <ul>
            {content_ideas.map((idea, i) => (
              <li key={i}>{idea}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Trending Videos */}
      {videos.length > 0 && (
        <div className={styles.videosSection}>
          <h4>Trending Videos:</h4>
          <div className={styles.videoGrid}>
            {videos.slice(0, 5).map((video, index) => {
              const thumbnailUrl = buildThumbnailUrl(video.url);
              return (
                <a
                  key={`${video.url}-${index}`}
                  className={styles.videoCard}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className={styles.thumbnailWrapper}>
                    {thumbnailUrl ? (
                      <img
                        className={styles.thumbnail}
                        src={thumbnailUrl}
                        alt={video.title}
                        onError={(event) => {
                          event.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="85"><rect width="150" height="85" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial, sans-serif" font-size="12">No thumbnail</text></svg>';
                        }}
                      />
                    ) : (
                      <div className={styles.thumbnailFallback}>
                        No thumbnail
                      </div>
                    )}
                  </div>
                  <p className={styles.videoCaption}>{video.title}</p>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <button className={styles.cta}>View Full Analysis →</button>
    </div>
  );
}
