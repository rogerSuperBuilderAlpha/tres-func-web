'use client';

import { REVIEW_QUESTIONS } from './config';

interface QuestionsSectionProps {
  answers: Record<string, string>;
  onChange: (id: string, value: string) => void;
}

export function QuestionsSection({ answers, onChange }: QuestionsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-navy-900">Review Questions</h3>
      {REVIEW_QUESTIONS.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">{q.question}</label>
          <textarea
            value={answers[q.id] || ''}
            onChange={(e) => onChange(q.id, e.target.value)}
            placeholder={q.placeholder}
            rows={3}
            className="w-full px-4 py-2.5 bg-white border border-navy-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 text-sm resize-none text-navy-900 placeholder:text-navy-400"
          />
        </div>
      ))}
    </div>
  );
}

