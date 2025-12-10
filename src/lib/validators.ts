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
 * Extract project path from GitLab URL
 */
export function parseGitLabUrl(url: string): { host: string; projectPath: string } | null {
  const cleanUrl = url.replace(/\.git$/, '').replace(/\/$/, '');
  const match = cleanUrl.match(/^https?:\/\/([^\/]+)\/(.+)$/);
  if (match) {
    return { host: match[1], projectPath: match[2] };
  }
  return null;
}

/**
 * Detect repo provider from URL
 */
export function getRepoProvider(url: string): 'github' | 'gitlab' | null {
  if (url.includes('github.com')) return 'github';
  if (url.includes('gitlab.com') || url.match(/gitlab\.[a-z]+/)) return 'gitlab';
  return null;
}

/**
 * Fetch GitHub repo metadata
 */
async function fetchGitHubMetadata(repoUrl: string): Promise<RepoMetadata | null> {
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
    console.error('Failed to fetch GitHub repo metadata:', error);
    return null;
  }
}

/**
 * Fetch GitLab repo metadata
 */
async function fetchGitLabMetadata(repoUrl: string): Promise<RepoMetadata | null> {
  const parsed = parseGitLabUrl(repoUrl);
  if (!parsed) return null;

  try {
    const encodedPath = encodeURIComponent(parsed.projectPath);
    const response = await fetch(`https://${parsed.host}/api/v4/projects/${encodedPath}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GitLab API error: ${response.status}`);
    }

    const data = await response.json();

    // Try to fetch README
    let readme: string | undefined;
    try {
      const readmeResponse = await fetch(
        `https://${parsed.host}/api/v4/projects/${encodedPath}/repository/files/README.md/raw?ref=${data.default_branch || 'main'}`,
        { headers: { 'Accept': 'text/plain' } }
      );
      if (readmeResponse.ok) {
        const readmeText = await readmeResponse.text();
        readme = readmeText.substring(0, 500);
      }
    } catch {
      // README fetch failed, that's ok
    }

    return {
      name: data.name,
      fullName: data.path_with_namespace,
      description: data.description || undefined,
      language: undefined, // GitLab doesn't have a simple language field
      stars: data.star_count || 0,
      forks: data.forks_count || 0,
      lastUpdated: data.last_activity_at,
      owner: {
        login: data.namespace?.name || data.path_with_namespace.split('/')[0],
        avatarUrl: data.avatar_url || data.namespace?.avatar_url || '',
      },
      defaultBranch: data.default_branch || 'main',
      isPrivate: data.visibility !== 'public',
      readme,
    };
  } catch (error) {
    console.error('Failed to fetch GitLab repo metadata:', error);
    return null;
  }
}

/**
 * Fetch repo metadata (supports GitHub and GitLab)
 */
export async function fetchRepoMetadata(repoUrl: string): Promise<RepoMetadata | null> {
  const provider = getRepoProvider(repoUrl);
  
  if (provider === 'github') {
    return fetchGitHubMetadata(repoUrl);
  } else if (provider === 'gitlab') {
    return fetchGitLabMetadata(repoUrl);
  }
  
  return null;
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

