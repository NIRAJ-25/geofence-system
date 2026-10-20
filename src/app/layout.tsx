import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GeoFence — Smart Location & Geofencing System',
  description:
    'Web-based geofencing system featuring real-time browser geolocation, virtual perimeter event detection, distance tracking, and location analytics.',
  keywords: ['geofencing', 'geolocation', 'haversine', 'openstreetmap', 'leaflet', 'overpass api', 'gis', 'real-time location', 'event detection'],
  authors: [{ name: 'GeoFence Team' }]
};

import { LocationProvider } from '@/context/LocationContext';
import { AuthSessionCleaner } from '@/components/common/AuthSessionCleaner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        <AuthSessionCleaner />
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  );
}
