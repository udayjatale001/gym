
'use client';

import { AdMob, BannerAdPosition, BannerAdSize, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export const AD_IDS = {
  APP_ID: 'ca-app-pub-6399399331218914~5470056970',
  BANNER: 'ca-app-pub-6399399331218914/5905171243',
  INTERSTITIAL: 'ca-app-pub-6399399331218914/6509075397',
};

export async function initializeAdMob() {
  if (!Capacitor.isNativePlatform()) {
    console.log('AdMob: Native platform not detected. Initialization skipped.');
    return;
  }

  try {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: [],
      initializeForTesting: false,
    });
    console.log('AdMob: Native SDK Initialized');
  } catch (error) {
    console.error('AdMob: Initialization failed', error);
  }
}

export async function showNativeBanner() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const options = {
      adId: AD_IDS.BANNER,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false
    };
    await AdMob.showBanner(options);
    console.log('AdMob: Native Banner Visible');
  } catch (error) {
    console.error('AdMob: Banner failed', error);
  }
}

export async function hideNativeBanner() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.hideBanner();
  } catch (error) {
    console.error('AdMob: Hide banner failed', error);
  }
}

export async function triggerNativeInterstitial() {
  if (!Capacitor.isNativePlatform()) {
    console.log('AdMob: Interstitial triggered (Web Simulator - No Op)');
    return;
  }

  try {
    await AdMob.prepareInterstitial({
      adId: AD_IDS.INTERSTITIAL,
      isTesting: false
    });
    await AdMob.showInterstitial();
    console.log('AdMob: Native Interstitial Displayed');
  } catch (error) {
    console.error('AdMob: Interstitial failed', error);
  }
}
