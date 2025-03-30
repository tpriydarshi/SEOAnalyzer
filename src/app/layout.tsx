import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO Analyzer',
  description: 'Analyze website SEO meta tags and get recommendations for improvement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
