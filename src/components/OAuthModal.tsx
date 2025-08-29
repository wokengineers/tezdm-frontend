import React, { useEffect, useRef, useState } from 'react';
import { X, Smartphone, ExternalLink, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import QRCode from 'qrcode';
import { profileApi } from '../services/profileApi';

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformName: string;
  oauthUrl: string;
  onDirectRedirect: () => void;
  onBackToPlatforms: () => void;
  onSuccess?: () => void;
}

/**
 * OAuth Connection Modal Component
 */
const OAuthModal: React.FC<OAuthModalProps> = ({
  isOpen,
  onClose,
  platformName,
  oauthUrl,
  onDirectRedirect,
  onBackToPlatforms,
  onSuccess,
}) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState<boolean>(false);
  
  // Polling state
  const [pollingState, setPollingState] = useState<'idle' | 'polling' | 'success' | 'error' | 'timeout'>('idle');
  const [pollingError, setPollingError] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract state parameter from OAuth URL
  const extractStateFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('state');
    } catch (error) {
      console.error('Failed to parse OAuth URL:', error);
      return null;
    }
  };

  // Start polling for OAuth status
  const startPolling = async (state: string) => {
    setPollingState('polling');
    setTimeRemaining(300);
    setPollingError('');

    // Start countdown timer
    timeoutIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setPollingState('timeout');
          stopPolling();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start polling
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await profileApi.getOAuthStatus(state);
        
        if (response.data.state === 'token_available') {
          setPollingState('success');
          stopPolling();
          
          // Show success for 2 seconds then close popup and refresh
          setTimeout(() => {
            // Dispatch event to refresh sidebar accounts
            window.dispatchEvent(new Event('accountConnected'));
            onSuccess?.();
            onBackToPlatforms();
          }, 2000);
        }
        // If state is still 'pending', continue polling
      } catch (error) {
        console.error('Polling error:', error);
        setPollingState('error');
        setPollingError(error instanceof Error ? error.message : 'Polling failed');
        stopPolling();
      }
    }, 1000);
  };

  // Stop polling and cleanup
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutIntervalRef.current) {
      clearInterval(timeoutIntervalRef.current);
      timeoutIntervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Start polling when modal opens
  useEffect(() => {
    if (isOpen && oauthUrl) {
      const state = extractStateFromUrl(oauthUrl);
      if (state) {
        startPolling(state);
      }
    } else {
      stopPolling();
      setPollingState('idle');
      setPollingError('');
      setTimeRemaining(300);
    }
  }, [isOpen, oauthUrl]);

  useEffect(() => {
    if (isOpen && oauthUrl && qrCodeRef.current) {
      setQrCodeLoading(true);
      // Generate QR code
      QRCode.toCanvas(qrCodeRef.current, oauthUrl, {
        width: 144,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(() => {
        setQrCodeLoading(false);
      }).catch(err => {
        console.error('Failed to generate QR code:', err);
        setQrCodeLoading(false);
      });
    }
  }, [isOpen, oauthUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onBackToPlatforms}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Connect {platformName}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Choose your connection method
              </p>
            </div>
          </div>
          <button
            onClick={onBackToPlatforms}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* QR Code Option */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
                <Smartphone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Scan QR Code
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Use your phone to scan and connect
                </p>
              </div>
            </div>
            
            {/* QR Code - Centered */}
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="w-36 h-36 flex items-center justify-center relative">
                  {qrCodeLoading ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mb-1"></div>
                      <p className="text-xs text-gray-500">Generating...</p>
                    </div>
                  ) : (
                    <>
                      <canvas
                        ref={qrCodeRef}
                        className="w-full h-full"
                        style={{ maxWidth: '144px', maxHeight: '144px' }}
                      />
                      {/* TezDM Logo Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                          <div className="w-5 h-5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded flex items-center justify-center">
                            <Zap className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500 font-medium">TezDM</p>
                  <p className="text-xs text-gray-400">Scan to connect</p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Connect Option */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded flex items-center justify-center">
                <ExternalLink className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Connect Directly
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Connect in this browser
                </p>
              </div>
            </div>
            
            <button
              onClick={onDirectRedirect}
              disabled={pollingState === 'success' || pollingState === 'error' || pollingState === 'timeout'}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="text-sm">Connect {platformName}</span>
            </button>
          </div>

          {/* Polling Status */}
          {pollingState === 'polling' && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Connecting to {platformName}...
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {pollingState === 'success' && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Successfully connected!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Your {platformName} account is now ready for automation
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {pollingState === 'error' && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Connection failed
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {pollingError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeout State */}
          {pollingState === 'timeout' && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Connection timeout
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Please try again or use the direct connect option
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1 text-xs">
              How it works:
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5">
              <li>• Choose your preferred connection method</li>
              <li>• Complete the authorization on {platformName}</li>
              <li>• You'll be redirected back to TezDM</li>
              <li>• Start automating your engagement!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthModal; 