/**
 * Shared utility functions for the TTB Evaluator
 */
import type React from 'react';

// ============================================
// Validation
// ============================================

export function isValidGitHubUrl(url: string): boolean {
  return url.startsWith('https://github.com/');
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

export function extractRepoName(url: string | undefined | null): string {
  if (!url) return 'Unknown repository';
  try {
    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : url;
  } catch {
    return url;
  }
}

// ============================================
// Score utilities
// ============================================

export type ScoreTier = {
  label: string;
  color: string;
  variant?: 'success' | 'warning' | 'danger';
  style?: React.CSSProperties;
};

/**
 * Get performance tier based on score (out of 90)
 */
export function getPerformanceTier(score: number): ScoreTier {
  if (score >= 75) return { label: 'Excellent', color: 'bg-success-100 text-success-700 border-success-200', variant: 'success' };
  if (score >= 54) return { label: 'Proficient', color: 'bg-warning-100 text-warning-600 border-warning-200', variant: 'warning' };
  return { label: 'Needs Work', color: 'bg-danger-100 text-danger-600 border-danger-200', variant: 'danger' };
}

/**
 * Get score tier with gradient styling (for badges)
 * Uses inline styles to avoid Tailwind purge issues with dynamic classes
 */
export function getScoreTierGradient(score: number, max: number): ScoreTier {
  const pct = (score / max) * 100;
  if (pct >= 83) return { 
    label: 'Excellent', 
    color: '',
    style: { background: 'linear-gradient(to right, #10b981, #059669)' } // success-500 to success-600
  };
  if (pct >= 60) return { 
    label: 'Good', 
    color: '',
    style: { background: 'linear-gradient(to right, #f59e0b, #d97706)' } // warning-500 to warning-600
  };
  return { 
    label: 'Needs Work', 
    color: '',
    style: { background: 'linear-gradient(to right, #ef4444, #dc2626)' } // danger-500 to danger-600
  };
}

/**
 * Get text color class based on score percentage
 */
export function getScoreColor(score: number, max: number = 100): string {
  const pct = (Math.max(0, score || 0) / Math.max(1, max || 100)) * 100;
  if (pct >= 80) return 'text-success-600';
  if (pct >= 60) return 'text-warning-600';
  return 'text-danger-600';
}

/**
 * Get background color class based on score percentage
 */
export function getScoreBg(score: number, max: number = 100): string {
  const pct = (Math.max(0, score || 0) / Math.max(1, max || 100)) * 100;
  if (pct >= 80) return 'bg-success-500';
  if (pct >= 60) return 'bg-warning-500';
  return 'bg-danger-500';
}

/**
 * Get grade label based on percentage
 */
export function getGradeLabel(percentage: number): { label: string; color: string } {
  if (percentage >= 80) return { label: 'Excellent', color: 'text-success-600 bg-success-50' };
  if (percentage >= 60) return { label: 'Good', color: 'text-warning-600 bg-warning-50' };
  if (percentage >= 40) return { label: 'Fair', color: 'text-warning-600 bg-warning-50' };
  return { label: 'Needs Work', color: 'text-danger-600 bg-danger-50' };
}

