import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Edit,
  Play,
  Pause,
  Calendar,
  MessageCircle,
  Image,
  UserPlus,
  MessageSquare,
  ChevronDown,
  Instagram,
  Facebook,
  MessageCircle as WhatsApp
} from 'lucide-react';
import { mockData, automationConfig } from '../constants/mockApi';

/**
 * Automation list page component
 * @returns Automation list page component
 */
const AutomationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const { automations } = mockData;

  /**
   * Get platform icon
   * @param platform - Platform name
   * @returns Platform icon component
   */
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'whatsapp':
        return <WhatsApp className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  /**
   * Get trigger icon
   * @param trigger - Trigger type
   * @returns Trigger icon component
   */
  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'comment':
        return <MessageCircle className="w-4 h-4" />;
      case 'story_reply':
        return <Image className="w-4 h-4" />;
      case 'follow':
        return <UserPlus className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  /**
   * Get status color
   * @param status - Automation status
   * @returns Status color classes
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'draft':
        return 'bg-gray-400';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  /**
   * Get status text
   * @param status - Automation status
   * @returns Status text
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live';
      case 'draft':
        return 'Draft';
      case 'paused':
        return 'Paused';
      default:
        return 'Draft';
    }
  };

  /**
   * Get flow description
   * @param automation - Automation object
   * @returns Flow description string
   */
  const getFlowDescription = (automation: any) => {
    const platform = automationConfig.automationPlatforms[automation.platform as keyof typeof automationConfig.automationPlatforms];
    const trigger = platform?.triggers[automation.trigger as keyof typeof platform.triggers];
    
    if (trigger && 'name' in trigger) {
      return `${trigger.name} → DM`;
    }
    return `${automation.trigger} → DM`;
  };

  /**
   * Format date
   * @param dateString - ISO date string
   * @returns Formatted date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Filter automations
   * @returns Filtered automations
   */
  const getFilteredAutomations = () => {
    return automations.filter(automation => {
      const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || automation.status === statusFilter;
      const matchesType = typeFilter === 'all' || automation.trigger === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  };

  /**
   * Handle automation toggle
   * @param automationId - Automation ID
   * @param currentStatus - Current status
   */
  const handleToggleAutomation = (automationId: string, currentStatus: string) => {
    console.log(`Toggling automation ${automationId} from ${currentStatus}`);
    // This would typically call an API to update the automation status
    // For now, we'll just log the action
  };

  /**
   * Handle create comment automation
   */
  const handleCreateCommentAutomation = () => {
    navigate('/automations/new?trigger=comment');
  };

  /**
   * Handle create story automation
   */
  const handleCreateStoryAutomation = () => {
    navigate('/automations/new?trigger=story_reply');
  };

  /**
   * Handle duplicate automation
   * @param automationId - Automation ID
   */
  const handleDuplicateAutomation = (automationId: string) => {
    console.log(`Duplicating automation ${automationId}`);
    // This would typically call an API to duplicate the automation
  };

  /**
   * Handle delete automation
   * @param automationId - Automation ID
   */
  const handleDeleteAutomation = (automationId: string) => {
    if (window.confirm('Are you sure you want to delete this automation? This action cannot be undone.')) {
      console.log(`Deleting automation ${automationId}`);
      // This would typically call an API to delete the automation
    }
  };

  const filteredAutomations = getFilteredAutomations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Automations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your Instagram DM automations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleCreateCommentAutomation}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            + Comment Automation
          </button>
          <button 
            onClick={handleCreateStoryAutomation}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            + Story Automation
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search automations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Status Filters */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  statusFilter === 'active'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Active</span>
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  statusFilter === 'draft'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Inactive</span>
              </button>
            </div>

            {/* Type Filters */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('comment')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  typeFilter === 'comment'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <MessageCircle className="w-3 h-3" />
                <span>Comments</span>
              </button>
              <button
                onClick={() => setTypeFilter('story_reply')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  typeFilter === 'story_reply'
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Image className="w-3 h-3" />
                <span>Stories</span>
              </button>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Automation List */}
      <div className="space-y-4">
        {filteredAutomations.length > 0 ? (
          filteredAutomations.map((automation) => (
            <div
              key={automation.id}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Left Side - Automation Info */}
                <div className="flex items-center space-x-4">
                  {/* Platform Icon */}
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    {getPlatformIcon(automation.platform)}
                  </div>

                  {/* Automation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {automation.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.status)} text-white`}>
                        • {getStatusText(automation.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {getFlowDescription(automation)}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(automation.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{automation.stats.triggered} triggered</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center space-x-4">
                  {/* Toggle Switch */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {automation.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleToggleAutomation(automation.id, automation.status)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        automation.status === 'active' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          automation.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDuplicateAutomation(automation.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Duplicate automation"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAutomation(automation.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete automation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No automations found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Create your first automation to get started.'
                }
              </p>
                             {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                 <div className="flex items-center justify-center space-x-3">
                   <button 
                     onClick={handleCreateCommentAutomation}
                     className="btn-primary flex items-center"
                   >
                     <Plus className="w-4 h-4 mr-2" />
                     + Comment Automation
                   </button>
                   <button 
                     onClick={handleCreateStoryAutomation}
                     className="btn-primary flex items-center"
                   >
                     <Plus className="w-4 h-4 mr-2" />
                     + Story Automation
                   </button>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomationListPage; 