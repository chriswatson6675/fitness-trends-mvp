'use client';

import Link from 'next/link';

export default function GlobalError({ error }) {
  return (
    <html lang="en">
      <body style={{
        minHeight: '100vh',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        color: '#111827',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <main style={{
          maxWidth: 540,
          width: '100%',
          padding: '2rem',
          borderRadius: 18,
          background: 'white',
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>Something went wrong.</p>
          <h1 style={{ margin: '1rem 0', fontSize: '2rem' }}>Dashboard error</h1>
          <p style={{ color: '#475569', lineHeight: 1.75 }}>
            Please refresh the page or try again later. If the problem persists, check your backend connection.
          </p>
          <pre style={{
            margin: '1rem 0',
            padding: '1rem',
            borderRadius: 12,
            background: '#f1f5f9',
            color: '#0f172a',
            fontSize: '0.85rem',
            overflowX: 'auto'
          }}>
            {error?.message}
          </pre>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 10,
              background: '#ff5a2d',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700
            }}>
              Reload Dashboard
            </Link>
            <Link href="/" style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              textDecoration: 'none',
              fontWeight: 700
            }}>
              Back Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
