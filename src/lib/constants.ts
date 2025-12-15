/**
 * Frontend constants
 * Note: These values should match src/shared/constants.ts PERFORMANCE_TIERS
 */

// Performance tier score thresholds (out of 90)
export const SCORE_THRESHOLDS = {
  EXCELLENT_MIN: 75,   // >= 75/90 = 83%+
  PROFICIENT_MIN: 54,  // >= 54/90 = 60%+
  // Below 54 = needs improvement
} as const;

// Scoring constants
export const MAX_RUBRIC_SCORE = 90;

// Time thresholds for evaluation status (in seconds)
export const TIME_THRESHOLDS = {
  WARNING: 480,   // 8 minutes - show warning
  CRITICAL: 720,  // 12 minutes - show critical status
  STUCK: 240,     // 4 minutes on same test = stuck
} as const;



