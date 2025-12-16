'use client';

import { memo, useMemo } from 'react';
import { SiteMetadata } from '@/lib/validators';
import { Badge } from '@/components/ui';

interface SitePreviewProps {
  url: string;
  metadata: SiteMetadata;
}

const platformInfo: Record<string, { name: string; color: string; icon: string }> = {
  vercel: { name: 'Vercel', color: 'bg-black text-white', icon: '▲' },
  netlify: { name: 'Netlify', color: 'bg-teal-500 text-white', icon: '◆' },
  heroku: { name: 'Heroku', color: 'bg-purple-500 text-white', icon: '⬡' },
  railway: { name: 'Railway', color: 'bg-violet-500 text-white', icon: '🚂' },
  render: { name: 'Render', color: 'bg-emerald-500 text-white', icon: '◈' },
  cloudflare: { name: 'Cloudflare', color: 'bg-orange-500 text-white', icon: '☁' },
  unknown: { name: 'Custom', color: 'bg-navy-500 text-white', icon: '●' },
};

export const SitePreview = memo(function SitePreview({ url, metadata }: SitePreviewProps) {
  const platform = useMemo(() => platformInfo[metadata.platform || 'unknown'], [metadata.platform]);
  const displayUrl = useMemo(() => url.replace(/^https?:\/\//, ''), [url]);

  return (
    <div className="bg-gradient-to-br from-navy-50 to-navy-100/50 rounded-xl p-4 border border-navy-200">
      <p className="text-xs font-medium text-navy-500 uppercase tracking-wide mb-2">Deployed Site</p>
      
      <div className="flex items-center gap-3">
        {/* Site status indicator */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          metadata.accessible ? 'bg-success-100' : 'bg-danger-100'
        }`}>
          {metadata.accessible ? (
            <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-navy-900 hover:text-gold-600 transition truncate text-sm"
            >
              {displayUrl}
            </a>
            <Badge variant={metadata.accessible ? 'success' : 'danger'} size="sm">
              {metadata.accessible ? 'Online' : 'Unreachable'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-navy-500">
            {/* Platform badge */}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${platform.color}`}>
              {platform.icon} {platform.name}
            </span>
            
            {/* SSL indicator */}
            <span className={`flex items-center gap-1 ${metadata.ssl ? 'text-success-600' : 'text-warning-600'}`}>
              {metadata.ssl ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
              )}
              {metadata.ssl ? 'HTTPS' : 'HTTP'}
            </span>
            
            {/* Response time */}
            {metadata.responseTime && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {metadata.responseTime}ms
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});


