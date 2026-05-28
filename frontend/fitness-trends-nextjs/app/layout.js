import './globals.css';

export const metadata = {
  title: 'Fitness Trends - Discover Fitness Trends Before They Saturate',
  description: 'Real-time fitness trend analyzer for content creators. Find trending topics and get 3 video ideas daily.',
  keywords: 'fitness trends, content creation, YouTube, TikTok, Instagram, trending topics',
  authors: [{ name: 'Chris Watson' }],
  openGraph: {
    title: 'Fitness Trends MVP',
    description: 'Find fitness trends before they saturate. Get daily trending topics + video ideas.',
    type: 'website',
    url: 'https://fitnesstrends.io',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
