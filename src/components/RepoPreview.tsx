'use client';

import { memo, useMemo } from 'react';
import { RepoMetadata } from '@/lib/validators';
import { Badge, StarIcon, ForkIcon } from '@/components/ui';
import { formatRelativeDate } from '@/lib/utils';

interface RepoPreviewProps {
  metadata: RepoMetadata;
  label?: string;
}

export const RepoPreview = memo(function RepoPreview({ metadata, label }: RepoPreviewProps) {
  const formattedDate = useMemo(() => formatRelativeDate(metadata.lastUpdated), [metadata.lastUpdated]);

  return (
    <div className="bg-gradient-to-br from-navy-50 to-navy-100/50 rounded-xl p-4 border border-navy-200">
      {label && (
        <p className="text-xs font-medium text-navy-500 uppercase tracking-wide mb-2">{label}</p>
      )}
      
      <div className="flex items-start gap-3">
        <img
          src={metadata.owner.avatarUrl}
          alt={metadata.owner.login}
          className="w-10 h-10 rounded-lg border border-navy-200"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`https://github.com/${metadata.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-navy-900 hover:text-gold-600 transition truncate"
            >
              {metadata.fullName}
            </a>
            {metadata.isPrivate && (
              <Badge variant="warning" size="sm">Private</Badge>
            )}
          </div>
          
          {metadata.description && (
            <p className="text-sm text-navy-600 mt-1 line-clamp-2">{metadata.description}</p>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-navy-500">
            {metadata.language && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-gold-500"></span>
                {metadata.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <StarIcon className="w-3.5 h-3.5" />
              {metadata.stars}
            </span>
            <span className="flex items-center gap-1">
              <ForkIcon className="w-3.5 h-3.5" />
              {metadata.forks}
            </span>
            <span>Updated {formattedDate}</span>
          </div>
        </div>
      </div>

      {metadata.readme && (
        <div className="mt-3 pt-3 border-t border-navy-200">
          <p className="text-xs font-medium text-navy-500 mb-1">README Preview</p>
          <p className="text-xs text-navy-600 line-clamp-3 font-mono bg-white/50 p-2 rounded">
            {metadata.readme.substring(0, 200)}...
          </p>
        </div>
      )}
    </div>
  );
});


