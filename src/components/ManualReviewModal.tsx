'use client';

import { useState } from 'react';

interface ManualReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  candidateName?: string;
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
    question: 'What is your hiring recommendation and why?',
    placeholder: 'e.g., Strong hire - excellent problem solving and clean code...',
  },
  {
    id: 'notes',
    question: 'Any additional notes for the hiring team?',
    placeholder: 'e.g., Would be good fit for frontend role, needs mentoring on security...',
  },
];

export function ManualReviewModal({ isOpen, onClose, evaluationId, candidateName }: ManualReviewModalProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    CHECKLIST_ITEMS.map(item => ({ ...item, checked: false }))
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  const handleSubmit = () => {
    const reviewData = {
      evaluationId,
      checklist: checklist.filter(item => item.checked).map(item => item.id),
      answers,
      completedAt: new Date().toISOString(),
    };

    // For now, just log and close - could save to backend later
    console.log('Manual review submitted:', reviewData);

    // Download as JSON for record keeping
    const blob = new Blob([JSON.stringify(reviewData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manual-review-${evaluationId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    onClose();
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
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Save & Download Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
