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
  
  console.log('OAuthRedirectPage - Initial auth status:', { isAuthenticated });
  
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

      console.log('OAuth redirect parameters:', { code, state });
      console.log('User authentication status:', { isAuthenticated });

      // Check if user is authenticated
      if (isAuthenticated) {
        // Authenticated user flow - use secure API with token
        await profileApi.completeOAuthRedirect(code, state);
        
        setStatus('success');
        setMessage('Account connected successfully!');

        // Redirect to automations after successful connection
        setTimeout(() => {
          console.log('OAuth redirect - Successfully completed, redirecting to /automations');
          navigate('/automations');
        }, 2000);
      } else {
        // Unauthenticated user flow - use direct API call without token
        await profileApi.completeOAuthRedirectUnauthenticated(code, state);
        
        setStatus('success');
        setMessage('Account added successfully! Please login to start using automations.');

        // Redirect to login page after successful account addition
        setTimeout(() => {
          console.log('OAuth redirect - Account added, redirecting to /login');
          navigate('/login');
        }, 3000);
      }

    } catch (error) {
      console.error('OAuth redirect error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to complete account connection';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication required. Please login again.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Access denied. Please check your permissions.';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('authorization code has been used')) {
          errorMessage = 'This authorization code has already been used. Please try connecting your account again.';
        } else if (error.message.includes('OAuthException')) {
          errorMessage = 'OAuth authentication failed. Please try again.';
        } else {
          // For long error messages, truncate and make them more readable
          const message = error.message;
          if (message.length > 200) {
            errorMessage = message.substring(0, 200) + '...';
          } else {
            errorMessage = message;
          }
        }
      }
      
      setStatus('error');
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center max-h-[90vh] overflow-y-auto">
          
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
                {isAuthenticated ? 'Account Connected!' : 'Account Added!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              
              <div className="flex items-center justify-center text-primary-500">
                <span className="text-sm font-medium">
                  {isAuthenticated ? 'Redirecting to automations...' : 'Redirecting to login...'}
                </span>
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
              <div className="mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-32 overflow-y-auto">
                  <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed break-words font-mono">
                    {error}
                  </p>
                </div>
              </div>
              
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