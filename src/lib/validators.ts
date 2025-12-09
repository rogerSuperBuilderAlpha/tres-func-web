/**
 * URL validation utilities with async checks
 */

export interface ValidationResult {
  valid: boolean;
  checking: boolean;
  message?: string;
  metadata?: RepoMetadata | SiteMetadata;
}

export interface RepoMetadata {
  name: string;
  fullName: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  lastUpdated: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  defaultBranch: string;
  isPrivate: boolean;
  readme?: string;
}

export interface SiteMetadata {
  accessible: boolean;
  statusCode?: number;
  responseTime?: number;
  platform?: 'vercel' | 'netlify' | 'heroku' | 'railway' | 'render' | 'cloudflare' | 'unknown';
  title?: string;
  favicon?: string;
  ssl: boolean;
}

/**
 * Extract owner and repo from GitHub URL
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }
  return null;
}

/**
 * Fetch GitHub repo metadata
 */
export async function fetchRepoMetadata(repoUrl: string): Promise<RepoMetadata | null> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) return null;

  try {
    const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Try to fetch README
    let readme: string | undefined;
    try {
      const readmeResponse = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json();
        // Decode base64 content
        readme = atob(readmeData.content).substring(0, 500);
      }
    } catch {
      // README fetch failed, that's ok
    }

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      lastUpdated: data.updated_at,
      owner: {
        login: data.owner.login,
        avatarUrl: data.owner.avatar_url,
      },
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      readme,
    };
  } catch (error) {
    console.error('Failed to fetch repo metadata:', error);
    return null;
  }
}

/**
 * Check if a deployed site is accessible
 */
export async function checkSiteAccessibility(url: string): Promise<SiteMetadata> {
  const startTime = Date.now();
  
  try {
    // Use a CORS proxy or just check basic accessibility
    // For security, we'll do a simple HEAD request via our API
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // This limits what we can check but avoids CORS issues
    });

    const responseTime = Date.now() - startTime;

    // Detect platform from URL
    let platform: SiteMetadata['platform'] = 'unknown';
    const urlLower = url.toLowerCase();
    if (urlLower.includes('vercel.app') || urlLower.includes('vercel.')) platform = 'vercel';
    else if (urlLower.includes('netlify.app') || urlLower.includes('netlify.')) platform = 'netlify';
    else if (urlLower.includes('herokuapp.com')) platform = 'heroku';
    else if (urlLower.includes('railway.app')) platform = 'railway';
    else if (urlLower.includes('onrender.com') || urlLower.includes('render.com')) platform = 'render';
    else if (urlLower.includes('pages.dev') || urlLower.includes('workers.dev')) platform = 'cloudflare';

    return {
      accessible: true, // With no-cors we can't really tell, but if it didn't throw, it's likely accessible
      responseTime,
      platform,
      ssl: url.startsWith('https://'),
    };
  } catch (error) {
    return {
      accessible: false,
      platform: 'unknown',
      ssl: url.startsWith('https://'),
    };
  }
}

/**
 * Debounce helper
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

