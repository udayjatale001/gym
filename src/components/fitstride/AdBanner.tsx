'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  adUnitId?: string;
}

export function AdBanner({ adUnitId = "ca-app-pub-6399399331218914/5905171243" }: AdBannerProps) {
  const adRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !adRef.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current = true;
      } catch (err) {
        console.error('AdMob initialization failed', err);
      }
    }
  }, []);

  return (
    <div className="w-full flex justify-center py-2 bg-black/40 border-t border-white/5">
      <div className="max-w-[320px] w-full h-[50px] bg-white/5 flex items-center justify-center relative overflow-hidden">
        <span className="absolute top-1 left-2 text-[6px] font-black text-white/20 uppercase tracking-widest">ADVERTISEMENT</span>
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '320px', height: '50px' }}
          data-ad-client="ca-app-pub-6399399331218914"
          data-ad-slot="5905171243"
        ></ins>
      </div>
    </div>
  );
}
