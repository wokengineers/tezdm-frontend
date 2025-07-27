import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Instagram, Facebook, Smartphone, ExternalLink, ArrowLeft } from 'lucide-react';
import { profileApi } from '../services/profileApi';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';
import OAuthModal from '../components/OAuthModal';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [oauthUrl, setOauthUrl] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [deletingAccount, setDeletingAccount] = useState<number | null>(null);
  const hasLoadedRef = useRef<boolean>(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get group ID from localStorage (stored during login)
  const groupId = localStorage.getItem('group_id');

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadPlatforms();
      loadConnectedAccounts();
      hasLoadedRef.current = true;
    }
  }, []);

  /**
   * Load available OAuth platforms
   */
  const loadPlatforms = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await profileApi.getOAuthPlatforms();
      setPlatforms(response.data);
    } catch (error) {
      console.error('Failed to load platforms:', error);
      setError('Failed to load available platforms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load connected accounts
   */
  const loadConnectedAccounts = async (): Promise<void> => {
    try {
      if (!groupId) {
        console.error('Group ID not found');
        return;
      }

      const response = await profileApi.getConnectedAccounts(parseInt(groupId));
      setConnectedAccounts(response.data);
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    }
  };

  /**
   * Handle platform selection
   */
  const handlePlatformSelect = async (platform: Platform): Promise<void> => {
    try {
      setModalLoading(true);
      setError('');
      
      if (!groupId) {
        throw new Error('Group ID not found. Please login again.');
      }

      // Get OAuth URL from API
      const response = await profileApi.getOAuthUrl(platform.id, parseInt(groupId));
      setOauthUrl(response.data.url);
      setSelectedPlatform(platform);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to get OAuth URL:', error);
      setError('Failed to get connection URL. Please try again.');
    } finally {
      setModalLoading(false);
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
  const handleDeleteAccount = async (accountId: number): Promise<void> => {
    try {
      if (!groupId) {
        setError('Group ID not found. Please login again.');
        return;
      }

      setDeletingAccount(accountId);
      
      await profileApi.deleteConnectedAccount(accountId, parseInt(groupId));
      
      // Reload connected accounts
      await loadConnectedAccounts();
      
      setError('');
    } catch (error) {
      console.error('Failed to delete account:', error);
      setError('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccount(null);
    }
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
      default:
        return platformType;
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
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
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

  if (loading && !selectedPlatform) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
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
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
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

          {/* Connected Accounts Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Connected Accounts ({connectedAccounts.length})
              </h2>
            </div>
            <div className="card">
              {connectedAccounts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Platform
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Name
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Status
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {connectedAccounts.map((account) => {
                        const status = getAccountStatus(account.state);
                        return (
                          <tr key={account.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${getPlatformColor(account.platform)}`}>
                                  {getPlatformIcon(account.platform)}
                                </div>
                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                  {getPlatformName(account.platform)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {account.name}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                {status.text}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDeleteAccount(account.id)}
                                disabled={deletingAccount === account.id}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                                title="Delete account"
                              >
                                {deletingAccount === account.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b border-red-600"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Instagram className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No accounts connected
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Connect your first social media account to start automating your engagement
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Available Platforms Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Connect More Accounts
            </h2>
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handlePlatformSelect(platform)}
                disabled={loading}
                className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600"
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
                      Connect your {getPlatformName(platform.platform_type).toLowerCase()} account
                    </p>
                  </div>
                </div>
                
                {loading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {platforms.length === 0 && !loading && (
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
      </div>
    );
  }

  // OAuth connection flow
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedPlatform(null)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to platforms
          </button>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
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
        />
      </div>
    </div>
  );
};

export default ConnectAccountsPage; 