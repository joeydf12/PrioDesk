export const env = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
} as const;

// Type declaration for window.ENV
declare global {
  interface Window {
    ENV: typeof env;
  }
} 