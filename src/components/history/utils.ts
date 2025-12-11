import type { EvaluationSummary } from '@/types';
import { extractRepoName } from '@/lib/utils';
import { SCORE_THRESHOLDS } from '@/lib/constants';
import type { RepoGroup, ScoreFilter, SortField, SortOrder } from './types';

export function filterEvaluations(
  evaluations: EvaluationSummary[],
  searchQuery: string,
  scoreFilter: ScoreFilter
): EvaluationSummary[] {
  let result = [...evaluations];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (e) =>
        e.repoUrl.toLowerCase().includes(query) ||
        e.evaluationId.toLowerCase().includes(query) ||
        extractRepoName(e.repoUrl).toLowerCase().includes(query)
    );
  }

  if (scoreFilter !== 'all') {
    result = result.filter((e) => {
      const score = e.rubricScore ?? e.overallScore ?? 0;
      switch (scoreFilter) {
        case 'excellent':
          return score >= SCORE_THRESHOLDS.EXCELLENT_MIN;
        case 'proficient':
          return score >= SCORE_THRESHOLDS.PROFICIENT_MIN && score < SCORE_THRESHOLDS.EXCELLENT_MIN;
        case 'needs-work':
          return score < SCORE_THRESHOLDS.PROFICIENT_MIN;
        default:
          return true;
      }
    });
  }

  return result;
}

export function compareRepoGroups(sortField: SortField, sortOrder: SortOrder) {
  return (a: RepoGroup, b: RepoGroup) => {
    let comparison = 0;
    switch (sortField) {
      case 'date':
        comparison = new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime();
        break;
      case 'score':
        comparison = b.bestScore - a.bestScore;
        break;
      case 'name':
        comparison = a.repoName.localeCompare(b.repoName);
        break;
    }
    return sortOrder === 'desc' ? comparison : -comparison;
  };
}

export function compareEvaluations(sortField: SortField, sortOrder: SortOrder) {
  return (a: EvaluationSummary, b: EvaluationSummary) => {
    let comparison = 0;
    switch (sortField) {
      case 'date':
        comparison = new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime();
        break;
      case 'score':
        comparison = (b.rubricScore ?? b.overallScore ?? 0) - (a.rubricScore ?? a.overallScore ?? 0);
        break;
      case 'name':
        comparison = extractRepoName(a.repoUrl).localeCompare(extractRepoName(b.repoUrl));
        break;
    }
    return sortOrder === 'desc' ? comparison : -comparison;
  };
}

export function groupEvaluationsByRepo(filteredEvaluations: EvaluationSummary[]): RepoGroup[] {
  const groups = new Map<string, RepoGroup>();

  for (const evaluation of filteredEvaluations) {
    const repoUrl = evaluation.repoUrl;
    const score = evaluation.rubricScore ?? evaluation.overallScore ?? 0;

    if (!groups.has(repoUrl)) {
      groups.set(repoUrl, {
        repoUrl,
        repoName: extractRepoName(repoUrl),
        evaluations: [],
        latestScore: score,
        latestDate: evaluation.evaluatedAt,
        bestScore: score,
        runCount: 0,
      });
    }

    const group = groups.get(repoUrl)!;
    group.evaluations.push(evaluation);
    group.runCount++;

    if (score > group.bestScore) group.bestScore = score;
    if (new Date(evaluation.evaluatedAt) > new Date(group.latestDate)) {
      group.latestDate = evaluation.evaluatedAt;
      group.latestScore = score;
    }
  }

  // Ensure newest-first within each group
  const groupValues = Array.from(groups.values());
  for (let i = 0; i < groupValues.length; i++) {
    const group = groupValues[i];
    group.evaluations.sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime());
  }

  return groupValues;
}

