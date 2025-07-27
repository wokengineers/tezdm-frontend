import React, { useState } from 'react';
import { 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Linkedin, 
  Check,
  AlertCircle,
  Plus,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockData, platforms, Account, Platform } from '../constants/mockApi';

/**
 * Connect Accounts page component
 * @returns Connect Accounts page component
 */
const ConnectAccountsPage: React.FC = () => {
  const { user } = useAuth();
  const [connecting, setConnecting] = useState<string | null>(null);

  /**
   * Handle account connection
   * @param platform - Platform to connect
   */
  const handleConnect = async (platform: string): Promise<void> => {
    setConnecting(platform);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnecting(null);
    // In real app, this would handle the OAuth flow
  };

  /**
   * Handle account disconnection
   * @param accountId - Account ID to disconnect
   */
  const handleDisconnect = async (accountId: string): Promise<void> => {
    // Simulate disconnection process
    console.log('Disconnecting account:', accountId);
  };

  /**
   * Get platform icon
   * @param platform - Platform name
   * @returns Platform icon component
   */
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  /**
   * Get platform color
   * @param platform - Platform name
   * @returns Platform color class
   */
  const getPlatformColor = (platform: string): string => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-500';
      case 'facebook':
        return 'bg-blue-600';
      case 'whatsapp':
        return 'bg-green-500';
      case 'linkedin':
        return 'bg-blue-700';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Connected Accounts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your social media account connections
          </p>
        </div>
      </div>

      {/* Connected accounts */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Your Connected Accounts
        </h2>
        
        {mockData.connectedAccounts.length > 0 ? (
          <div className="space-y-4">
            {mockData.connectedAccounts.map((account) => (
              <div
                key={account.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                  account.isActive 
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                    : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 opacity-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {account.avatar ? (
                      <img
                        src={account.avatar}
                        alt={account.username}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      // Fallback avatar with initials and color
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg
                        ${getPlatformColor(account.platform)}
                      `}>
                        {account.username.charAt(1).toUpperCase()}
                      </div>
                    )}
                    {/* Platform indicator */}
                    <div className={`
                      absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center
                      ${getPlatformColor(account.platform)}
                    `}>
                      {getPlatformIcon(account.platform)}
                    </div>
                    {/* Primary account indicator */}
                    {account.isPrimary && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {account.username}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {platforms[account.platform]?.name || account.platform} Business Account
                    </p>
                    {account.isPrimary && (
                      <span className="inline-block mt-1 badge badge-success">
                        Primary Account
                      </span>
                    )}
                    {!account.isActive && (
                      <span className="inline-block mt-1 badge badge-warning">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {account.isActive ? (
                    <>
                      <span className="badge badge-success">Connected</span>
                      <button
                        onClick={() => handleDisconnect(account.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <span className="badge badge-warning">Inactive</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No accounts connected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your Instagram account to start automating your interactions
            </p>
          </div>
        )}
      </div>

      {/* Available platforms */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Connect More Accounts
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(platforms).map(([key, platform]) => {
            const isConnected = mockData.connectedAccounts.some(
              account => account.platform === key && account.isActive
            );
            const isConnecting = connecting === key;
            
            return (
              <div
                key={key}
                className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                  isConnected
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                    : platform.status === 'active'
                    ? 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                    : 'border-gray-200 dark:border-gray-700 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${getPlatformColor(key)}`}
                  >
                    {getPlatformIcon(key)}
                  </div>
                  {isConnected && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {platform.status === 'coming_soon' && (
                    <span className="badge badge-warning">Coming Soon</span>
                  )}
                  {platform.status === 'planned' && (
                    <span className="badge badge-info">Planned</span>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {platform.name}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {platform.features.join(', ')}
                </p>
                
                {isConnected ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : platform.status === 'active' ? (
                  <button
                    onClick={() => handleConnect(key)}
                    disabled={isConnecting}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    {isConnecting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full btn-secondary opacity-50 cursor-not-allowed"
                  >
                    {platform.status === 'coming_soon' ? 'Coming Soon' : 'Planned'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          About Account Connections
        </h2>
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              We use secure OAuth connections to access your social media accounts. 
              We never store your passwords.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              You can disconnect your accounts at any time from your account settings.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Business accounts are required for automation features. Personal accounts 
              have limited functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectAccountsPage; 