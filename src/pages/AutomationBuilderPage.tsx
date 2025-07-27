import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Power, 
  Info,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Image,
  UserPlus,
  MessageSquare,
  Globe,
  Settings,
  Plus,
  X,
  Check,
  Instagram,
  Facebook,
  MessageCircle as WhatsApp
} from 'lucide-react';
import { automationConfig } from '../constants/mockApi';

/**
 * Automation builder page component
 * @returns Automation builder page component
 */
const AutomationBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [automationName, setAutomationName] = useState<string>('Untitled');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [stepConfigs, setStepConfigs] = useState<Record<string, any>>({});

  // Initialize trigger from URL params
  useEffect(() => {
    const triggerParam = searchParams.get('trigger');
    if (triggerParam) {
      setSelectedTrigger(triggerParam);
    }
  }, [searchParams]);

  const platform = automationConfig.automationPlatforms[selectedPlatform as keyof typeof automationConfig.automationPlatforms];
  const triggers = platform?.triggers || {};

  /**
   * Get platform icon
   * @param platformName - Platform name
   * @returns Platform icon component
   */
  const getPlatformIcon = (platformName: string) => {
    switch (platformName) {
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
   * @param triggerType - Trigger type
   * @returns Trigger icon component
   */
  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
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
   * Toggle step expansion
   * @param stepId - Step ID
   */
  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  /**
   * Update step configuration
   * @param stepId - Step ID
   * @param config - Step configuration
   */
  const updateStepConfig = (stepId: string, config: any) => {
    setStepConfigs(prev => ({
      ...prev,
      [stepId]: config
    }));
  };

  /**
   * Handle save automation
   */
  const handleSave = () => {
    console.log('Saving automation:', {
      name: automationName,
      platform: selectedPlatform,
      trigger: selectedTrigger,
      isActive,
      stepConfigs
    });
    // This would typically call an API to save the automation
  };

  /**
   * Handle preview automation
   */
  const handlePreview = () => {
    console.log('Previewing automation');
    // This would typically open a preview modal
  };

  /**
   * Handle set live
   */
  const handleSetLive = () => {
    if (!selectedTrigger) {
      alert('Please select a trigger first');
      return;
    }
    console.log('Setting automation live');
    // This would typically call an API to activate the automation
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Platform & Trigger Selection */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <button 
              onClick={() => navigate('/automations')}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              {isEditingName ? (
                <input
                  type="text"
                  value={automationName}
                  onChange={(e) => setAutomationName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {automationName}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
            Platform
          </h2>
          <div className="space-y-2">
            {Object.entries(automationConfig.automationPlatforms).map(([key, platformData]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedPlatform(key);
                  setSelectedTrigger('');
                }}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  selectedPlatform === key
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: platformData.color + '20' }}>
                  {getPlatformIcon(key)}
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {platformData.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trigger Selection */}
        {selectedPlatform && (
          <div className="p-6 flex-1">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Triggers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Specific {platform.name} event that starts your automation.
            </p>
            <div className="space-y-2">
              {Object.entries(triggers).map(([key, trigger]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTrigger(key)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    selectedTrigger === key
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    {getTriggerIcon(key)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {trigger.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {trigger.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Workflow Builder */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Saved
              </span>
              <button className="btn-secondary flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Preview
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                className="btn-secondary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                onClick={handleSetLive}
                disabled={!selectedTrigger}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Power className="w-4 h-4 mr-2" />
                Set Live
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedTrigger ? (
            <div className="space-y-6">
              {/* Trigger Section */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    When should this automation run?
                  </h2>
                  <button
                    onClick={() => toggleStepExpansion('trigger')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {expandedSteps.has('trigger') ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {expandedSteps.has('trigger') && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Which posts should I monitor?
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="all_posts">All my posts</option>
                        <option value="single_post">Single post</option>
                        <option value="multiple_posts">Multiple posts</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        When should I respond to comments?
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="all_comments">Every comment</option>
                        <option value="keyword_based">Comments with keywords</option>
                        <option value="question_based">Questions only</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Steps */}
              {triggers[selectedTrigger]?.steps.map((step, index) => (
                <div key={step.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {step.type === 'message_builder' && <MessageCircle className="w-4 h-4" />}
                        {step.type === 'dm_builder' && <MessageSquare className="w-4 h-4" />}
                        {step.type === 'webhook_config' && <Globe className="w-4 h-4" />}
                        {step.type === 'dropdown' && <Settings className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {step.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Inactive
                      </span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                      <button
                        onClick={() => toggleStepExpansion(step.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {expandedSteps.has(step.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {expandedSteps.has(step.id) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      {step.type === 'message_builder' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Reply Messages
                            </label>
                            <div className="space-y-2">
                              {step.options?.messages?.map((message: string, msgIndex: number) => (
                                <div key={msgIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => {
                                      const newMessages = [...(step.options?.messages || [])];
                                      newMessages[msgIndex] = e.target.value;
                                      updateStepConfig(step.id, { ...step.options, messages: newMessages });
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  />
                                  <button className="p-2 text-red-400 hover:text-red-600">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button className="btn-secondary flex items-center">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Message
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`randomize-${step.id}`}
                              checked={step.options?.randomize || false}
                              onChange={(e) => updateStepConfig(step.id, { ...step.options, randomize: e.target.checked })}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor={`randomize-${step.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                              Randomize messages
                            </label>
                          </div>
                        </div>
                      )}
                      
                      {step.type === 'dm_builder' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              DM Message
                            </label>
                            <textarea
                              value={step.options?.message || ''}
                              onChange={(e) => updateStepConfig(step.id, { ...step.options, message: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Enter your DM message..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Button Text
                              </label>
                              <input
                                type="text"
                                value={step.options?.button?.text || ''}
                                onChange={(e) => updateStepConfig(step.id, { 
                                  ...step.options, 
                                  button: { ...step.options?.button, text: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Get Offer"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Button URL
                              </label>
                              <input
                                type="url"
                                value={step.options?.button?.url || ''}
                                onChange={(e) => updateStepConfig(step.id, { 
                                  ...step.options, 
                                  button: { ...step.options?.button, url: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {step.type === 'webhook_config' && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`webhook-enabled-${step.id}`}
                              checked={step.options?.enabled || false}
                              onChange={(e) => updateStepConfig(step.id, { ...step.options, enabled: e.target.checked })}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor={`webhook-enabled-${step.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Enable webhook
                            </label>
                          </div>
                          {step.options?.enabled && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Webhook URL
                              </label>
                              <input
                                type="url"
                                value={step.options?.url || ''}
                                onChange={(e) => updateStepConfig(step.id, { ...step.options, url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="https://api.example.com/webhook"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Select a trigger to get started
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a trigger from the left sidebar to configure your automation workflow.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationBuilderPage; 