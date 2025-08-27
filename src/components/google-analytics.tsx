"use client";

import Script from 'next/script';
import { useEffect } from 'react';
import { initGA } from '@/lib/analytics';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const GA_MEASUREMENT_ID = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    // Initialize GA after scripts load
    if (GA_MEASUREMENT_ID) {
      initGA();
    }
  }, [GA_MEASUREMENT_ID]);

  if (!GA_MEASUREMENT_ID) {
    // Don't render anything if no measurement ID is provided
    return null;
  }

  return (
    <>
      {/* Load Google Analytics script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      
      {/* Initialize Google Analytics */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: 'Excel to PDF Converter',
              debug_mode: ${process.env.NODE_ENV === 'development'},
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}
