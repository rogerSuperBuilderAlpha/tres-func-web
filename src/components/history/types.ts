import type { EvaluationSummary } from '@/types';

export type SortField = 'date' | 'score' | 'name';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'flat' | 'grouped';
export type ScoreFilter = 'all' | 'excellent' | 'proficient' | 'needs-work';

export interface RepoGroup {
  repoUrl: string;
  repoName: string;
  evaluations: EvaluationSummary[];
  latestScore: number;
  latestDate: string;
  bestScore: number;
  runCount: number;
}

