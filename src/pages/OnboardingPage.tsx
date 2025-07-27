import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  MessageSquare, 
  Target, 
  BarChart3, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Instagram,
  Users,
  Settings
} from 'lucide-react';

/**
 * Onboarding step interface
 */
interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

/**
 * Onboarding page component with step-by-step walkthrough
 * @returns Onboarding page component
 */
const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const totalSteps = 4;

  /**
   * Handle step completion
   * @param stepId - Step ID to mark as completed
   */
  const handleStepComplete = (stepId: number): void => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    if (stepId < totalSteps) {
      setCurrentStep(stepId + 1);
    } else {
      navigate('/connect-accounts');
    }
  };

  /**
   * Handle step navigation
   * @param stepId - Step ID to navigate to
   */
  const handleStepNavigation = (stepId: number): void => {
    if (stepId <= currentStep || completedSteps.has(stepId)) {
      setCurrentStep(stepId);
    }
  };

  /**
   * Onboarding steps configuration
   */
  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Welcome to TezDM',
      description: 'Let\'s get you started with Instagram automation',
      icon: Zap,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Automate Your Instagram Growth
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              TezDM helps you automatically respond to comments, DMs, and story replies 
              to boost engagement and grow your Instagram presence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <MessageSquare className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Auto Replies</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Respond to comments and DMs automatically
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Target className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Smart Triggers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set up keyword-based automation rules
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <BarChart3 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track performance and engagement rates
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'How It Works',
      description: 'Understanding the automation process',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How TezDM Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our automation process is simple and effective
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Connect Your Instagram
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Securely connect your Instagram Business account through Meta's OAuth.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Set Up Automation Rules
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create rules for when and how to respond to comments, DMs, or story replies.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Monitor & Optimize
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track performance metrics and adjust your automation strategy.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Safe & Compliant
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Our automation follows Instagram's guidelines and rate limits to ensure your account stays safe.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Choose Your Plan',
      description: 'Select the plan that fits your needs',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Start Free, Scale as You Grow
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose the plan that best fits your Instagram automation needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Free Plan
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  $0<span className="text-lg text-gray-500">/month</span>
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  25 DMs per day
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Basic automation rules
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  1 Instagram account
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Email support
                </li>
              </ul>
              <button
                onClick={() => handleStepComplete(3)}
                className="w-full btn-secondary"
              >
                Start with Free
              </button>
            </div>
            <div className="p-6 border-2 border-primary-500 rounded-xl relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Pro Plan
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  $29<span className="text-lg text-gray-500">/month</span>
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  500 DMs per day
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Advanced automation
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Multiple accounts
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Analytics dashboard
                </li>
                <li className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Priority support
                </li>
              </ul>
              <button
                onClick={() => handleStepComplete(3)}
                className="w-full btn-primary"
              >
                Start Pro Trial
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            You can upgrade or downgrade your plan at any time
          </p>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Ready to Start',
      description: 'Let\'s connect your Instagram account',
      icon: Instagram,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
            <Instagram className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Connect Your Instagram Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              Connect your Instagram Business account to start automating your interactions. 
              We use Meta's secure OAuth to ensure your account stays safe.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              What you'll need:
            </h3>
            <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Instagram Business account
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Admin access to your account
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Meta Business account (optional)
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleStepComplete(4)}
              className="btn-primary flex items-center justify-center"
            >
              Connect Instagram
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-ghost"
            >
              Skip for now
            </button>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Getting Started
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="gradient-bg h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepNavigation(step.id)}
              disabled={step.id > currentStep && !completedSteps.has(step.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${step.id === currentStep 
                  ? 'bg-primary-500 text-white' 
                  : completedSteps.has(step.id)
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }
                ${step.id <= currentStep || completedSteps.has(step.id) 
                  ? 'cursor-pointer hover:bg-opacity-80' 
                  : 'cursor-not-allowed opacity-50'
                }
              `}
            >
              <step.icon className="w-4 h-4" />
              <span>{step.title}</span>
              {completedSteps.has(step.id) && (
                <Check className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="card min-h-[500px]">
        {currentStepData && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <currentStepData.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStepData.description}
              </p>
            </div>
            {currentStepData.content}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost"
          >
            Skip onboarding
          </button>
          {currentStep < totalSteps && (
            <button
              onClick={() => handleStepComplete(currentStep)}
              className="btn-primary flex items-center"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage; 