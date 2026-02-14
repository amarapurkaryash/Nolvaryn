import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'Nolvaryn - Email Phishing Analyzer',
  description: 'AI-powered email phishing analysis with deep forensics and actionable reports.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600;700&family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-primary-bg">
        {/* Mobile Warning */}
        <div className="mobile-warning">
          <div className="mobile-warning-content">
            <div className="mobile-warning-icon material-symbols-outlined">
              laptop
            </div>
            <h1>Desktop Only Application</h1>
            <p>
              Nolvaryn is optimized for desktop and laptop screens. The detailed email analysis interface
              requires a larger display to provide the best user experience.
            </p>
            <ul className="mobile-warning-list">
              <li>Comprehensive threat analysis visualization</li>
              <li>Detailed email header inspection</li>
              <li>Interactive geolocation tracking</li>
              <li>Advanced phishing detection tools</li>
            </ul>
            <p>
              Please access Nolvaryn from a desktop or laptop device to use all features properly.
            </p>
          </div>
        </div>

        {/* Main Content - Hidden on mobile */}
        <div className="main-content">
          {children}
        </div>

        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
