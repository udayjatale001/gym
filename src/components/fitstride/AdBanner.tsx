
'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { showNativeBanner, hideNativeBanner } from '@/lib/admob';

export function AdBanner() {
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    if (!initialized.current) {
      if (Capacitor.isNativePlatform()) {
        showNativeBanner();
      }
      initialized.current = true;
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        hideNativeBanner();
      }
    };
  }, []);

  // Web fallback: Minimal placeholder to reserve space for native overlay
  // or show a web-ad if needed. For Capacitor, AdMob.showBanner 
  // usually overlays on top of the webview.
  return (
    <div className="w-full h-[50px] bg-black pointer-events-none flex items-center justify-center border-t border-white/5 relative z-[40]">
       {!Capacitor.isNativePlatform() && (
         <div className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">
           NATIVE AD SLOT: ca-app-pub-6399399331218914/5905171243
         </div>
       )}
    </div>
  );
}
