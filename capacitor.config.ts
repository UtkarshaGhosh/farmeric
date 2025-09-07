import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8e527ba874d246388334572af5e144a9',
  appName: 'herd-guard-connect',
  webDir: 'dist',
  server: {
    url: 'https://8e527ba8-74d2-4638-8334-572af5e144a9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;