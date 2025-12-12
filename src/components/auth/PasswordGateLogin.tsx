'use client';

import { Alert, Spinner } from '@/components/ui';

interface PasswordGateLoginProps {
  password: string;
  onPasswordChange: (value: string) => void;
  error?: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function PasswordGateLogin({ password, onPasswordChange, error, isLoading, onSubmit }: PasswordGateLoginProps) {
  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-4">
      <div className="glass rounded-2xl shadow-2xl p-8 w-full max-w-md border border-navy-200">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 shadow-lg">
              <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">TTB Evaluator</h1>
              <p className="text-xs text-navy-500">Internal Access</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter access password"
              className="w-full px-4 py-3 bg-white border border-navy-200 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 text-navy-900 placeholder:text-navy-400"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Unlock
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-navy-400">Contact your administrator for access</p>
      </div>
    </div>
  );
}


