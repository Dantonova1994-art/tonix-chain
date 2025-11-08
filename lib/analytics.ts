/**
 * Аналитика продукта (PostHog)
 */

let posthog: any = null;
let initialized = false;

export function initAnalytics() {
  if (typeof window === "undefined" || initialized) return;
  
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com";
  
  if (!key) {
    console.log("ℹ️ PostHog key not configured");
    return;
  }

  // Проверка consent (GDPR)
  const consent = localStorage.getItem("analytics_consent");
  if (consent === "false") {
    console.log("ℹ️ Analytics disabled by user");
    return;
  }

  try {
    import("posthog-js").then((PostHog) => {
      posthog = PostHog.default;
      posthog.init(key, {
        api_host: host,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
      });
      initialized = true;
      console.log("✅ PostHog initialized");
    }).catch((err) => {
      console.warn("⚠️ PostHog initialization failed:", err);
    });
  } catch (err) {
    console.warn("⚠️ PostHog not available:", err);
  }
}

export function captureEvent(event: string, properties?: Record<string, any>) {
  if (!posthog || !initialized) return;
  
  try {
    const context = {
      wallet_short: properties?.wallet?.slice(0, 6) + "..." + properties?.wallet?.slice(-4),
      network: process.env.NEXT_PUBLIC_NETWORK || "mainnet",
      roundId: properties?.roundId,
      app_version: process.env.npm_package_version || "3.0.0",
      ...properties,
    };
    
    posthog.capture(event, context);
    console.log("📊 Event captured:", event, context);
  } catch (err) {
    console.warn("⚠️ Failed to capture event:", err);
  }
}

export function setUserProperties(properties: Record<string, any>) {
  if (!posthog || !initialized) return;
  
  try {
    posthog.identify(properties.wallet || "anonymous", properties);
  } catch (err) {
    console.warn("⚠️ Failed to set user properties:", err);
  }
}

