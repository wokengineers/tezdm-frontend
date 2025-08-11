import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  MessageCircle,
  Instagram,
  AlertTriangle
} from 'lucide-react';
import { automationApi, Automation, TriggerActionConfig, TRIGGER_LABELS } from '../services/automationApi';
import { SecurityManager } from '../utils/securityManager';

import LoadingSpinner from '../components/LoadingSpinner';
import LoadingButton from '../components/LoadingButton';

/**
 * Automation list page component
 * @returns Automation list page component
 */
const AutomationListPage: React.FC = () => {
  const navigate = useNavigate();

  // Handle editing automation
  const handleEditAutomation = (automation: Automation) => {
    console.log('📝 Navigating to edit automation:', automation);
    // Navigate to automation builder with the automation data
    navigate('/automations/new', { 
      state: { 
        editMode: true, 
        automation: automation 
      } 
    });
  };
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('-creation_date');
  
  // API state
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [triggerActionConfig, setTriggerActionConfig] = useState<TriggerActionConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    automationId: number | null;
    automationName: string;
  }>({
    isOpen: false,
    automationId: null,
    automationName: '',
  });

  // Loading states for individual actions
  const [togglingAutomation, setTogglingAutomation] = useState<number | null>(null);
  const [deletingAutomation, setDeletingAutomation] = useState<number | null>(null);
  const [isLoadingAutomations, setIsLoadingAutomations] = useState<boolean>(true);



  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load trigger-action configuration
  const loadTriggerActionConfig = async () => {
    try {
      setIsLoadingConfig(true);
      console.log('🚀 Loading trigger-action configuration...');
      const response = await automationApi.getTriggerActionConfig();
      console.log('✅ Trigger-action configuration loaded:', response.data);
      console.log('📋 Available triggers:', Object.keys(response.data));
      setTriggerActionConfig(response.data);
    } catch (error) {
      console.error('❌ Failed to load trigger-action configuration:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // Get group ID from tokens and load config
  useEffect(() => {
    const tokens = SecurityManager.getTokens();
    if (tokens?.group_id) {
      setGroupId(tokens.group_id);
    }
    
    // Load trigger-action configuration on page load
    loadTriggerActionConfig();
  }, []);

  // Fetch automations when filters change
  useEffect(() => {
    if (!groupId) return;

    const fetchAutomations = async () => {
      console.log('Fetching automations with filters:', { groupId, debouncedSearchTerm, statusFilter, typeFilter, sortBy });
      
      setIsLoadingAutomations(true);
      
      const filters: any = {};
      
      // Add search filter
      if (debouncedSearchTerm.trim()) {
        filters.search = debouncedSearchTerm;
      }
      
      // Add status filter
      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'active';
      }
      
      // Add type filter
      if (typeFilter !== 'all') {
        filters.event_category = typeFilter;
      }

      // Add ordering
      filters.ordering = sortBy;

      try {
        const response = await automationApi.getAutomations(groupId, filters);
        console.log('Automations API response:', response);
        setAutomations(response.data);
      } catch (error) {
        console.error('Failed to fetch automations:', error);
      } finally {
        setIsLoadingAutomations(false);
      }
    };

    fetchAutomations();
  }, [groupId, debouncedSearchTerm, statusFilter, typeFilter, sortBy]);

  /**
   * Get status color
   * @param status - Automation status
   * @returns Status color classes
   */
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-400';
  };

  /**
   * Get status text
   * @param status - Automation status
   * @returns Status text
   */
  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Live' : 'Inactive';
  };

  /**
   * Get flow description
   * @param automation - Automation object
   * @returns Flow description string
   */
  const getFlowDescription = (automation: Automation) => {
    // Get trigger information
    const triggerEvent = automation.events.find(event => event.event_type === 'trigger');
    const triggerLabel = triggerEvent ? TRIGGER_LABELS[triggerEvent.event_category] || triggerEvent.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Trigger';
    
    // Get last updated date
    const lastUpdated = automation.updation_date || automation.creation_date;
    const formattedDate = lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Unknown Date';
    
    return `${triggerLabel} • Last updated: ${formattedDate}`;
  };

  /**
   * Handle automation toggle
   * @param automationId - Automation ID
   * @param currentStatus - Current status
   */
  const handleToggleAutomation = async (automationId: number, currentStatus: boolean) => {
    if (!groupId || togglingAutomation === automationId) return;

    try {
      setTogglingAutomation(automationId);
      console.log('Toggling automation:', { automationId, currentStatus, groupId });
      const response = await automationApi.toggleAutomation(automationId, groupId, !currentStatus);
      console.log('Toggle response:', response);
      
      // Update local state with the returned data
      setAutomations(prev => prev.map(automation => 
        automation.id === automationId 
          ? response.data
          : automation
      ));
    } catch (error) {
      console.error('Failed to toggle automation:', error);
    } finally {
      setTogglingAutomation(null);
    }
  };



  /**
   * Open delete confirmation modal
   * @param automationId - Automation ID
   * @param automationName - Automation name
   */
  const openDeleteModal = (automationId: number, automationName: string) => {
    setDeleteModal({
      isOpen: true,
      automationId,
      automationName,
    });
  };

  /**
   * Close delete confirmation modal
   */
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      automationId: null,
      automationName: '',
    });
  };

  /**
   * Handle delete automation
   */
  const handleDeleteAutomation = async () => {
    if (!groupId || !deleteModal.automationId || deletingAutomation === deleteModal.automationId) return;

    try {
      setDeletingAutomation(deleteModal.automationId);
      console.log('Deleting automation:', { automationId: deleteModal.automationId, groupId });
      await automationApi.deleteAutomation(deleteModal.automationId, groupId);
      console.log('Automation deleted successfully');
      
      // Remove from local state
      setAutomations(prev => prev.filter(automation => automation.id !== deleteModal.automationId));
      
      // Close modal
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete automation:', error);
    } finally {
      setDeletingAutomation(null);
    }
  };

  const sortedAutomations = automations;

  // Show loading state while config is being loaded
  if (isLoadingConfig) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading automation configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Automations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your Instagram automations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/automations/new')}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Automation
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        {/* Top Row: Search and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="-creation_date">Newest first</option>
              <option value="creation_date">Oldest first</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Status Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
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
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
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
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Inactive</span>
            </button>
          </div>

          {/* Trigger Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trigger:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <option value="all">All Triggers</option>
              {triggerActionConfig && Object.keys(triggerActionConfig).map((triggerId) => (
                <option key={triggerId} value={triggerId}>
                  {TRIGGER_LABELS[triggerId] || triggerId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>



      {/* Loading State */}
      {isLoadingAutomations && (
        <div className="card">
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading automations...</p>
          </div>
        </div>
      )}

      {/* Automation List */}
      {!isLoadingAutomations && (
        <div className="space-y-4">
          {sortedAutomations.length > 0 ? (
            sortedAutomations.map((automation) => (
              <div
                key={automation.id}
                onClick={() => {
                  console.log('🖱️ Card clicked for automation:', automation.id);
                  handleEditAutomation(automation);
                }}
                className="card group hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center justify-between">
                  {/* Left Side - Automation Info */}
                  <div className="flex items-center space-x-4">
                    {/* Platform Icon */}
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Instagram className="w-4 h-4" />
                    </div>

                    {/* Automation Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {automation.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.is_active)} text-white`}>
                          • {getStatusText(automation.is_active)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {getFlowDescription(automation)}
                      </p>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center space-x-4">
                    {/* Toggle Switch */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {automation.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAutomation(automation.id, automation.is_active);
                        }}
                        disabled={togglingAutomation === automation.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          automation.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        } ${togglingAutomation === automation.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            automation.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                        {togglingAutomation === automation.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <LoadingSpinner size="xs" color="white" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Delete Button Only */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(automation.id, automation.name);
                        }}
                        disabled={deletingAutomation === automation.id}
                        className={`p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${
                          deletingAutomation === automation.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Delete automation"
                      >
                        {deletingAutomation === automation.id ? (
                          <LoadingSpinner size="sm" color="red" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
                      onClick={() => navigate('/automations/new')}
                      className="btn-primary flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Automation
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Delete Automation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteModal.automationName}"</span>? 
              This will permanently remove the automation and all its data.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleDeleteAutomation}
                loading={deletingAutomation !== null}
                loadingText="Deleting..."
                variant="danger"
                size="md"
              >
                Delete
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationListPage; 