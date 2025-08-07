import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  GitCommit
} from 'lucide-react';
import { SecurityManager } from '../utils/securityManager';
import { automationApi } from '../services/automationApi';
import LoadingButton from '../components/LoadingButton';

// Types based on your Django models
interface EventConfig {
  keywords?: string[];
  fuzzy_match_allowed?: boolean;
  fuzzy_match_percentage?: number;
  post_ids?: string[];
  all_posts?: boolean;
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

// Event categories based on your enums
const EVENT_CATEGORIES = {
  TRIGGERS: [
    { id: 'post_comment', label: 'Post Comment', icon: MessageCircle, description: 'When someone comments on a post' },
    { id: 'story_reply', label: 'Story Reply', icon: Image, description: 'When someone replies to your story' },
    { id: 'story_mention', label: 'Story Mention', icon: AtSign, description: 'When someone mentions you in a story' },
    { id: 'dm_reply', label: 'DM Reply', icon: Send, description: 'When someone sends you a DM' }
  ],
  ACTIONS: [
    { id: 'reply_to_comment', label: 'Reply to Comment', icon: MessageCircle, description: 'Reply to the comment' },
    { id: 'send_dm', label: 'Send DM', icon: Send, description: 'Send a direct message' },
    { id: 'like_post', label: 'Like Post', icon: CheckCircle, description: 'Like the post' },
    { id: 'follow_user', label: 'Follow User', icon: Plus, description: 'Follow the user' },
    { id: 'log_interaction', label: 'Log Interaction', icon: GitCommit, description: 'Log the interaction for analytics' }
  ]
};

/**
 * Automation Builder Page Component
 */
const AutomationBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [workflow, setWorkflow] = useState<Workflow>({
    name: '',
    is_active: true,
    events: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [actionFlowType, setActionFlowType] = useState<'sequential' | 'parallel'>('sequential');

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
   * Generate unique temp ID for events
   */
  const generateTempId = (): string => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      event_config: {
        keywords: [],
        fuzzy_match_allowed: false,
        fuzzy_match_percentage: 80,
        all_posts: true
      },
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

    const existingActions = workflow.events.filter(e => e.event_type === 'action');
    const newSequenceOrder = existingActions.length + 1;

    const actionEvent: Event = {
      temp_id: generateTempId(),
      event_type: 'action',
      event_category: eventCategory,
      event_config: {
        template: ''
      },
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
   * Create automation
   */
  const createAutomation = async () => {
    if (!workflow.name.trim()) {
      setError('Please enter a workflow name');
      return;
    }

    const triggerEvent = workflow.events.find(e => e.event_type === 'trigger');
    const actionEvents = workflow.events.filter(e => e.event_type === 'action');

    if (!triggerEvent) {
      setError('Please add a trigger');
      return;
    }

    if (actionEvents.length === 0) {
      setError('Please add at least one action');
      return;
    }

    const groupId = getGroupId();
    if (!groupId) {
      setError('Group ID not found. Please login again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: CreateAutomationPayload = {
        workflow: {
          name: workflow.name
        },
        events: workflow.events
      };

      console.log('Creating automation with payload:', payload);
      
      const response = await automationApi.createAutomation(groupId, payload);
      
      console.log('Automation created successfully:', response);
      navigate('/automations');
    } catch (error) {
      console.error('Failed to create automation:', error);
      setError('Failed to create automation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep workflow={workflow} setWorkflow={setWorkflow} />;
      case 2:
        return <TriggerStep onAddTrigger={addTriggerEvent} workflow={workflow} updateEventConfig={updateEventConfig} setWorkflow={setWorkflow} />;
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
          />
        );
      case 4:
        return <ReviewStep workflow={workflow} updateEventConfig={updateEventConfig} removeEvent={removeEvent} />;
      default:
        return null;
    }
  };

  /**
   * Check if can proceed to next step
   */
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return workflow.name.trim().length > 0;
      case 2:
        return workflow.events.some(e => e.event_type === 'trigger');
      case 3:
        return workflow.events.some(e => e.event_type === 'action');
      case 4:
        return workflow.events.length >= 2;
      default:
        return false;
    }
  };

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (canProceed() && currentStep < steps.length) {
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
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
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
            Create Automation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Build powerful automations to engage with your audience
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
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => navigateToStep(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </button>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

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
                disabled={!canProceed()}
                variant="primary"
                size="md"
              >
                Next
              </LoadingButton>
            ) : (
              <LoadingButton
                onClick={createAutomation}
                loading={isLoading}
                loadingText="Creating..."
                variant="primary"
                size="md"
              >
                Create Automation
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
}> = ({ onAddTrigger, workflow, updateEventConfig, setWorkflow }) => {
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {trigger.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {trigger.description}
                    </p>
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
          {triggerEvent.event_category === 'post_comment' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configure Post Comment Trigger
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={triggerEvent.event_config.keywords?.join(', ') || ''}
                    onChange={(e) => updateEventConfig(triggerEvent.temp_id, {
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    })}
                    placeholder="hello, thanks, great, awesome"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to trigger on all comments
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={triggerEvent.event_config.fuzzy_match_allowed || false}
                      onChange={(e) => updateEventConfig(triggerEvent.temp_id, {
                        fuzzy_match_allowed: e.target.checked
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Enable fuzzy matching
                    </span>
                  </label>

                  {triggerEvent.event_config.fuzzy_match_allowed && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Match %:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={triggerEvent.event_config.fuzzy_match_percentage || 80}
                        onChange={(e) => updateEventConfig(triggerEvent.temp_id, {
                          fuzzy_match_percentage: parseInt(e.target.value)
                        })}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Which posts to monitor?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`posts_${triggerEvent.temp_id}`}
                        checked={triggerEvent.event_config.all_posts || false}
                        onChange={() => updateEventConfig(triggerEvent.temp_id, { all_posts: true, post_ids: undefined })}
                        className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        All my posts
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`posts_${triggerEvent.temp_id}`}
                        checked={!triggerEvent.event_config.all_posts}
                        onChange={() => updateEventConfig(triggerEvent.temp_id, { all_posts: false })}
                        className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Selected posts only
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {triggerEvent.event_category === 'story_reply' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configure Story Reply Trigger
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This trigger will activate when someone replies to your story.
              </p>
            </div>
          )}

          {triggerEvent.event_category === 'story_mention' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configure Story Mention Trigger
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This trigger will activate when someone mentions you in their story.
              </p>
            </div>
          )}

          {triggerEvent.event_category === 'dm_reply' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configure DM Reply Trigger
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This trigger will activate when someone sends you a direct message.
              </p>
            </div>
          )}
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
}> = ({ workflow, actionFlowType, setActionFlowType, onAddAction, updateEventConfig, removeEvent, reorderActions }) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EVENT_CATEGORIES.ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    onAddAction(action.id);
                    document.getElementById('action-selector')?.classList.add('hidden');
                  }}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
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
                {(action.event_category === 'reply_to_comment' || action.event_category === 'send_dm') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message Template
                    </label>
                    <textarea
                      value={action.event_config.template || ''}
                      onChange={(e) => updateEventConfig(action.temp_id, { template: e.target.value })}
                      placeholder="Enter your message template..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Available variables: {'{user_name}'}, {'{post_title}'}, {'{comment}'}
                    </p>
                  </div>
                )}
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
}> = ({ workflow, updateEventConfig, removeEvent }) => {
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
          {triggerEvent.event_category === 'post_comment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={triggerEvent.event_config.keywords?.join(', ') || ''}
                  onChange={(e) => updateEventConfig(triggerEvent.temp_id, {
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                  })}
                  placeholder="hello, thanks, great"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={triggerEvent.event_config.fuzzy_match_allowed || false}
                    onChange={(e) => updateEventConfig(triggerEvent.temp_id, {
                      fuzzy_match_allowed: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable fuzzy matching
                  </span>
                </label>

                {triggerEvent.event_config.fuzzy_match_allowed && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Match %:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={triggerEvent.event_config.fuzzy_match_percentage || 80}
                      onChange={(e) => updateEventConfig(triggerEvent.temp_id, {
                        fuzzy_match_percentage: parseInt(e.target.value)
                      })}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`posts_${triggerEvent.temp_id}`}
                    checked={triggerEvent.event_config.all_posts || false}
                    onChange={() => updateEventConfig(triggerEvent.temp_id, { all_posts: true, post_ids: undefined })}
                    className="border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    All posts
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`posts_${triggerEvent.temp_id}`}
                    checked={!triggerEvent.event_config.all_posts}
                    onChange={() => updateEventConfig(triggerEvent.temp_id, { all_posts: false })}
                    className="border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Selected posts
                  </span>
                </label>
              </div>
            </div>
          )}
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
            {(action.event_category === 'reply_to_comment' || action.event_category === 'send_dm') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Template
                </label>
                <textarea
                  value={action.event_config.template || ''}
                  onChange={(e) => updateEventConfig(action.temp_id, { template: e.target.value })}
                  placeholder="Enter your message template..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {'{user_name}'}, {'{post_title}'}, {'{comment}'}
                </p>
              </div>
            )}
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