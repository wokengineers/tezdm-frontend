import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Target, 
  Users, 
  Calendar,
  Filter,
  Download,
  Eye,
  MousePointer,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';
import { mockData } from '../constants/mockApi';

/**
 * Analytics page component with comprehensive metrics and insights
 * @returns Analytics page component
 */
const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const { analytics } = mockData;

  /**
   * Period options for filtering
   */
  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  /**
   * Platform options for filtering
   */
  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'whatsapp', label: 'WhatsApp' },
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
   * Calculate percentage change
   * @param current - Current value
   * @param previous - Previous value
   * @returns Percentage change
   */
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  /**
   * Get trend icon and color
   * @param value - Percentage change value
   * @returns Object with icon and color classes
   */
  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/20'
      };
    } else if (value < 0) {
      return {
        icon: TrendingDown,
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/20'
      };
    }
    return {
      icon: TrendingUp,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-700'
    };
  };

  /**
   * Mock data for charts (in real app, this would come from API)
   */
  const chartData = {
    dailyStats: analytics.dailyStats,
    platformBreakdown: analytics.platformBreakdown,
    automationPerformance: mockData.automations.map(auto => ({
      name: auto.name,
      triggered: auto.stats.triggered,
      sent: auto.stats.sent,
      failed: auto.stats.failed,
      successRate: (auto.stats.sent / auto.stats.triggered) * 100
    }))
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your automation performance and engagement metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filters
          </h2>
          <Filter className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="input-field"
            >
              {platformOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
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
            <div className="flex items-center text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="font-medium">+15%</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
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
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                Click-Through Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.ctr}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="font-medium">+8%</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
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
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-red-600 dark:text-red-400">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span className="font-medium">-12%</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Daily Activity
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">DMs Sent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Opens</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {chartData.dailyStats.map((day, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full" 
                        style={{ width: `${(day.dms / 70) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-12 text-right">
                      {day.dms}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(day.opens / 30) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {day.opens}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Platform Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(chartData.platformBreakdown).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    platform === 'instagram' ? 'bg-pink-100 dark:bg-pink-900/20' :
                    platform === 'facebook' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    'bg-green-100 dark:bg-green-900/20'
                  }`}>
                    {platform === 'instagram' && <span className="text-pink-600 dark:text-pink-400">📷</span>}
                    {platform === 'facebook' && <span className="text-blue-600 dark:text-blue-400">📘</span>}
                    {platform === 'whatsapp' && <span className="text-green-600 dark:text-green-400">💬</span>}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {platform}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {count} DMs sent
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {((count / analytics.totalDMs) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automation Performance */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Automation Performance
          </h3>
          <Zap className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Automation
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Triggered
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Sent
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Failed
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Success Rate
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.automationPerformance.map((auto, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {auto.name}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatNumber(auto.triggered)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {formatNumber(auto.sent)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {formatNumber(auto.failed)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${auto.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {auto.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="badge badge-success">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Key Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Engagement is up 15% this month
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your "Freebie Comment Reply" automation is driving the most engagement
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Best performing time: 2-4 PM
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Consider scheduling more automations during peak hours
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Rate limit approaching
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You're at 85% of your daily DM limit. Consider upgrading to Pro.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {mockData.activityLog.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.automation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.message}
                  </p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
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

export default AnalyticsPage; 