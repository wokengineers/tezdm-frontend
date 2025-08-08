import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  ArrowLeft, 
  Eye,
  Trash2,
  MessageCircle,
  Image,
  AtSign,
  Send,
  CheckCircle,
  AlertCircle,
  GitBranch,
  GitCommit,
  Loader2
} from 'lucide-react';
import { SecurityManager } from '../utils/securityManager';
import { automationApi, TRIGGER_LABELS, ACTION_LABELS, ACTION_DESCRIPTIONS, TriggerActionConfig } from '../services/automationApi';
import { profileApi } from '../services/profileApi';
import LoadingButton from '../components/LoadingButton';
import { getEventForm } from '../components/automation/EventForms';
import InstagramPostSelector from '../components/automation/InstagramPostSelector';
import { v4 as uuidv4 } from 'uuid';

// Import validation types
interface ValidationError {
  field: string;
  message: string;
}

// Types based on your Django models
interface EventConfig {
  keywords?: string[];
  fuzzy_match_allowed?: boolean | null;
  fuzzy_match_percentage?: number | null;
  post_ids?: string[];
  all_posts?: boolean;
  all_comments?: boolean;
  story_ids?: string[];
  all_stories?: boolean;
  all_messages?: boolean;
  template?: string;
  endpoint?: string;
}

interface Event {
  temp_id: string;
  event_type: 'trigger' | 'action';
  event_category: string;
  event_config: EventConfig;
  next_event_temp_id?: string;
  is_active: boolean;
  sequence_order?: number; // For sequential actions
}

interface Workflow {
  name: string;
  is_active: boolean;
  events: Event[];
}

interface CreateAutomationPayload {
  workflow: {
    name: string;
  };
  events: Event[];
}

// Event categories based on your enums - will be populated from API
const EVENT_CATEGORIES = {
  TRIGGERS: [] as Array<{ id: string; label: string; icon: any; description: string }>,
  ACTIONS: [] as Array<{ id: string; label: string; icon: any; description: string }>
};

/**
 * Automation Builder Page Component
 */
const AutomationBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in edit mode
  const editMode = location.state?.editMode || false;
  const editAutomation = location.state?.automation || null;
  
  console.log('🔧 AutomationBuilderPage - Edit mode:', editMode);
  console.log('🔧 AutomationBuilderPage - Edit automation:', editAutomation);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [workflow, setWorkflow] = useState<Workflow>({
    name: '',
    is_active: true,
    events: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [actionFlowType, setActionFlowType] = useState<'sequential' | 'parallel'>('sequential');
  
  // New state for trigger-action configuration
  const [triggerActionConfig, setTriggerActionConfig] = useState<TriggerActionConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const hasLoadedRef = useRef<boolean>(false);

  // State for connected account
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState<boolean>(true);

  // State for Instagram post selector
  const [isPostSelectorOpen, setIsPostSelectorOpen] = useState<boolean>(false);
  const [currentEventForPostSelection, setCurrentEventForPostSelection] = useState<string | null>(null);

  // Initialize workflow data for edit mode
  useEffect(() => {
    if (editMode && editAutomation) {
      console.log('🔧 Edit mode - Loading automation:', editAutomation);
      
      // Convert automation data to workflow format
      const events: Event[] = editAutomation.events.map((event: any) => ({
        temp_id: event.id?.toString() || generateTempId(),
        event_type: event.event_type,
        event_category: event.event_category,
        event_config: event.event_config,
        is_active: event.is_active,
        sequence_order: event.sequence_order || 0
      }));

      setWorkflow({
        name: editAutomation.name,
        is_active: editAutomation.is_active,
        events: events
      });

      // Start at step 1 so user can see all information
      setCurrentStep(1);
    }
  }, [editMode, editAutomation]);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Name your automation' },
    { id: 2, title: 'Trigger', description: 'What starts the automation' },
    { id: 3, title: 'Actions', description: 'What happens next' },
    { id: 4, title: 'Review', description: 'Review and deploy' }
  ];

  // Get group ID from tokens
  const getGroupId = (): number | null => {
    const tokens = SecurityManager.getTokens();
    return tokens ? tokens.group_id : null;
  };

  /**
   * Load connected account
   */
  const loadConnectedAccount = async () => {
    try {
      const groupId = getGroupId();
      if (!groupId) {
        console.error('No group ID found');
        return;
      }

      const response = await profileApi.getConnectedAccounts(groupId, 1);
      if (response.data && response.data.length > 0) {
        console.log('📸 Connected account data:', response.data[0]);
        setConnectedAccount(response.data[0]); // Use first account
      }
    } catch (error) {
      console.error('Failed to load connected account:', error);
    } finally {
      setIsLoadingAccount(false);
    }
  };

  /**
   * Load trigger-action configuration from API
   */
  useEffect(() => {
    console.log('useEffect triggered - hasLoadedRef.current:', hasLoadedRef.current);
    
    // Prevent multiple API calls
    if (hasLoadedRef.current) {
      console.log('API already called, skipping...');
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    // Load connected account first
    loadConnectedAccount();

    const loadTriggerActionConfig = async () => {
      try {
        hasLoadedRef.current = true;
        setIsLoadingConfig(true);
        setConfigError(null);
        
        console.log('🚀 Loading trigger-action configuration...');
        const response = await automationApi.getTriggerActionConfig();
        console.log('✅ Trigger-action configuration loaded:', response.data);
        
        if (!isMounted || abortController.signal.aborted) {
          console.log('❌ Component unmounted or aborted, skipping state update');
          return;
        }
        
        setTriggerActionConfig(response.data);
        
        // Populate EVENT_CATEGORIES with data from API
        const triggers = Object.keys(response.data).map(triggerId => ({
          id: triggerId,
          label: TRIGGER_LABELS[triggerId] || triggerId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon: getTriggerIcon(triggerId),
          description: getTriggerDescription(triggerId)
        }));

        // Get all unique actions from the configuration
        const allActions = new Set<string>();
        Object.values(response.data).forEach(actionGroups => {
          actionGroups.forEach(actionGroup => {
            actionGroup.forEach(action => allActions.add(action));
          });
        });

        const actions = Array.from(allActions).map(actionId => ({
          id: actionId,
          label: ACTION_LABELS[actionId] || actionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon: getActionIcon(actionId),
          description: ACTION_DESCRIPTIONS[actionId] || `Perform ${actionId.replace(/_/g, ' ')}`
        }));

        EVENT_CATEGORIES.TRIGGERS = triggers;
        EVENT_CATEGORIES.ACTIONS = actions;
        
        console.log('🎉 Configuration setup complete');
        
      } catch (error) {
        if (!isMounted || abortController.signal.aborted) {
          console.log('❌ Component unmounted or aborted during error, skipping error state update');
          return;
        }
        console.error('❌ Failed to load trigger-action configuration:', error);
        setConfigError('Failed to load automation configuration. Please refresh the page.');
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setIsLoadingConfig(false);
          console.log('🏁 Loading state set to false');
        }
      }
    };

    loadTriggerActionConfig();

    return () => {
      console.log('🧹 Cleanup function called');
      isMounted = false;
      abortController.abort();
    };
  }, []);

  /**
   * Get trigger icon based on trigger type
   */
  const getTriggerIcon = (triggerId: string) => {
    switch (triggerId) {
      case 'post_comment':
        return MessageCircle;
      case 'story_mention':
        return Image;
      case 'user_direct_message':
        return Send;
      default:
        return AtSign;
    }
  };

  /**
   * Get trigger description
   */
  const getTriggerDescription = (triggerId: string) => {
    switch (triggerId) {
      case 'post_comment':
        return 'When someone comments on a post';
      case 'story_mention':
        return 'When someone mentions you in a story';
      case 'user_direct_message':
        return 'When someone sends you a direct message';
      default:
        return 'Trigger event';
    }
  };

  /**
   * Get action icon based on action type
   */
  const getActionIcon = (actionId: string) => {
    if (actionId.includes('comment')) return MessageCircle;
    if (actionId.includes('dm')) return Send;
    if (actionId.includes('webhook')) return GitBranch;
    return CheckCircle;
  };

  /**
   * Get available actions for a selected trigger
   */
  const getAvailableActions = (triggerId: string): string[] => {
    if (!triggerActionConfig || !triggerActionConfig[triggerId]) {
      return [];
    }
    
    // Flatten all action groups into a single array
    return triggerActionConfig[triggerId].flat();
  };

  /**
   * Check if an action conflicts with already selected actions
   */
  const isActionConflicting = (actionId: string, selectedActions: string[], triggerId: string): boolean => {
    if (!triggerActionConfig || !triggerActionConfig[triggerId]) {
      return false;
    }

    // Find which action group this action belongs to
    const actionGroup = triggerActionConfig[triggerId].find(group => group.includes(actionId));
    if (!actionGroup) {
      return false;
    }

    // Check if any action from the same group is already selected
    return actionGroup.some(action => selectedActions.includes(action) && action !== actionId);
  };

  /**
   * Get conflicting actions for a given action
   */
  const getConflictingActions = (actionId: string, triggerId: string): string[] => {
    if (!triggerActionConfig || !triggerActionConfig[triggerId]) {
      return [];
    }

    const actionGroup = triggerActionConfig[triggerId].find(group => group.includes(actionId));
    if (!actionGroup) {
      return [];
    }

    return actionGroup.filter(action => action !== actionId);
  };

  /**
   * Get initial configuration for a trigger based on its type
   */
  const getInitialConfigForTrigger = (triggerCategory: string) => {
    switch (triggerCategory) {
      case 'post_comment':
        return {
          all_comments: true,
          keywords: [],
          fuzzy_match_allowed: null,
          fuzzy_match_percentage: null,
          post_ids: [],
          all_posts: true
        };
      case 'story_mention':
        return {
          story_ids: [],
          all_stories: true
        };
      case 'user_direct_message':
        return {
          keywords: [],
          fuzzy_match_allowed: null,
          fuzzy_match_percentage: null,
          all_messages: true
        };
      default:
        return {};
    }
  };

  /**
   * Get initial configuration for an action based on its type
   */
  const getInitialConfigForAction = (actionCategory: string) => {
    switch (actionCategory) {
      case 'reply_to_comment':
      case 'reply_to_dm':
      case 'send_dm':
        return {
          template: ''
        };
      case 'reply_to_comment_webhook':
      case 'reply_to_dm_webhook':
      case 'send_dm_webhook':
        return {
          endpoint: ''
        };
      default:
        return {};
    }
  };

  /**
   * Generate unique temp ID for events
   */
  const generateTempId = (): string => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleOpenPostSelector = (eventTempId: string) => {
    setCurrentEventForPostSelection(eventTempId);
    setIsPostSelectorOpen(true);
  };

  const handlePostSelection = (postIds: string[]) => {
    if (currentEventForPostSelection) {
      updateEventConfig(currentEventForPostSelection, { post_ids: postIds });
      setCurrentEventForPostSelection(null);
    }
  };

  const handleClosePostSelector = () => {
    setIsPostSelectorOpen(false);
    setCurrentEventForPostSelection(null);
  };

  /**
   * Add trigger event
   */
  const addTriggerEvent = (eventCategory: string) => {
    // Remove any existing trigger
    const eventsWithoutTrigger = workflow.events.filter(e => e.event_type !== 'trigger');
    
    const triggerEvent: Event = {
      temp_id: generateTempId(),
      event_type: 'trigger',
      event_category: eventCategory,
      event_config: getInitialConfigForTrigger(eventCategory),
      is_active: true,
      sequence_order: 0
    };

    setWorkflow(prev => ({
      ...prev,
      events: [triggerEvent, ...eventsWithoutTrigger]
    }));

    // Stay on trigger step to configure trigger data
    setCurrentStep(2);
  };

  /**
   * Add action event
   */
  const addActionEvent = (eventCategory: string) => {
    const triggerEvent = workflow.events.find(e => e.event_type === 'trigger');
    if (!triggerEvent) return;

    // Check for conflicts
    const selectedActions = workflow.events
      .filter(e => e.event_type === 'action')
      .map(e => e.event_category);
    
    if (isActionConflicting(eventCategory, selectedActions, triggerEvent.event_category)) {
      const conflictingActions = getConflictingActions(eventCategory, triggerEvent.event_category);
      setError(`Cannot select "${ACTION_LABELS[eventCategory]}" because "${ACTION_LABELS[conflictingActions[0]]}" is already selected. You can only choose one action from each group.`);
      return;
    }

    const existingActions = workflow.events.filter(e => e.event_type === 'action');
    const newSequenceOrder = existingActions.length + 1;

    const actionEvent: Event = {
      temp_id: generateTempId(),
      event_type: 'action',
      event_category: eventCategory,
      event_config: getInitialConfigForAction(eventCategory),
      is_active: true,
      sequence_order: newSequenceOrder
    };

    // Link actions based on flow type
    if (actionFlowType === 'sequential') {
      if (existingActions.length > 0) {
        // Link to the last action
        const lastAction = existingActions[existingActions.length - 1];
        actionEvent.next_event_temp_id = lastAction.temp_id;
      } else {
        // Link to trigger
        actionEvent.next_event_temp_id = triggerEvent.temp_id;
      }
    } else {
      // Parallel: all actions link to trigger
      actionEvent.next_event_temp_id = triggerEvent.temp_id;
    }

    setWorkflow(prev => ({
      ...prev,
      events: [...prev.events, actionEvent]
    }));

    // Clear any previous errors
    setError(null);
  };

  /**
   * Update event config
   */
  const updateEventConfig = (tempId: string, config: Partial<EventConfig>) => {
    setWorkflow(prev => ({
      ...prev,
      events: prev.events.map(event =>
        event.temp_id === tempId
          ? { ...event, event_config: { ...event.event_config, ...config } }
          : event
      )
    }));
  };

  /**
   * Remove event
   */
  const removeEvent = (tempId: string) => {
    setWorkflow(prev => ({
      ...prev,
      events: prev.events.filter(event => event.temp_id !== tempId)
    }));
  };

  /**
   * Reorder actions (for sequential flow)
   */
  const reorderActions = (fromIndex: number, toIndex: number) => {
    const actions = workflow.events.filter(e => e.event_type === 'action');
    const triggerEvent = workflow.events.find(e => e.event_type === 'trigger');
    
    if (!triggerEvent) return;

    // Reorder actions
    const reorderedActions = [...actions];
    const [movedAction] = reorderedActions.splice(fromIndex, 1);
    reorderedActions.splice(toIndex, 0, movedAction);

    // Update sequence orders and links
    const updatedActions = reorderedActions.map((action, index) => ({
      ...action,
      sequence_order: index + 1,
      next_event_temp_id: index === 0 ? triggerEvent.temp_id : reorderedActions[index - 1].temp_id
    }));

    // Rebuild events array
    const updatedEvents = [triggerEvent, ...updatedActions];
    setWorkflow(prev => ({
      ...prev,
      events: updatedEvents
    }));
  };

  /**
   * Create or update automation
   */
  const createAutomation = async () => {
    if (!canProceed()) {
      setError('Please complete all required fields before creating the automation.');
      return;
    }

    if (!connectedAccount) {
      setError('No connected account found. Please connect an Instagram account first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const groupId = getGroupId();
      if (!groupId) {
        throw new Error('Group ID not found');
      }

      // Build events with proper UUIDs and previous_event_uuid
      const events = [];
      const triggerEvent = workflow.events.find(e => e.event_type === 'trigger');
      const actionEvents = workflow.events.filter(e => e.event_type === 'action').sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));

      if (triggerEvent) {
        const triggerUuid = uuidv4();
        
        // Clean up event config - remove null values and empty arrays
        const cleanEventConfig = { ...triggerEvent.event_config } as any;
        Object.keys(cleanEventConfig).forEach(key => {
          if (cleanEventConfig[key] === null || 
              (Array.isArray(cleanEventConfig[key]) && cleanEventConfig[key].length === 0)) {
            delete cleanEventConfig[key];
          }
        });
        
        events.push({
          event_type: 'trigger',
          event_category: triggerEvent.event_category,
          event_config: cleanEventConfig,
          is_active: true,
          event_uuid: triggerUuid
        });

        // Add actions with proper previous_event_uuid
        if (actionFlowType === 'sequential') {
          // Sequential: each action points to the previous action
          let previousUuid = triggerUuid;
          actionEvents.forEach((action, index) => {
            const actionUuid = uuidv4();
            
            // Clean up action event config
            const cleanActionConfig = { ...action.event_config } as any;
            Object.keys(cleanActionConfig).forEach(key => {
              if (cleanActionConfig[key] === null || 
                  (Array.isArray(cleanActionConfig[key]) && cleanActionConfig[key].length === 0)) {
                delete cleanActionConfig[key];
              }
            });
            
            events.push({
              event_type: 'action',
              event_category: action.event_category,
              event_config: cleanActionConfig,
              previous_event_uuid: previousUuid,
              is_active: true,
              event_uuid: actionUuid
            });
            previousUuid = actionUuid;
          });
        } else {
          // Parallel: all actions point to the trigger
          actionEvents.forEach(action => {
            const actionUuid = uuidv4();
            
            // Clean up action event config
            const cleanActionConfig = { ...action.event_config } as any;
            Object.keys(cleanActionConfig).forEach(key => {
              if (cleanActionConfig[key] === null || 
                  (Array.isArray(cleanActionConfig[key]) && cleanActionConfig[key].length === 0)) {
                delete cleanActionConfig[key];
              }
            });
            
            events.push({
              event_type: 'action',
              event_category: action.event_category,
              event_config: cleanActionConfig,
              previous_event_uuid: triggerUuid,
              is_active: true,
              event_uuid: actionUuid
            });
          });
        }
      }

      const payload = {
        name: workflow.name,
        is_active: workflow.is_active,
        profile_info_id: connectedAccount.id,
        events: events
      };

      if (editMode && editAutomation) {
        console.log('Updating automation with payload:', payload);
        const response = await automationApi.updateWorkflow(editAutomation.id, groupId, payload);
        console.log('Automation updated successfully:', response);
      } else {
        console.log('Creating automation with payload:', payload);
        const response = await automationApi.createWorkflow(payload);
        console.log('Automation created successfully:', response);
      }

      // Redirect to automations list
      navigate('/automations');
    } catch (error: any) {
      console.error(`Failed to ${editMode ? 'update' : 'create'} automation:`, error);
      setError(error.message || `Failed to ${editMode ? 'update' : 'create'} automation. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    // Show loading state while config is being loaded
    if (isLoadingConfig) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
            <p className="text-gray-600 dark:text-gray-400">Loading automation configuration...</p>
          </div>
        </div>
      );
    }

    // Show error state if config failed to load
    if (configError) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 dark:text-red-400 mb-4">{configError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <BasicInfoStep workflow={workflow} setWorkflow={setWorkflow} />;
              case 2:
          return <TriggerStep 
            onAddTrigger={addTriggerEvent} 
            workflow={workflow} 
            updateEventConfig={updateEventConfig} 
            setWorkflow={setWorkflow} 
            getAvailableActions={getAvailableActions} 
            validationErrors={validationErrors}
            onOpenPostSelector={handleOpenPostSelector}
            connectedAccount={connectedAccount}
          />;
              case 3:
          return (
            <ActionsStep
              workflow={workflow}
              actionFlowType={actionFlowType}
              setActionFlowType={setActionFlowType}
              onAddAction={addActionEvent}
              updateEventConfig={updateEventConfig}
              removeEvent={removeEvent}
              reorderActions={reorderActions}
              getAvailableActions={getAvailableActions}
              isActionConflicting={isActionConflicting}
              validationErrors={validationErrors}
            />
          );
              case 4:
          return <ReviewStep workflow={workflow} updateEventConfig={updateEventConfig} removeEvent={removeEvent} validationErrors={validationErrors} />;
      default:
        return null;
    }
  };

  /**
   * Validate current step
   */
  const validateCurrentStep = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    switch (currentStep) {
      case 1:
        if (!workflow.name.trim()) {
          errors.push({ field: 'name', message: 'Automation name is required' });
        }
        break;
      
      case 2:
        const triggerEvent = workflow.events.find(e => e.event_type === 'trigger');
        if (!triggerEvent) {
          errors.push({ field: 'trigger', message: 'Please select a trigger' });
        } else {
          // Validate trigger configuration
          const config = triggerEvent.event_config as any;
          
          switch (triggerEvent.event_category) {
            case 'post_comment':
              if (config.all_comments && config.keywords && config.keywords.length > 0) {
                errors.push({ field: 'comments', message: 'Choose either all comments or keywords, not both' });
              }
              if (!config.all_comments && (!config.keywords || config.keywords.length === 0)) {
                errors.push({ field: 'comments', message: 'Please add keywords or select all comments' });
              }
              if (config.all_posts && config.post_ids && config.post_ids.length > 0) {
                errors.push({ field: 'posts', message: 'Choose either all posts or specific posts, not both' });
              }
              if (!config.all_posts && (!config.post_ids || config.post_ids.length === 0)) {
                errors.push({ field: 'posts', message: 'Please select posts to monitor' });
              }
              if (!config.all_comments && config.keywords && config.keywords.length > 0) {
                if (config.fuzzy_match_allowed && !config.fuzzy_match_percentage) {
                  errors.push({ field: 'fuzzy_match_percentage', message: 'Fuzzy match percentage is required' });
                }
                if (config.fuzzy_match_percentage && (config.fuzzy_match_percentage < 0 || config.fuzzy_match_percentage > 100)) {
                  errors.push({ field: 'fuzzy_match_percentage', message: 'Percentage must be between 0 and 100' });
                }
              }
              break;
              
            case 'story_mention':
              if (config.all_stories && config.story_ids && config.story_ids.length > 0) {
                errors.push({ field: 'stories', message: 'Choose either all stories or specific stories, not both' });
              }
              if (!config.all_stories && (!config.story_ids || config.story_ids.length === 0)) {
                errors.push({ field: 'stories', message: 'Please select stories to monitor' });
              }
              break;
              
            case 'user_direct_message':
              if (config.all_messages && config.keywords && config.keywords.length > 0) {
                errors.push({ field: 'messages', message: 'Choose either all messages or keywords, not both' });
              }
              if (!config.all_messages && (!config.keywords || config.keywords.length === 0)) {
                errors.push({ field: 'messages', message: 'Please add keywords or select all messages' });
              }
              if (config.fuzzy_match_allowed && !config.fuzzy_match_percentage) {
                errors.push({ field: 'fuzzy_match_percentage', message: 'Fuzzy match percentage is required' });
              }
              if (config.fuzzy_match_percentage && (config.fuzzy_match_percentage < 0 || config.fuzzy_match_percentage > 100)) {
                errors.push({ field: 'fuzzy_match_percentage', message: 'Percentage must be between 0 and 100' });
              }
              break;
          }
        }
        break;
      
      case 3:
        const actionEvents = workflow.events.filter(e => e.event_type === 'action');
        if (actionEvents.length === 0) {
          errors.push({ field: 'actions', message: 'Please add at least one action' });
        } else {
          // Validate each action configuration
          actionEvents.forEach((action, index) => {
            const config = action.event_config as any;
            
            switch (action.event_category) {
              case 'reply_to_comment':
              case 'reply_to_dm':
                if (!config.template || config.template.trim() === '') {
                  errors.push({ field: `action_${index}`, message: 'Reply template is required' });
                }
                break;
                
              case 'reply_to_comment_webhook':
              case 'send_dm_webhook':
              case 'reply_to_dm_webhook':
                if (!config.endpoint || config.endpoint.trim() === '') {
                  errors.push({ field: `action_${index}`, message: 'Webhook endpoint is required' });
                } else if (!config.endpoint.startsWith('http')) {
                  errors.push({ field: `action_${index}`, message: 'Endpoint must start with http or https' });
                }
                break;
            }
          });
        }
        break;
      
      case 4:
        // Final validation before creation
        if (!workflow.name.trim()) {
          errors.push({ field: 'name', message: 'Automation name is required' });
        }
        const finalTriggerEvent = workflow.events.find(e => e.event_type === 'trigger');
        if (!finalTriggerEvent) {
          errors.push({ field: 'trigger', message: 'Please select a trigger' });
        }
        const finalActionEvents = workflow.events.filter(e => e.event_type === 'action');
        if (finalActionEvents.length === 0) {
          errors.push({ field: 'actions', message: 'Please add at least one action' });
        }
        break;
    }

    return errors;
  };

  /**
   * Check if can proceed to next step
   */
  const canProceed = () => {
    // First check basic requirements
    let basicCheck = false;
    
    switch (currentStep) {
      case 1:
        basicCheck = workflow.name.trim().length > 0;
        break;
      case 2:
        basicCheck = workflow.events.some(e => e.event_type === 'trigger');
        break;
      case 3:
        basicCheck = workflow.events.some(e => e.event_type === 'action');
        break;
      case 4:
        basicCheck = workflow.events.length >= 2;
        break;
      default:
        basicCheck = false;
    }

    // If basic check fails, return false
    if (!basicCheck) {
      return false;
    }

    // Now validate form data
    const validationErrors = validateCurrentStep();
    return validationErrors.length === 0;
  };

  /**
   * Handle next step
   */
  const handleNext = () => {
    // Validate current step before proceeding
    const errors = validateCurrentStep();
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      setError(errors[0].message);
      return;
    }

    if (canProceed() && currentStep < steps.length) {
      setError(null); // Clear any previous errors
      setValidationErrors([]); // Clear validation errors
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Handle previous step
   */
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Navigate to specific step
   */
  const navigateToStep = (stepNumber: number) => {
    // Only allow navigation to completed steps or the current step
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      // Allow going back to any previous step
      if (stepNumber <= currentStep) {
        setCurrentStep(stepNumber);
      }
      // Don't allow going forward to incomplete steps
      // Users must complete each step in order
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/automations')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Automations
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {editMode ? 'Edit Automation' : 'Create Automation'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {editMode ? 'Update your automation settings and configuration' : 'Build powerful automations to engage with your audience'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isClickable = step.id <= currentStep; // Only allow clicking on completed or current step
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => navigateToStep(step.id)}
                    disabled={!isClickable}
                    title={!isClickable ? `Complete step ${currentStep} first` : `Go to step ${step.id}`}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600 cursor-pointer'
                        : isCurrent
                        ? 'bg-primary-500 border-primary-500 text-white cursor-pointer'
                        : 'border-gray-300 dark:border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </button>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isCompleted || isCurrent
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected Account Info */}
        {connectedAccount && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              {/* Profile Image */}
              {connectedAccount.profile_link ? (
                <img 
                  src={connectedAccount.profile_link}
                  alt={`${connectedAccount.name} profile`}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Fallback Icon */}
              <div className={`w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center ${connectedAccount.profile_link ? 'hidden' : ''}`}>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">IG</span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Connected Account: @{connectedAccount.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                previewMode
                  ? 'border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length ? (
              <LoadingButton
                onClick={handleNext}
                disabled={!canProceed() || isLoadingConfig}
                variant="primary"
                size="md"
              >
                Next
              </LoadingButton>
            ) : (
              <LoadingButton
                onClick={createAutomation}
                loading={isLoading}
                loadingText={editMode ? "Updating..." : "Creating..."}
                variant="primary"
                size="md"
              >
                {editMode ? 'Update Automation' : 'Create Automation'}
              </LoadingButton>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {previewMode && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Automation Flow Preview
              </h3>
              <SequenceDiagram workflow={workflow} actionFlowType={actionFlowType} />
            </div>
          </div>
        )}

        {/* Instagram Post Selector */}
        {isPostSelectorOpen && currentEventForPostSelection && connectedAccount && (
          <InstagramPostSelector
            isOpen={isPostSelectorOpen}
            onClose={handleClosePostSelector}
            onSelect={handlePostSelection}
            profileInfoId={connectedAccount.id}
            selectedPostIds={workflow.events.find(e => e.temp_id === currentEventForPostSelection)?.event_config.post_ids || []}
          />
        )}
      </div>
    </div>
  );
};

// Step Components
const BasicInfoStep: React.FC<{ workflow: Workflow; setWorkflow: (workflow: Workflow) => void }> = ({ workflow, setWorkflow }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Basic Information
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Give your automation a name to help you identify it later.
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Automation Name *
      </label>
      <input
        type="text"
        value={workflow.name}
        onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
        placeholder="e.g., Smart Comment Handler"
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  </div>
);

const TriggerStep: React.FC<{ 
  onAddTrigger: (category: string) => void;
  workflow: Workflow;
  updateEventConfig: (tempId: string, config: Partial<EventConfig>) => void;
  setWorkflow: (workflow: Workflow) => void;
  getAvailableActions: (triggerId: string) => string[];
  validationErrors: ValidationError[];
  onOpenPostSelector: (eventTempId: string) => void;
  connectedAccount: any;
}> = ({ onAddTrigger, workflow, updateEventConfig, setWorkflow, getAvailableActions, validationErrors, onOpenPostSelector, connectedAccount }) => {
  const triggerEvent = workflow.events.find(e => e.event_type === 'trigger');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Choose Your Trigger
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select what event will start your automation. You can only have one trigger per automation.
        </p>
      </div>

      {!triggerEvent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EVENT_CATEGORIES.TRIGGERS.map((trigger) => {
            const Icon = trigger.icon;
            const availableActions = getAvailableActions(trigger.id);
            return (
              <button
                key={trigger.id}
                onClick={() => onAddTrigger(trigger.id)}
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {trigger.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {trigger.description}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <p className="font-medium mb-1">Available actions:</p>
                      <div className="flex flex-wrap gap-1">
                        {availableActions.slice(0, 3).map((actionId: string) => (
                          <span key={actionId} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {ACTION_LABELS[actionId] || actionId}
                          </span>
                        ))}
                        {availableActions.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            +{availableActions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Trigger Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-300">T</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {triggerEvent.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Trigger selected - Configure the settings below
                  </p>
                </div>
              </div>
                             <button
                 onClick={() => {
                   setWorkflow({
                     ...workflow,
                     events: workflow.events.filter((e: Event) => e.event_type !== 'trigger')
                   });
                 }}
                 className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
               >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Configure {TRIGGER_LABELS[triggerEvent.event_category] || triggerEvent.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Trigger
            </h4>
            
            {(() => {
              const FormComponent = getEventForm(triggerEvent.event_category);
              if (FormComponent) {
                return (
                  <FormComponent
                    config={triggerEvent.event_config}
                    onChange={(newConfig) => updateEventConfig(triggerEvent.temp_id, newConfig)}
                    errors={validationErrors}
                    onOpenPostSelector={() => onOpenPostSelector(triggerEvent.temp_id)}
                    profileInfoId={connectedAccount?.id}
                  />
                );
              }
              
              // Fallback for triggers without specific forms
              return (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  This trigger will activate when the specified event occurs.
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

const ActionsStep: React.FC<{
  workflow: Workflow;
  actionFlowType: 'sequential' | 'parallel';
  setActionFlowType: (type: 'sequential' | 'parallel') => void;
  onAddAction: (category: string) => void;
  updateEventConfig: (tempId: string, config: Partial<EventConfig>) => void;
  removeEvent: (tempId: string) => void;
  reorderActions: (fromIndex: number, toIndex: number) => void;
  getAvailableActions: (triggerId: string) => string[];
  isActionConflicting: (actionId: string, selectedActions: string[], triggerId: string) => boolean;
  validationErrors: ValidationError[];
}> = ({ workflow, actionFlowType, setActionFlowType, onAddAction, updateEventConfig, removeEvent, reorderActions, getAvailableActions, isActionConflicting, validationErrors }) => {
  const triggerEvent = workflow.events.find(e => e.event_type === 'trigger');
  const actionEvents = workflow.events.filter(e => e.event_type === 'action').sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Configure Actions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add multiple actions that will be performed when the trigger occurs.
        </p>
      </div>

      {/* Flow Type Selection */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Action Flow Type
        </h3>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="flowType"
              value="sequential"
              checked={actionFlowType === 'sequential'}
              onChange={(e) => setActionFlowType(e.target.value as 'sequential' | 'parallel')}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Sequential (one after another)
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="flowType"
              value="parallel"
              checked={actionFlowType === 'parallel'}
              onChange={(e) => setActionFlowType(e.target.value as 'sequential' | 'parallel')}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Parallel (all at once)
            </span>
          </label>
        </div>
      </div>

      {/* Current Trigger */}
      {triggerEvent && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">T</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Trigger: {triggerEvent.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                This will start your automation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Actions ({actionEvents.length})
          </h3>
          <button
            onClick={() => document.getElementById('action-selector')?.classList.toggle('hidden')}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </button>
        </div>

        {/* Action Selector */}
        <div id="action-selector" className="hidden bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Choose Action Type
          </h4>
          {triggerEvent ? (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Available actions for "{TRIGGER_LABELS[triggerEvent.event_category] || triggerEvent.event_category}" trigger:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(() => {
                  const availableActions = getAvailableActions(triggerEvent.event_category);
                  const selectedActions = actionEvents.map(e => e.event_category);
                  
                  return EVENT_CATEGORIES.ACTIONS
                    .filter(action => availableActions.includes(action.id))
                    .map((action) => {
                      const Icon = action.icon;
                      const isConflicting = isActionConflicting(action.id, selectedActions, triggerEvent.event_category);
                      const isSelected = selectedActions.includes(action.id);
                      
                      return (
                        <button
                          key={action.id}
                          onClick={() => {
                            if (!isConflicting && !isSelected) {
                              onAddAction(action.id);
                              document.getElementById('action-selector')?.classList.add('hidden');
                            }
                          }}
                          disabled={isConflicting || isSelected}
                          className={`p-4 border rounded-lg transition-all duration-200 text-left ${
                            isSelected
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/20 cursor-not-allowed'
                              : isConflicting
                              ? 'border-red-300 bg-red-50 dark:bg-red-900/20 cursor-not-allowed opacity-60'
                              : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-white dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-green-100 dark:bg-green-800'
                                : isConflicting
                                ? 'bg-red-100 dark:bg-red-800'
                                : 'bg-green-100 dark:bg-green-900/20'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                isSelected
                                  ? 'text-green-600 dark:text-green-300'
                                  : isConflicting
                                  ? 'text-red-600 dark:text-red-300'
                                  : 'text-green-600 dark:text-green-400'
                              }`} />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${
                                isSelected
                                  ? 'text-green-700 dark:text-green-200'
                                  : isConflicting
                                  ? 'text-red-700 dark:text-red-200'
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {action.label}
                                {isSelected && ' (Selected)'}
                                {isConflicting && ' (Conflicts)'}
                              </p>
                              <p className={`text-xs ${
                                isSelected
                                  ? 'text-green-600 dark:text-green-300'
                                  : isConflicting
                                  ? 'text-red-600 dark:text-red-300'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    });
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>Please select a trigger first to see available actions.</p>
            </div>
          )}
        </div>

        {/* Actions Display */}
        {actionEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No actions added yet. Click "Add Action" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actionEvents.map((action, index) => (
              <div key={action.temp_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600 dark:text-green-300">
                        {action.sequence_order}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {actionFlowType === 'sequential' ? 'Sequential Action' : 'Parallel Action'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {actionFlowType === 'sequential' && actionEvents.length > 1 && (
                      <>
                        <button
                          onClick={() => reorderActions(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => reorderActions(index, Math.min(actionEvents.length - 1, index + 1))}
                          disabled={index === actionEvents.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeEvent(action.temp_id)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action-specific configuration */}
                {(() => {
                  const FormComponent = getEventForm(action.event_category);
                  if (FormComponent) {
                    return (
                      <div className="mt-4">
                        <FormComponent
                          config={action.event_config}
                          onChange={(newConfig) => updateEventConfig(action.temp_id, newConfig)}
                          errors={validationErrors.filter(err => err.field === `action_${index}`)}
                        />
                      </div>
                    );
                  }
                  
                  // Fallback for actions without specific forms
                  return (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      This action will be performed when triggered.
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewStep: React.FC<{
  workflow: Workflow;
  updateEventConfig: (tempId: string, config: Partial<EventConfig>) => void;
  removeEvent: (tempId: string) => void;
  validationErrors: ValidationError[];
}> = ({ workflow, updateEventConfig, removeEvent, validationErrors }) => {
  const triggerEvent = workflow.events.find(e => e.event_type === 'trigger');
  const actionEvents = workflow.events.filter(e => e.event_type === 'action').sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Review & Configure
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Review your automation and configure the settings for each step.
        </p>
      </div>

      {/* Workflow Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Automation Summary
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Name:</strong> {workflow.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Trigger:</strong> {triggerEvent?.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Actions:</strong> {actionEvents.length} action{actionEvents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Trigger Configuration */}
      {triggerEvent && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                Trigger
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {triggerEvent.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
            </div>
          </div>

          {/* Trigger-specific configuration */}
          {(() => {
            const FormComponent = getEventForm(triggerEvent.event_category);
            if (FormComponent) {
              return (
                <FormComponent
                  config={triggerEvent.event_config}
                  onChange={(newConfig) => updateEventConfig(triggerEvent.temp_id, newConfig)}
                  errors={validationErrors}
                />
              );
            }
            
            return (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                This trigger will activate when the specified event occurs.
              </div>
            );
          })()}
        </div>
      )}

      {/* Actions Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Actions Configuration
        </h3>
        {actionEvents.map((action) => (
          <div key={action.temp_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                  Action {action.sequence_order}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {action.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
              </div>
              <button
                onClick={() => removeEvent(action.temp_id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Action-specific configuration */}
            {(() => {
              const FormComponent = getEventForm(action.event_category);
              if (FormComponent) {
                return (
                  <FormComponent
                    config={action.event_config}
                    onChange={(newConfig) => updateEventConfig(action.temp_id, newConfig)}
                    errors={validationErrors}
                  />
                );
              }
              
              return (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  This action will be performed when triggered.
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};

// Sequence Diagram Component
const SequenceDiagram: React.FC<{ workflow: Workflow; actionFlowType: 'sequential' | 'parallel' }> = ({ workflow, actionFlowType }) => {
  const triggerEvent = workflow.events.find(e => e.event_type === 'trigger');
  const actionEvents = workflow.events.filter(e => e.event_type === 'action').sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));

  if (!triggerEvent) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No trigger selected yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flow Type Indicator */}
      <div className="flex items-center justify-center">
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          actionFlowType === 'sequential' 
            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
        }`}>
          {actionFlowType === 'sequential' ? 'Sequential Flow' : 'Parallel Flow'}
        </div>
      </div>

      {/* Trigger Card */}
      <div className="flex justify-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-sm w-full">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-300">T</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                {triggerEvent.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Trigger Event
              </p>
              {triggerEvent.event_config.keywords && triggerEvent.event_config.keywords.length > 0 && (
                <p className="text-xs text-blue-500 mt-1">
                  Keywords: {triggerEvent.event_config.keywords.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flow Arrow */}
      {actionEvents.length > 0 && (
        <div className="flex justify-center">
          <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
        </div>
      )}

      {/* Actions */}
      {actionEvents.length > 0 && (
        <div className={`${actionFlowType === 'parallel' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {actionEvents.map((action, index) => (
            <div key={action.temp_id} className={`${actionFlowType === 'parallel' ? '' : 'flex justify-center'}`}>
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 max-w-sm w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600 dark:text-green-300">
                      {actionFlowType === 'sequential' ? action.sequence_order : index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      {action.event_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      Action {actionFlowType === 'sequential' ? action.sequence_order : index + 1}
                    </p>
                    {action.event_config.template && (
                      <p className="text-xs text-green-500 mt-1 truncate">
                        "{action.event_config.template}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flow Description */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {actionFlowType === 'sequential' 
            ? `When triggered, ${actionEvents.length} action${actionEvents.length !== 1 ? 's will execute' : ' will execute'} in sequence.`
            : `When triggered, ${actionEvents.length} action${actionEvents.length !== 1 ? 's will execute' : ' will execute'} simultaneously.`
          }
        </p>
      </div>
    </div>
  );
};

export default AutomationBuilderPage; 