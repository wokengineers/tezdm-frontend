import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Instagram, Facebook, Smartphone, ExternalLink } from 'lucide-react';
import { profileApi } from '../services/profileApi';
import { useAuth } from '../contexts/AuthContext';
import { SecurityManager } from '../utils/securityManager';

import LoadingSpinner from '../components/LoadingSpinner';
import LoadingButton from '../components/LoadingButton';
import OAuthModal from '../components/OAuthModal';
import ConfirmationModal from '../components/ConfirmationModal';

interface Platform {
   id: number;
  platform_type: string;
}

interface ConnectedAccount {
  id: number;
  platform: string;
  creation_date: string;
  name: string;
  tag: string | null;
  parent_profile_id: string;
  parent_profile_name: string;
  state: string;
  uuid: string;
  profile_link: string | null;
  group: number;
  profile_oauth_config: number;
}

/**
 * Connect Accounts Page Component
 */
const ConnectAccountsPage: React.FC = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [oauthUrl, setOauthUrl] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loadingPlatforms, setLoadingPlatforms] = useState<boolean>(true);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
  const [connectingPlatform, setConnectingPlatform] = useState<number | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [accountToDelete, setAccountToDelete] = useState<ConnectedAccount | null>(null);
  const hasLoadedRef = useRef<boolean>(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();



  // Get group ID from secure storage
  const getGroupId = (): number | null => {
    const tokens = SecurityManager.getTokens();
    return tokens ? tokens.group_id : null;
  };

  const loadPlatforms = useCallback(async (): Promise<void> => {
    setError('');
    setLoadingPlatforms(true);
    try {
      const response = await profileApi.getOAuthPlatforms();
      setPlatforms(response.data);
      // After platforms are loaded, load connected accounts
      await loadConnectedAccounts();
    } catch (error) {
      console.error('Failed to load platforms:', error);
      setError('Failed to load available platforms. Please try again.');
    } finally {
      setLoadingPlatforms(false);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadPlatforms();
      hasLoadedRef.current = true;
    }
  }, []);

  /**
   * Load connected accounts
   */
  const loadConnectedAccounts = async (): Promise<void> => {
    const groupId = getGroupId();
    if (!groupId) {
      console.error('Group ID not found');
      return;
    }

    setLoadingAccounts(true);
    try {
      const response = await profileApi.getConnectedAccounts(groupId);
      setConnectedAccounts(response.data);
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
      // Don't set error here, just log it since we want to show platforms anyway
    } finally {
      setLoadingAccounts(false);
    }
  };

  /**
   * Handle platform selection
   */
  const handlePlatformSelect = async (platform: Platform): Promise<void> => {
    // Don't allow selection if already connecting this platform
    if (connectingPlatform === platform.id) {
      return;
    }

    setModalLoading(true);
    setError('');
    setConnectingPlatform(platform.id);
    
    const groupId = getGroupId();
    if (!groupId) {
      setError('Group ID not found. Please login again.');
      setModalLoading(false);
      setConnectingPlatform(null);
      return;
    }

    setSelectedPlatform(platform);
    
    try {
      const response = await profileApi.getOAuthUrl(platform.id, groupId);
      setOauthUrl(response.data.url);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to get OAuth URL:', error);
      setError('Failed to get connection URL. Please try again.');
    } finally {
      setModalLoading(false);
      setConnectingPlatform(null);
    }
  };

  /**
   * Handle back to platforms
   */
  const handleBackToPlatforms = (): void => {
    setShowModal(false);
    setSelectedPlatform(null);
    setOauthUrl('');
    setError('');
  };

  /**
   * Handle delete connected account
   */
  const handleDeleteAccount = async (account: ConnectedAccount): Promise<void> => {
    setAccountToDelete(account);
    setShowDeleteConfirmation(true);
  };

  /**
   * Handle confirm delete account
   */
  const handleConfirmDeleteAccount = async (): Promise<void> => {
    if (!accountToDelete) return;
    
    const groupId = getGroupId();
    if (!groupId) {
      setError('Group ID not found. Please login again.');
      setShowDeleteConfirmation(false);
      setAccountToDelete(null);
      return;
    }

    setDeletingAccount(accountToDelete.id);
    try {
      await profileApi.deleteConnectedAccount(accountToDelete.id, groupId);
      // Reload connected accounts after successful deletion
      await loadConnectedAccounts();
      // Dispatch event to refresh sidebar accounts
      window.dispatchEvent(new Event('accountConnected'));
      setError('');
    } catch (error) {
      console.error('Failed to delete account:', error);
      setError('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccount(null);
      setShowDeleteConfirmation(false);
      setAccountToDelete(null);
    }
  };

  /**
   * Handle cancel delete account
   */
  const handleCancelDeleteAccount = (): void => {
    setShowDeleteConfirmation(false);
    setAccountToDelete(null);
  };

  /**
   * Handle direct redirect to platform
   */
  const handleDirectRedirect = (): void => {
    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  };

  /**
   * Get platform icon
   */
  const getPlatformIcon = (platformType: string) => {
    switch (platformType) {
      case 'instagram':
        return <Instagram className="w-8 h-8" />;
      case 'facebook_page':
        return <Facebook className="w-8 h-8" />;
      case 'whatsapp':
        return <Smartphone className="w-8 h-8" />;
      case 'linkedin':
        return <Zap className="w-8 h-8" />; // You can import LinkedIn icon if needed
      case 'twitter':
        return <Zap className="w-8 h-8" />; // You can import Twitter icon if needed
      case 'youtube':
        return <Zap className="w-8 h-8" />; // You can import YouTube icon if needed
      case 'tiktok':
        return <Zap className="w-8 h-8" />; // You can import TikTok icon if needed
      default:
        return <Zap className="w-8 h-8" />;
    }
  };

  /**
   * Get platform name
   */
  const getPlatformName = (platformType: string): string => {
    switch (platformType) {
      case 'instagram':
        return 'Instagram';
      case 'facebook_page':
        return 'Facebook Page';
      case 'whatsapp':
        return 'WhatsApp';
      case 'linkedin':
        return 'LinkedIn';
      case 'twitter':
        return 'Twitter';
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      default:
        return platformType.charAt(0).toUpperCase() + platformType.slice(1).replace('_', ' ');
    }
  };

  /**
   * Get platform color
   */
  const getPlatformColor = (platformType: string): string => {
    switch (platformType) {
      case 'instagram':
        return 'bg-gradient-to-r from-pink-500 to-purple-600';
      case 'facebook_page':
        return 'bg-gradient-to-r from-blue-600 to-blue-700';
      case 'whatsapp':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'linkedin':
        return 'bg-gradient-to-r from-blue-700 to-blue-800';
      case 'twitter':
        return 'bg-gradient-to-r from-blue-400 to-blue-500';
      case 'youtube':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'tiktok':
        return 'bg-gradient-to-r from-pink-400 to-purple-500';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  /**
   * Check if platform is already connected
   */
  const isPlatformConnected = (platformType: string): boolean => {
    return connectedAccounts.some(account => account.platform === platformType);
  };

  /**
   * Get account status
   */
  const getAccountStatus = (state: string): { text: string; color: string; bgColor: string } => {
    switch (state) {
      case 'token_available':
        return {
          text: 'Connected',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        };
      default:
        return {
          text: 'Reconnect Required',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20'
        };
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loadingPlatforms && !selectedPlatform) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading platforms...</p>
        </div>
      </div>
    );
  }

  if (!selectedPlatform) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Connect Your Social Accounts
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your social media accounts to start automating your engagement
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Available Platforms Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Connect Your Account
            </h2>
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {platforms && platforms.length > 0 ? (
              platforms.map((platform) => {
                const isConnected = isPlatformConnected(platform.platform_type);
                
                return (
                                  <button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform)}
                  disabled={loadingAccounts || isConnected || connectingPlatform === platform.id}
                  className={`group relative bg-white dark:bg-gray-800 rounded-xl border p-6 transition-all duration-200 ${
                    isConnected 
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 cursor-not-allowed opacity-75' 
                      : connectingPlatform === platform.id
                      ? 'border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-75'
                      : 'border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getPlatformColor(platform.platform_type)}`}>
                        {getPlatformIcon(platform.platform_type)}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {getPlatformName(platform.platform_type)}
                        </h3>
                                              <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isConnected 
                          ? `${getPlatformName(platform.platform_type)} already connected`
                          : loadingAccounts
                          ? 'Loading account status...'
                          : connectingPlatform === platform.id
                          ? 'Connecting...'
                          : `Connect your ${getPlatformName(platform.platform_type).toLowerCase()} account`
                        }
                      </p>
                      </div>
                    </div>
                    
                    {isConnected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    
                                      {(loadingAccounts || connectingPlatform === platform.id) && !isConnected && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center">
                      <LoadingSpinner size="md" />
                    </div>
                  )}
                  </button>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No platforms available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  There are currently no social platforms available for connection.
                </p>
              </div>
            )}
          </div>

          {/* Connected Accounts Section */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your Connected Account
              </h2>
            </div>
            
            {connectedAccounts.length > 0 ? (
              <div className="space-y-4">
                {connectedAccounts.map((account, index) => {
                  const status = getAccountStatus(account.state);
                  const isPrimary = index === 0; // First account is primary for demo
                  const isInactive = account.state !== 'token_available';
                  
                  return (
                    <div key={account.id} className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Profile Picture / Avatar */}
                          <div className="relative">
                            {account.profile_link ? (
                              // Use actual profile photo
                              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <img 
                                  src={account.profile_link} 
                                  alt={account.name || 'Profile'} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to avatar if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                {/* Fallback avatar (hidden by default) */}
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xl font-semibold hidden">
                                  {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                              </div>
                            ) : (
                              // Use avatar when no profile link
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xl font-semibold">
                                {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            {/* Platform Icon */}
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${getPlatformColor(account.platform)}`}>
                              {React.cloneElement(getPlatformIcon(account.platform), { className: 'w-4 h-4 text-white' })}
                            </div>
                          </div>
                          
                          {/* Account Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                @{account.name || 'unknown'}
                              </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                              {getPlatformName(account.platform)} Business Account
                            </p>
                            {isPrimary && !isInactive && (
                              <span className="text-green-400 text-sm font-medium">
                                Primary Account
                              </span>
                            )}
                            {isInactive && (
                              <span className="text-yellow-500 text-sm font-medium">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          {isInactive ? (
                            <span className="px-4 py-2 bg-yellow-600 text-yellow-100 rounded-lg text-sm font-medium">
                              Inactive
                            </span>
                          ) : (
                            <>
                              <span className="px-4 py-2 bg-green-600 text-green-100 rounded-lg text-sm font-medium">
                                Connected
                              </span>
                              <LoadingButton
                                onClick={() => handleDeleteAccount(account)}
                                loading={deletingAccount === account.id}
                                loadingText="Disconnecting..."
                                variant="danger"
                                size="sm"
                              >
                                Disconnect
                              </LoadingButton>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-8 border border-gray-200 dark:border-gray-700/50 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No accounts connected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Connect your first social media account to start automating your engagement
                </p>
              </div>
            )}
          </div>

          {/* Empty state */}
          {platforms.length === 0 && !loadingPlatforms && (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No platforms available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are currently no social platforms available for connection.
              </p>
            </div>
          )}
        </div>

        {/* Confirmation Modal for Account Deletion */}
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={handleCancelDeleteAccount}
          onConfirm={handleConfirmDeleteAccount}
          title="Disconnect Account"
          message={`Are you sure you want to disconnect your ${accountToDelete ? getPlatformName(accountToDelete.platform) : ''} account (@${accountToDelete?.name || 'unknown'})? This action will delete all associated data and cannot be undone.`}
          confirmText="Yes, Disconnect"
          cancelText="Cancel"
          variant="danger"
          isLoading={deletingAccount !== null}
        />
      </div>
    );
  }

  // OAuth connection flow
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Connect {getPlatformName(selectedPlatform.platform_type)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose how you'd like to connect your {getPlatformName(selectedPlatform.platform_type).toLowerCase()} account
          </p>
        </div>

        {/* Loading State */}
        {modalLoading && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Getting connection URL...</p>
          </div>
        )}

        {/* OAuth Modal */}
        <OAuthModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          platformName={selectedPlatform ? getPlatformName(selectedPlatform.platform_type) : ''}
          oauthUrl={oauthUrl}
          onDirectRedirect={handleDirectRedirect}
          onBackToPlatforms={handleBackToPlatforms}
          onSuccess={() => {
            // Refresh connected accounts after successful connection
            loadConnectedAccounts();
          }}
        />

        {/* Confirmation Modal for Account Deletion */}
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={handleCancelDeleteAccount}
          onConfirm={handleConfirmDeleteAccount}
          title="Disconnect Account"
          message={`Are you sure you want to disconnect your ${accountToDelete ? getPlatformName(accountToDelete.platform) : ''} account (@${accountToDelete?.name || 'unknown'})? This action will delete all associated data and cannot be undone.`}
          confirmText="Yes, Disconnect"
          cancelText="Cancel"
          variant="danger"
          isLoading={deletingAccount !== null}
        />
      </div>
    </div>
  );
};

export default ConnectAccountsPage; 