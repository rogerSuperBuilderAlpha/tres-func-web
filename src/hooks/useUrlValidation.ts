import { useState, useCallback } from 'react';
import { isValidRepoUrl, isValidUrl } from '@/lib/utils';
import { fetchRepoMetadata, checkSiteAccessibility, RepoMetadata, SiteMetadata } from '@/lib/validators';
import { useDebouncedEffect } from './useDebouncedEffect';

export interface ValidationState {
  checking: boolean;
  valid: boolean;
  error?: string;
}

interface UseRepoValidationResult {
  validation: ValidationState;
  metadata: RepoMetadata | null;
  validate: (url: string) => Promise<void>;
}

interface UseSiteValidationResult {
  validation: ValidationState;
  metadata: SiteMetadata | null;
  validate: (url: string) => Promise<void>;
}

/**
 * Hook for validating repository URLs with debouncing
 */
export function useRepoValidation(
  url: string,
  options: { optional?: boolean; debounceMs?: number } = {}
): UseRepoValidationResult {
  const { optional = false, debounceMs = 500 } = options;
  
  const [validation, setValidation] = useState<ValidationState>({
    checking: false,
    valid: optional,
  });
  const [metadata, setMetadata] = useState<RepoMetadata | null>(null);

  const validate = useCallback(async (urlToValidate: string) => {
    if (!urlToValidate) {
      setValidation({ checking: false, valid: optional });
      setMetadata(null);
      return;
    }

    if (!isValidRepoUrl(urlToValidate)) {
      setValidation({ checking: false, valid: false, error: 'Invalid repository URL' });
      setMetadata(null);
      return;
    }

    setValidation({ checking: true, valid: false });

    const repoMetadata = await fetchRepoMetadata(urlToValidate);
    if (repoMetadata) {
      if (repoMetadata.isPrivate) {
        setValidation({ checking: false, valid: false, error: 'Repository is private' });
      } else {
        setValidation({ checking: false, valid: true });
      }
      setMetadata(repoMetadata);
    } else {
      setValidation({ checking: false, valid: false, error: 'Repository not found' });
      setMetadata(null);
    }
  }, [optional]);

  // Auto-validate on URL change with debounce
  useDebouncedEffect(() => void validate(url), [url], debounceMs);

  return { validation, metadata, validate };
}

/**
 * Hook for validating deployed site URLs with debouncing
 */
export function useSiteValidation(
  url: string,
  options: { debounceMs?: number } = {}
): UseSiteValidationResult {
  const { debounceMs = 500 } = options;
  
  const [validation, setValidation] = useState<ValidationState>({
    checking: false,
    valid: false,
  });
  const [metadata, setMetadata] = useState<SiteMetadata | null>(null);

  const validate = useCallback(async (urlToValidate: string) => {
    if (!urlToValidate) {
      setValidation({ checking: false, valid: false });
      setMetadata(null);
      return;
    }

    if (!isValidUrl(urlToValidate)) {
      setValidation({ checking: false, valid: false, error: 'Invalid URL' });
      setMetadata(null);
      return;
    }

    setValidation({ checking: true, valid: false });

    const siteMetadata = await checkSiteAccessibility(urlToValidate);
    setMetadata(siteMetadata);
    setValidation({
      checking: false,
      valid: siteMetadata.accessible,
      error: siteMetadata.accessible ? undefined : 'Site unreachable',
    });
  }, []);

  // Auto-validate on URL change with debounce
  useDebouncedEffect(() => void validate(url), [url], debounceMs);

  return { validation, metadata, validate };
}
