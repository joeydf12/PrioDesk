
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1b6a275525394385960c7b0545f304a9',
  appName: 'task-whisper-ai-planner',
  webDir: 'dist',
  server: {
    url: 'https://1b6a2755-2539-4385-960c-7b0545f304a9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: false
    }
  }
};

export default config;
