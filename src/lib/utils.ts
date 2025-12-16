/**
 * Shared utility functions for the TTB Evaluator
 */
import type React from 'react';
import { SCORE_THRESHOLDS } from './constants';

// ============================================
// Validation
// ============================================

const GITHUB_REPO_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
const GITLAB_REPO_REGEX = /^https?:\/\/(www\.)?(gitlab\.com|gitlab\.[a-z]+(\.[a-z]+)?)(\/[\w.-]+){2,}\/?$/;

export function isValidRepoUrl(url: string): boolean {
  return GITHUB_REPO_REGEX.test(url) || GITLAB_REPO_REGEX.test(url);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Formatting
// ============================================

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'Unknown date';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeDate(dateStr: string | undefined | null): string {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
}

export function extractRepoName(url: string | undefined | null): string {
  if (!url) return 'Unknown repository';
  try {
    // Try GitHub format
    const githubMatch = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    if (githubMatch) return githubMatch[1];
    
    // Try GitLab format
    const gitlabMatch = url.match(/gitlab\.[^\/]+\/(.+?)(?:\.git)?$/);
    if (gitlabMatch) return gitlabMatch[1];
    
    return url;
  } catch {
    return url;
  }
}

// ============================================
// Score utilities (consolidated)
// ============================================

export type ScoreVariant = 'success' | 'warning' | 'danger';

export interface ScoreTier {
  label: string;
  variant: ScoreVariant;
  color: string;
  style?: React.CSSProperties;
}

// Color definitions for each variant
const SCORE_COLORS = {
  success: {
    text: 'text-success-600',
    bg: 'bg-success-500',
    badge: 'text-success-600 bg-success-50',
    full: 'bg-success-100 text-success-700 border-success-200',
    gradient: 'linear-gradient(to right, #10b981, #059669)',
    hex: '#10b981',
  },
  warning: {
    text: 'text-warning-600',
    bg: 'bg-warning-500',
    badge: 'text-warning-600 bg-warning-50',
    full: 'bg-warning-100 text-warning-600 border-warning-200',
    gradient: 'linear-gradient(to right, #f59e0b, #d97706)',
    hex: '#f59e0b',
  },
  danger: {
    text: 'text-danger-600',
    bg: 'bg-danger-500',
    badge: 'text-danger-600 bg-danger-50',
    full: 'bg-danger-100 text-danger-600 border-danger-200',
    gradient: 'linear-gradient(to right, #ef4444, #dc2626)',
    hex: '#ef4444',
  },
} as const;

/**
 * Core function: compute percentage and determine tier
 */
function computeScoreTier(score: number, max: number): { pct: number; variant: ScoreVariant; label: string } {
  const pct = (Math.max(0, score || 0) / Math.max(1, max || 100)) * 100;
  
  if (pct >= 80) return { pct, variant: 'success', label: 'Excellent' };
  if (pct >= 60) return { pct, variant: 'warning', label: 'Good' };
  if (pct >= 40) return { pct, variant: 'warning', label: 'Fair' };
  return { pct, variant: 'danger', label: 'Needs Work' };
}

/**
 * Get performance tier based on score (out of 90 by default)
 * Used in history list items, badges, etc.
 */
export function getPerformanceTier(score: number, max: number = 90): ScoreTier {
  // Use original thresholds for 90-point rubric
  if (max === 90) {
    if (score >= SCORE_THRESHOLDS.EXCELLENT_MIN) {
      return { label: 'Excellent', variant: 'success', color: SCORE_COLORS.success.full };
    }
    if (score >= SCORE_THRESHOLDS.PROFICIENT_MIN) {
      return { label: 'Proficient', variant: 'warning', color: SCORE_COLORS.warning.full };
    }
    return { label: 'Needs Work', variant: 'danger', color: SCORE_COLORS.danger.full };
  }
  
  // Generic percentage-based for other max values
  const { variant, label } = computeScoreTier(score, max);
  return { label, variant, color: SCORE_COLORS[variant].full };
}

/**
 * Get score tier with gradient styling (for header badges)
 */
export function getScoreTierGradient(score: number, max: number): ScoreTier {
  const { variant, label } = computeScoreTier(score, max);
  return {
    label,
    variant,
    color: '',
    style: { background: SCORE_COLORS[variant].gradient },
  };
}

/**
 * Get text color class based on score
 */
export function getScoreColor(score: number, max: number = 100): string {
  const { variant } = computeScoreTier(score, max);
  return SCORE_COLORS[variant].text;
}

/**
 * Get background color class based on score
 */
export function getScoreBg(score: number, max: number = 100): string {
  const { variant } = computeScoreTier(score, max);
  return SCORE_COLORS[variant].bg;
}

/**
 * Get hex color based on score (for inline styles)
 */
export function getScoreHex(score: number, max: number = 100): string {
  const { variant } = computeScoreTier(score, max);
  return SCORE_COLORS[variant].hex;
}

/**
 * Get grade label with badge styling
 */
export function getGradeLabel(percentage: number): { label: string; color: string } {
  const { variant, label } = computeScoreTier(percentage, 100);
  return { label, color: SCORE_COLORS[variant].badge };
}

