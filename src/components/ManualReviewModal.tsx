'use client';

import { useState, memo } from 'react';
import { saveManualReview } from '@/lib/api';
import { Alert, Spinner, Modal, FormField, TextInput, ClipboardCheckIcon } from '@/components/ui';
import { ChecklistSection, createInitialChecklist, type ChecklistItem } from './manual-review/ChecklistSection';
import { QuestionsSection } from './manual-review/QuestionsSection';

interface ManualReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  candidateName?: string;
  onReviewSaved?: () => void;
}

export const ManualReviewModal = memo(function ManualReviewModal({ isOpen, onClose, evaluationId, candidateName, onReviewSaved }: ManualReviewModalProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(createInitialChecklist());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewerName, setReviewerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await saveManualReview(evaluationId, {
        checklist: checklist.filter(item => item.checked).map(item => item.id),
        answers,
        reviewedAt: new Date().toISOString(),
        reviewerName: reviewerName.trim() || 'Reviewer',
      });
      onReviewSaved?.();
      // Reset form
      setChecklist(createInitialChecklist());
      setAnswers({});
      setReviewerName('');
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

  const footer = (
    <>
      {error && (
        <Alert className="mb-3" variant="danger">
          {error}
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg transition text-sm font-medium disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDownload} disabled={isSaving} className="px-4 py-2 text-navy-500 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg transition text-sm disabled:opacity-50">
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
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Review"
      subtitle={candidateName || `Evaluation ${evaluationId.slice(0, 8)}...`}
      icon={<ClipboardCheckIcon className="w-5 h-5 text-white" />}
      footer={footer}
    >
      <div className="space-y-6">
        {/* Reviewer Name */}
        <FormField label="Your Name">
          <TextInput
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Enter your name"
          />
        </FormField>

        {/* Checklist */}
        <ChecklistSection checklist={checklist} onToggle={toggleChecklistItem} />

        {/* Questions */}
        <QuestionsSection
          answers={answers}
          onChange={(id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))}
        />
      </div>
    </Modal>
  );
});
