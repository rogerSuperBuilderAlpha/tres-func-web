'use client';

import { useState } from 'react';
import { saveManualReview } from '@/lib/api';
import { Spinner } from '@/components/ui';

interface ManualReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  candidateName?: string;
  onReviewSaved?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const CHECKLIST_ITEMS: Omit<ChecklistItem, 'checked'>[] = [
  { id: 'code_review', label: 'Reviewed code structure and organization' },
  { id: 'readme_check', label: 'Verified README has clear setup instructions' },
  { id: 'manual_test', label: 'Manually tested the deployed application' },
  { id: 'edge_cases', label: 'Tested edge cases not covered by automation' },
  { id: 'security_check', label: 'Checked for obvious security issues' },
  { id: 'ui_ux', label: 'Assessed UI/UX quality and responsiveness' },
  { id: 'error_handling', label: 'Verified error handling behavior' },
  { id: 'score_fair', label: 'Confirmed automated scores seem fair' },
];

const REVIEW_QUESTIONS = [
  { id: 'strengths', question: 'What are the notable strengths?', placeholder: 'e.g., Clean code, good error handling...' },
  { id: 'concerns', question: 'What concerns did you find?', placeholder: 'e.g., Missing validation, poor UX...' },
  { id: 'recommendation', question: 'Overall assessment?', placeholder: 'e.g., Solid implementation with room for improvement...' },
  { id: 'notes', question: 'Additional notes?', placeholder: 'e.g., Shows good understanding of core concepts...' },
];

export function ManualReviewModal({ isOpen, onClose, evaluationId, candidateName, onReviewSaved }: ManualReviewModalProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    CHECKLIST_ITEMS.map(item => ({ ...item, checked: false }))
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const completedCount = checklist.filter(item => item.checked).length;

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await saveManualReview(evaluationId, {
        checklist: checklist.filter(item => item.checked).map(item => item.id),
        answers,
        reviewedAt: new Date().toISOString(),
        reviewerNotes: answers.notes,
      });
      onReviewSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const reviewData = {
      evaluationId,
      checklist: checklist.filter(item => item.checked).map(item => item.id),
      answers,
      completedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(reviewData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manual-review-${evaluationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative glass rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-navy-200">
          {/* Header */}
          <div className="sticky top-0 glass border-b border-navy-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy-900">Manual Review</h2>
                <p className="text-sm text-navy-500">{candidateName || `Evaluation ${evaluationId.slice(0, 8)}...`}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-navy-900">Review Checklist</h3>
                <span className="text-sm text-navy-500 bg-navy-100 px-2.5 py-1 rounded-full font-medium">
                  {completedCount}/{checklist.length}
                </span>
              </div>
              <div className="bg-navy-50 rounded-xl p-4 space-y-1">
                {checklist.map(item => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer hover:bg-navy-100/50 p-2.5 rounded-lg transition">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="w-4 h-4 text-gold-500 rounded border-navy-300 focus:ring-gold-400 focus:ring-offset-0"
                    />
                    <span className={`text-sm ${item.checked ? 'text-navy-400 line-through' : 'text-navy-700'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-navy-900">Review Questions</h3>
              {REVIEW_QUESTIONS.map(q => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">{q.question}</label>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={q.placeholder}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 text-sm resize-none text-navy-900 placeholder:text-navy-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 glass border-t border-navy-200 px-6 py-4">
            {error && (
              <div className="mb-3 p-3 bg-danger-50 border border-danger-200 rounded-xl text-sm text-danger-700 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-navy-600 hover:text-navy-800 hover:bg-navy-100 rounded-lg transition text-sm font-medium disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleDownload} disabled={isSaving} className="px-4 py-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg transition text-sm disabled:opacity-50">
                  Export JSON
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-navy-700 to-navy-900 text-white rounded-xl hover:from-navy-600 hover:to-navy-800 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    Saving...
                  </>
                ) : (
                  'Save Review'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
