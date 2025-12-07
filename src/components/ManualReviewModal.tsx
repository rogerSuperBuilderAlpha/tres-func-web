'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://3mw2hq6l57.execute-api.us-east-1.amazonaws.com/prod';

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
  {
    id: 'strengths',
    question: 'What are the notable strengths of this submission?',
    placeholder: 'e.g., Clean code, good error handling, creative approach...',
  },
  {
    id: 'concerns',
    question: 'What concerns or issues did you find?',
    placeholder: 'e.g., Missing validation, poor UX, security gaps...',
  },
  {
    id: 'recommendation',
    question: 'What is your overall assessment?',
    placeholder: 'e.g., Solid implementation with room for improvement in error handling...',
  },
  {
    id: 'notes',
    question: 'Any additional notes or feedback?',
    placeholder: 'e.g., Shows good understanding of core concepts, could benefit from more testing...',
  },
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
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const completedCount = checklist.filter(item => item.checked).length;
  const totalCount = checklist.length;

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);

    const reviewData = {
      checklist: checklist.filter(item => item.checked).map(item => item.id),
      answers,
      reviewedAt: new Date().toISOString(),
      reviewerNotes: answers.notes,
    };

    try {
      const response = await fetch(`${API_BASE}/review/${evaluationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save review');
      }

      console.log('Manual review saved successfully');
      onReviewSaved?.();
      onClose();
    } catch (err) {
      console.error('Failed to save manual review:', err);
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manual Review</h2>
              <p className="text-sm text-gray-500">
                {candidateName || `Evaluation ${evaluationId.slice(0, 8)}...`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {/* Checklist Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Review Checklist</h3>
                <span className="text-sm text-gray-500">
                  {completedCount}/{totalCount} completed
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {checklist.map(item => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Review Questions</h3>
              {REVIEW_QUESTIONS.map(q => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {q.question}
                  </label>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isSaving}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition text-sm disabled:opacity-50"
                >
                  Download JSON
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
