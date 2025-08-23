import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  BarChart3, 
  MessageSquare, 
  TrendingUp, 
  Plus, 
  ArrowUpRight,
  Activity,
  Users,
  Target,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockData } from '../constants/mockApi';

/**
 * Dashboard page component with overview and quick actions
 * @returns Dashboard page component
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { analytics, automations, activityLog } = mockData;

  /**
   * Quick action items
   */
  const quickActions = [
    {
      title: 'Create Automation',
      description: 'Set up a new automation workflow',
      icon: Plus,
      href: '/automations/new',
      color: 'from-blue-500 to-purple-500',
    },
    {
      title: 'View Analytics',
      description: 'Check your performance metrics',
      icon: BarChart3,
      href: '/analytics',
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'Connect Account',
      description: 'Add another Instagram account',
      icon: Users,
      href: '/connect-accounts',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Activity Log',
      description: 'View recent automation activity',
      icon: Activity,
      href: '/activity',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  /**
   * Format number with commas
   * @param num - Number to format
   * @returns Formatted number string
   */
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  /**
   * Get time ago from timestamp
   * @param timestamp - ISO timestamp
   * @returns Time ago string
   */
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-100">
              Your automations are running smoothly. Here's what's happening today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total DMs Sent
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(analytics.totalDMs)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              {analytics.monthlyGrowth}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Open Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.openRate}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: analytics.openRate }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Automations
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.activeAutomations}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>of {analytics.totalAutomations} total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Failed DMs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.failedDMs}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Last 30 days</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent activity and top automation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Activity
            </h2>
            <Link
              to="/activity"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {activityLog.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.automation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.message}
                  </p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top performing automation */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Top Performing Automation
          </h2>
          <div className="space-y-4">
            {automations
              .filter(auto => auto.status === 'active')
              .sort((a, b) => b.stats.triggered - a.stats.triggered)
              .slice(0, 1)
              .map((automation) => (
                <div key={automation.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {automation.name}
                    </h3>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {automation.config.dmMessage || automation.config.replyMessages?.[0] || 'Automation response'}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {automation.stats.triggered}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Triggered</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {automation.stats.sent}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sent</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {automation.stats.failed}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 