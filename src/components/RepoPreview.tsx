'use client';

import { RepoMetadata } from '@/lib/validators';
import { Badge } from '@/components/ui';

interface RepoPreviewProps {
  metadata: RepoMetadata;
  label?: string;
}

export function RepoPreview({ metadata, label }: RepoPreviewProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

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
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {metadata.stars}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {metadata.forks}
            </span>
            <span>Updated {formatDate(metadata.lastUpdated)}</span>
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
}



