import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  CreditCard, 
  Activity,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  User,
  ChevronDown,
  Plus,
  Instagram,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { mockData, Account } from '../constants/mockApi';
import { profileApi } from '../services/profileApi';
import { SecurityManager } from '../utils/securityManager';

/**
 * Sidebar toggle icon component
 */
const SidebarToggleIcon: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  return isCollapsed ? (
    <PanelLeftOpen className="w-5 h-5" />
  ) : (
    <PanelLeftClose className="w-5 h-5" />
  );
};

/**
 * Navigation item interface
 */
interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

/**
 * Layout component with sidebar navigation and header
 * @returns Layout component with navigation and content area
 */
const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Get connected Instagram account from real API data
  const connectedAccount = connectedAccounts.find(account => 
    account.platform === 'instagram' && (account.state === 'connected' || account.state === 'token_available')
  );

  /**
   * Fetch connected accounts from API
   */
  const fetchConnectedAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const tokens = SecurityManager.getTokens();
      if (tokens && tokens.group_id) {
        const response = await profileApi.getConnectedAccounts(tokens.group_id, 1);
        setConnectedAccounts(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch connected accounts:', error);
      setConnectedAccounts([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // Fetch accounts on component mount
  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  // Listen for account connection events
  useEffect(() => {
    const handleAccountConnected = () => {
      fetchConnectedAccounts();
    };

    // Add event listener for account connection
    window.addEventListener('accountConnected', handleAccountConnected);

    return () => {
      window.removeEventListener('accountConnected', handleAccountConnected);
    };
  }, []);

  /**
   * Handle click outside user menu
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  /**
   * Navigation items configuration
   */
  const navigation: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Automations', path: '/automations', icon: Zap },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    // { name: 'Activity Log', path: '/activity', icon: Activity }, // Hidden for future use
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { 
      name: connectedAccount ? 'Connected Accounts' : 'Connect Account', 
      path: '/connect-accounts', 
      icon: Instagram,
      badge: connectedAccount ? 'Connected' : 'Connect'
    },
    // { name: 'Settings', path: '/settings', icon: Settings }, // Removed
    { name: 'Help & Support', path: '/help', icon: HelpCircle },
  ];

  /**
   * Handle navigation item click
   * @param path - Navigation path
   */
  const handleNavigation = (path: string): void => {
    navigate(path);
    setSidebarOpen(false);
  };

  /**
   * Handle logout
   */
  const handleLogout = async (): Promise<void> => {
    await signout();
    navigate('/login');
  };

  /**
   * Check if navigation item is active
   * @param path - Navigation path
   * @returns Boolean indicating if item is active
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  /**
   * Toggle sidebar collapse state
   */
  const toggleSidebarCollapse = (): void => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  /**
   * Handle connect account navigation
   */
  const handleConnectAccount = (): void => {
    navigate('/connect-accounts');
  };



  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold gradient-text truncate">TezDM</span>
            )}
          </div>
          {/* Close button - only visible on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  sidebar-item w-full justify-start group relative
                  ${sidebarCollapsed ? 'px-3' : 'px-4'}
                  ${isActive(item.path) ? 'active' : ''}
                `}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {/* Connection status indicator for collapsed state */}
                  {sidebarCollapsed && item.badge && (
                    <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                      item.badge === 'Connected' 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`}></div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium ml-3 truncate">{item.name}</span>
                    {item.badge && (
                      <span className={`ml-auto badge ${
                        item.badge === 'Connected' 
                          ? 'badge-success' 
                          : 'badge-warning'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                    {item.badge && (
                      <div className={`mt-1 text-xs ${
                        item.badge === 'Connected' 
                          ? 'text-green-400' 
                          : 'text-yellow-400'
                      }`}>
                        {item.badge}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          {sidebarCollapsed ? (
            // Collapsed user section - just avatar
            <div className="flex justify-center">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                alt={user?.name}
                className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                title={`${user?.name} (${user?.plan} Plan)`}
              />
            </div>
          ) : (
            // Expanded user section
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                alt={user?.name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.plan} Plan
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button and desktop sidebar toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Sidebar toggle - always visible */}
              <button
                onClick={toggleSidebarCollapse}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <SidebarToggleIcon isCollapsed={sidebarCollapsed} />
              </button>
            </div>

            {/* Page title */}
            <div className="flex-1 lg:ml-0">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {navigation.find(item => isActive(item.path))?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-white">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {user?.plan ? `${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan` : 'Free Plan'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/billing');
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <CreditCard className="w-4 h-4 mr-3" />
                      Account & Billing
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/help');
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <HelpCircle className="w-4 h-4 mr-3" />
                      Help & Support
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 