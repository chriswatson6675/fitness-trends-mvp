'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // TODO: Connect to backend subscription endpoint
      console.log('Subscribed:', email);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <h1 className={styles.logo}>🔥 Fitness Trends</h1>
          <Link href="/dashboard" className="btn btn-primary">
            View Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Stop Wasting 2 Hours Scrolling TikTok</h1>
          <p className={styles.heroSubtitle}>
            Get 10 trending fitness topics + 3 specific video ideas every morning.
            <br />
            <strong>Post early. Get more views.</strong>
          </p>

          {/* Hero CTA */}
          <form onSubmit={handleSubscribe} className={styles.form}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={subscribed}
            />
            <button type="submit" className="btn btn-primary" disabled={subscribed}>
              {subscribed ? '✓ Subscribed!' : 'Get Early Access (Free)'}
            </button>
          </form>

          {subscribed && (
            <p className={styles.successMessage}>
              ✓ Check your email for the welcome link. First trends come tomorrow morning.
            </p>
          )}
        </div>

        <div className={styles.heroImage}>
          <div className={styles.mockDashboard}>
            <div className={styles.mockCard}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
              <div style={{ fontWeight: '700' }}>Pilates Trends</div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                +45% momentum
              </div>
            </div>
            <div className={styles.mockCard}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❄️</div>
              <div style={{ fontWeight: '700' }}>Cold Plunge</div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                +23% momentum
              </div>
            </div>
            <div className={styles.mockCard}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💪</div>
              <div style={{ fontWeight: '700' }}>HIIT Training</div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                +18% momentum
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className={styles.section}>
        <h2>The Problem</h2>
        <div className={styles.grid}>
          <div className={styles.problemCard}>
            <div className={styles.problemIcon}>⏰</div>
            <h3>2-3 hours wasted daily</h3>
            <p>Scrolling TikTok, YouTube, Instagram to spot trends</p>
          </div>
          <div className={styles.problemCard}>
            <div className={styles.problemIcon}>📉</div>
            <h3>Late to market</h3>
            <p>
              By the time you see a trend, 10,000 creators are already posting it
            </p>
          </div>
          <div className={styles.problemCard}>
            <div className={styles.problemIcon}>👁️</div>
            <h3>No cross-platform view</h3>
            <p>Trends on TikTok might not be visible on YouTube or Instagram</p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className={styles.section}>
        <h2>The Solution</h2>
        <div className={styles.solutionContent}>
          <div className={styles.solutionText}>
            <h3>Fitness Trends monitors YouTube, TikTok, and Instagram in real-time.</h3>
            <p>
              Our AI analyzes which trends will last 2 weeks vs. 6 months, and gives you 3
              specific video ideas you can film today.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                <div>
                  <strong>Top 10 trends daily</strong> — Find what's actually trending
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                <div>
                  <strong>Longevity prediction</strong> — Know if it lasts 7 days or 6 months
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                <div>
                  <strong>3 video ideas</strong> — Actionable content ideas you can film today
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                <div>
                  <strong>Email alerts</strong> — Get notified when trends spike 25%+
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                <div>
                  <strong>Cross-platform</strong> — YouTube, TikTok, Instagram in one place
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.section}>
        <h2>Simple Pricing</h2>
        <div className={styles.pricingGrid}>
          <div className={`${styles.pricingCard} ${styles.pricingFree}`}>
            <h3>Free Tier</h3>
            <div className={styles.price}>Free</div>
            <ul className={styles.featureList}>
              <li>5 trends per day</li>
              <li>Basic sentiment analysis</li>
              <li>1 alert per day</li>
              <li>Email delivery</li>
            </ul>
            <button className="btn btn-outline">Get Started</button>
          </div>

          <div className={`${styles.pricingCard} ${styles.pricingPro}`}>
            <div className={styles.badge}>Popular</div>
            <h3>Pro Tier</h3>
            <div className={styles.price}>
              £9.99<span>/month</span>
            </div>
            <ul className={styles.featureList}>
              <li>✓ Unlimited trends</li>
              <li>✓ Advanced analysis (Sonnet)</li>
              <li>✓ Unlimited alerts</li>
              <li>✓ Historical tracking</li>
              <li>✓ CSV exports</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="btn btn-primary">Start Free Trial (7 days)</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to Find Trends First?</h2>
        <p>Join hundreds of creators getting early access to trending fitness topics.</p>
        <form onSubmit={handleSubscribe} className={styles.formCta}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={subscribed}
          />
          <button type="submit" className="btn btn-primary" disabled={subscribed}>
            {subscribed ? '✓ Subscribed!' : 'Get Free Access'}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Fitness Trends. Built for creators, by creators.</p>
        <div className={styles.footerLinks}>
          <a href="mailto:hi@fitnesstrends.io">Contact</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}
