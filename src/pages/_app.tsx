import type { AppProps } from 'next/app';
import { env } from '@/config/env';

// Expose environment variables to the client
if (typeof window !== 'undefined') {
  window.ENV = env;
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
} 