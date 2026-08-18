// ─────────────────────────────────────────────────────────────
// Anonymous Analytics Tracking
// ─────────────────────────────────────────────────────────────

type EventName =
  | "analysis_started"
  | "analysis_completed"
  | "analysis_failed"
  | "github_analysis"
  | "zip_analysis"
  | "share_report"
  | "recommended_platform";

interface TrackEventParams {
  name: EventName;
  properties?: Record<string, string | number | boolean | null>;
}

export const analytics = {
  /**
   * Tracks an anonymous event.
   * In development, this just logs to the console.
   * In production, it can be wired up to PostHog, Mixpanel, or Vercel Analytics.
   */
  track: (params: TrackEventParams) => {
    // Only track useful product events, absolutely no source code or PII
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${params.name}`, params.properties || {});
    }

    // Example of how to wire up a real provider later:
    // if (process.env.POSTHOG_KEY) {
    //   posthog.capture(params.name, params.properties);
    // }
  },

  /**
   * Helper to track analysis completion specifically
   */
  trackAnalysisCompleted: (result: {
    language: string;
    framework: string | null;
    deploymentType: string;
    topPlatform: string;
  }) => {
    analytics.track({
      name: "analysis_completed",
      properties: result,
    });
  },
};
