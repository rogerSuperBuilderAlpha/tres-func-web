'use client';

import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui';

// SHA-256 hash - password is never stored in plain text
const VALID_HASH = 'c97ace4c8fef2cee8fa0f3c9f52aab18dbd4f42438afe362ffb8f75ce4c04b84';
const AUTH_KEY = 'ttb_auth_token';
const AUTH_EXPIRY_DAYS = 7;

// Hash function using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a session token from the hash
async function generateToken(hash: string): Promise<string> {
  const timestamp = Date.now().toString();
  const combined = hash + timestamp;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${token}.${timestamp}`;
}

// Verify a stored token
async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;
  
  try {
    const [, timestamp] = token.split('.');
    if (!timestamp) return false;
    
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const expiryMs = AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    // Check if token is expired
    if (now - tokenTime > expiryMs) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem(AUTH_KEY);
        if (storedToken) {
          const isValid = await verifyToken(storedToken);
          setIsAuthenticated(isValid);
          if (!isValid) {
            localStorage.removeItem(AUTH_KEY);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const hash = await hashPassword(password);
      
      if (hash === VALID_HASH) {
        const token = await generateToken(hash);
        localStorage.setItem(AUTH_KEY, token);
        setIsAuthenticated(true);
      } else {
        setError('Invalid password');
        setPassword('');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Still checking auth status
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-grid-pattern flex items-center justify-center">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <Spinner size="lg" className="text-gold-500" />
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-4">
        <div className="glass rounded-2xl shadow-2xl p-8 w-full max-w-md border border-navy-200">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 shadow-lg">
                <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">TTB Evaluator</h1>
                <p className="text-xs text-navy-500">Internal Access</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password"
                className="w-full px-4 py-3 bg-white border border-navy-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 text-navy-900 placeholder:text-navy-400"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-xl text-sm text-danger-700 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 px-4 bg-gradient-to-r from-navy-700 to-navy-900 text-white rounded-xl hover:from-navy-600 hover:to-navy-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Unlock
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-navy-400">
            Contact your administrator for access
          </p>
        </div>
      </div>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}

