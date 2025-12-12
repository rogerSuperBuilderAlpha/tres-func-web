'use client';

export function HistoryLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl shadow-xl border border-navy-100 p-6 dark:bg-navy-900/90 dark:border-navy-700">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-navy-100 dark:bg-navy-700 rounded w-1/3"></div>
          <div className="h-10 bg-navy-100 dark:bg-navy-700 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-navy-100 dark:bg-navy-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


