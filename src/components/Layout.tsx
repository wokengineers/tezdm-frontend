import React, { useState } from 'react';
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
  Instagram
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { mockData, Account } from '../constants/mockApi';

/**
 * Custom sidebar toggle icon component
 */
const SidebarToggleIcon: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-200"
    >
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {isCollapsed ? (
        // Collapsed state - three lines on the left
        <>
          <line x1="4" y1="5" x2="6" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="11" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        // Expanded state - empty space
        <></>
      )}
    </svg>
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
  const [activeAccount, setActiveAccount] = useState<string>('acc1');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  /**
   * Navigation items configuration
   */
  const navigation: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Automations', path: '/automations', icon: Zap },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Activity Log', path: '/activity', icon: Activity },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
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
  const handleLogout = (): void => {
    logout();
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
   * Handle account switching
   * @param accountId - Account ID to switch to
   */
  const handleAccountSwitch = (accountId: string): void => {
    setActiveAccount(accountId);
  };

  /**
   * Get platform icon
   * @param platform - Platform name
   * @returns Platform icon component
   */
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-3 h-3" />;
      case 'facebook':
        return <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
          <span className="text-blue-600 text-xs font-bold">f</span>
        </div>;
      case 'whatsapp':
        return <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
          <span className="text-green-500 text-xs font-bold">W</span>
        </div>;
      case 'linkedin':
        return <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
          <span className="text-blue-700 text-xs font-bold">in</span>
        </div>;
      default:
        return <User className="w-3 h-3" />;
    }
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

      {/* Account Switcher Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-gray-900 border-r border-gray-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        w-16
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Connected accounts */}
          <div className="flex-1 py-4 space-y-3">
            {mockData.connectedAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleAccountSwitch(account.id)}
                className={`
                  relative w-10 h-10 mx-auto rounded-lg border-2 transition-all duration-200 group flex items-center justify-center
                  ${activeAccount === account.id 
                    ? 'border-primary-500 bg-primary-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                  }
                  ${!account.isActive && 'opacity-50'}
                `}
                title={`${account.username} (${account.platform})`}
              >
                {account.avatar ? (
                  <img
                    src={account.avatar}
                    alt={account.username}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  // Fallback avatar with initials and color
                  <div className={`
                    w-full h-full rounded-lg flex items-center justify-center text-white font-semibold text-sm
                    ${account.platform === 'instagram' ? 'bg-pink-500' : 
                      account.platform === 'facebook' ? 'bg-blue-600' :
                      account.platform === 'whatsapp' ? 'bg-green-500' :
                      account.platform === 'linkedin' ? 'bg-blue-700' : 'bg-gray-600'
                    }
                  `}>
                    {account.username.charAt(1).toUpperCase()}
                  </div>
                )}
                {/* Platform indicator */}
                <div className={`
                  absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 flex items-center justify-center
                  ${account.platform === 'instagram' ? 'bg-pink-500' : 
                    account.platform === 'facebook' ? 'bg-blue-600' :
                    account.platform === 'whatsapp' ? 'bg-green-500' :
                    account.platform === 'linkedin' ? 'bg-blue-700' : 'bg-gray-500'
                  }
                `}>
                  {getPlatformIcon(account.platform)}
                </div>
                {/* Primary account indicator */}
                {account.isPrimary && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-900"></div>
                )}
                {/* Active account indicator */}
                {activeAccount === account.id && (
                  <div className="absolute inset-0 rounded-lg ring-2 ring-primary-500 ring-offset-2 ring-offset-gray-900"></div>
                )}
              </button>
            ))}
          </div>

          {/* Add account button */}
          <div className="p-3 border-t border-gray-700">
            <button
              className="w-10 h-10 mx-auto rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors"
              title="Add new account"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-16 z-40 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
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
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium ml-3 truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto badge badge-info">{item.badge}</span>
                    )}
                  </>
                )}
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
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
              {/* Desktop sidebar toggle */}
              <button
                onClick={toggleSidebarCollapse}
                className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
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