import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PostHogProvider } from 'posthog-js/react';
import type { PostHogConfig } from 'posthog-js';

/**
 * PostHog Analytics Configuration
 * Using environment variables for better security and flexibility
 */
const POSTHOG_HOST = process.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";
const POSTHOG_KEY = process.env.VITE_POSTHOG_KEY || "phc_Nm0oGNnQvIUxNen0lilOaZl5mAJIwuNbe50vPVNCHqd";

/**
 * PostHog configuration options
 * @type {Partial<PostHogConfig>}
 */
const posthogOptions: Partial<PostHogConfig> = {
  api_host: POSTHOG_HOST,
  cross_subdomain_cookie: true,        // ✅ share identity across tezdm.com + app.tezdm.com
  persistence: 'localStorage+cookie' as const,
  // Ensures SPA pageviews fire on route changes without extra code
  defaults: '2025-05-24' as const,
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <PostHogProvider apiKey={POSTHOG_KEY} options={posthogOptions}>
      <App />
    </PostHogProvider>
  </React.StrictMode>
);
