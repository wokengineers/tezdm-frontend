import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  X, 
  Download, 
  Calendar,
  TrendingUp,
  Zap,
  Crown,
  Building,
  ArrowRight,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockData } from '../constants/mockApi';

/**
 * Billing page component
 * @returns Billing page component
 */
const PlanBillingPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentPlan = mockData.billing.currentPlan;
  const { plans, billing } = mockData;

  /**
   * Handle plan upgrade
   * @param planName - Plan name to upgrade to
   */
  const handleUpgrade = async (planName: string): Promise<void> => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user plan
      updateUser({ plan: planName.toLowerCase() });
      
      setMessage({ type: 'success', text: `Successfully upgraded to ${planName} plan!` });
      setSelectedPlan(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upgrade plan. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Download invoice
   * @param invoiceId - Invoice ID
   */
  const handleDownloadInvoice = (invoiceId: string): void => {
    // Simulate invoice download
    console.log('Downloading invoice:', invoiceId);
  };

  /**
   * Get plan icon
   * @param planName - Plan name
   * @returns Plan icon component
   */
  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Zap className="w-5 h-5" />;
      case 'pro':
      case 'tezdm pro':
        return <Crown className="w-5 h-5" />;
      case 'enterprise':
        return <Building className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  /**
   * Get plan color
   * @param planName - Plan name
   * @returns Plan color classes
   */
  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      case 'pro':
      case 'tezdm pro':
        return 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400';
      case 'enterprise':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Plan & Billing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription and billing information
          </p>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm ${
            message.type === 'success' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan & Usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPlanColor(currentPlan)}`}>
                  {getPlanIcon(currentPlan)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPlan === 'free' ? 'Free plan' : plans.find(p => p.name.toLowerCase() === currentPlan)?.price || '₹499/month'}
                  </p>
                </div>
              </div>
              {currentPlan !== 'free' && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next billing</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {billing.nextBilling ? new Date(billing.nextBilling).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              )}
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">DMs Used</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {billing.usage.dmsUsed.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {billing.usage.dmsLimit === -1 ? 'Unlimited' : `of ${billing.usage.dmsLimit.toLocaleString()} limit`}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reset Date</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Date(billing.usage.resetDate).getDate()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(billing.usage.resetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Usage</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {billing.usage.dmsLimit === -1 ? '∞' : `${Math.round((billing.usage.dmsUsed / billing.usage.dmsLimit) * 100)}%`}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: billing.usage.dmsLimit === -1 ? '100%' : `${Math.min((billing.usage.dmsUsed / billing.usage.dmsLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Plan Info */}
            {currentPlan === 'tezdm pro' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Crown className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100">
                        You're on TezDM Pro! 🎉
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Enjoy unlimited DMs and all premium features
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 dark:text-green-400">Next billing</p>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {billing.nextBilling ? new Date(billing.nextBilling).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Billing History */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Billing History
              </h2>
            </div>
            
            {billing.billingHistory.length > 0 ? (
              <div className="space-y-4">
                {billing.billingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {invoice.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {invoice.amount}
                      </span>
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No billing history
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your billing history will appear here once you upgrade to a paid plan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Available Plans
            </h2>
            
            <div className="space-y-4">
              {plans.map((plan) => {
                const isCurrentPlan = currentPlan === plan.name.toLowerCase();
                
                return (
                  <div
                    key={plan.name}
                    className={`relative p-4 border-2 rounded-lg transition-all duration-200 ${
                      isCurrentPlan
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {plan.badge}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPlanColor(plan.name)}`}>
                        {getPlanIcon(plan.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.price}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-full">
                        Current Plan
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Upgrade Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {selectedPlan === 'Free' ? 'Downgrade' : 'Upgrade'} to {selectedPlan}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedPlan === 'Free' 
                ? 'Are you sure you want to downgrade to the Free plan? You will lose access to premium features.'
                : `Upgrade to ${selectedPlan} plan to unlock more features and higher limits.`
              }
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpgrade(selectedPlan)}
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                ) : (
                  selectedPlan === 'Free' ? 'Downgrade' : 'Upgrade'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanBillingPage; 