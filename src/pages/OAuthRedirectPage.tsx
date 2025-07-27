import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { profileApi } from '../services/profileApi';
import { useAuth } from '../contexts/AuthContext';

/**
 * OAuth Redirect Handler Page
 * Handles the redirect from social platforms after OAuth authorization
 */
const OAuthRedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const hasProcessedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!hasProcessedRef.current) {
      handleOAuthRedirect();
      hasProcessedRef.current = true;
    }
  }, []);

  /**
   * Handle OAuth redirect with code and state
   */
  const handleOAuthRedirect = async (): Promise<void> => {
    try {
      // Extract code and state from URL parameters
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        throw new Error('Missing required OAuth parameters');
      }

      // Parse state parameter (format: groupId_platformId)
      const [groupId, platformId] = state.split('_');
      
      if (!groupId || !platformId) {
        throw new Error('Invalid state parameter format');
      }

      // Complete the OAuth flow
      await profileApi.completeOAuthRedirect(code, state);
      
      setStatus('success');
      setMessage('Account connected successfully!');

      // Redirect based on authentication status
      setTimeout(() => {
        if (isAuthenticated) {
          // User is logged in - redirect to automations
          navigate('/automations');
        } else {
          // User is not logged in - redirect to login with message
          navigate('/login', { 
            state: { 
              message: 'Profile has been added to TezDM! Login to your TezDM account to setup DM automation.' 
            } 
          });
        }
      }, 2000);

    } catch (error) {
      console.error('OAuth redirect error:', error);
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Failed to complete account connection');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          
          {/* Loading State */}
          {status === 'loading' && (
            <>
              {/* TezDM Logo Animation */}
              <div className="mb-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center animate-pulse">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center animate-ping opacity-20"></div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connecting Your Account
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please wait while we complete your account connection...
              </p>
              
              {/* Loading Animation */}
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Account Connected!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              
              <div className="flex items-center justify-center text-primary-500">
                <span className="text-sm font-medium">Redirecting...</span>
                <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connection Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/connect-accounts')}
                  className="w-full btn-primary"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full btn-secondary"
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Powered by{' '}
            <span className="font-semibold text-primary-500">TezDM</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthRedirectPage; 