'use client';

import { useState, useEffect } from 'react';
import { AUTH_KEY, VALID_HASH, generateToken, hashPassword, verifyToken } from '@/lib/auth/passwordGate';
import { PasswordGateLoading } from './auth/PasswordGateLoading';
import { PasswordGateLogin } from './auth/PasswordGateLogin';

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
    return <PasswordGateLoading />;
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <PasswordGateLogin
        password={password}
        onPasswordChange={setPassword}
        error={error || undefined}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}



