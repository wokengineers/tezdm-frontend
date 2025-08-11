import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, MessageSquare, Eye, EyeOff, Zap, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * OTP-based Login page component
 * @returns Login page component
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>('');
  
  const { 
    generateOtp, 
    validateOtp, 
    otpStep, 
    currentEmail, 
    error: authError, 
    isLoading: authLoading 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for OAuth success message
  const oauthMessage = location.state?.message;

  // Sync loading state with auth context
  useEffect(() => {
    setIsLoading(authLoading);
  }, [authLoading]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  // Navigate to dashboard on successful authentication
  useEffect(() => {
    if (otpStep === 'success') {
      navigate('/dashboard');
    }
  }, [otpStep, navigate]);

  /**
   * Handle email submission and OTP generation
   */
  const handleEmailSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLocalError('');
    
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    const success = await generateOtp(email);
    if (!success) {
      setLocalError('Failed to generate OTP. Please try again.');
    }
  };

  /**
   * Handle OTP validation
   */
  const handleOtpSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLocalError('');
    
    if (!otp.trim() || otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP');
      return;
    }

    const success = await validateOtp(currentEmail || email, otp);
    if (!success) {
      setLocalError('Invalid OTP. Please try again.');
    }
  };

  /**
   * Go back to email step
   */
  const handleBackToEmail = (): void => {
    setOtp('');
    setLocalError('');
    // Reset auth context step
    window.location.reload(); // Simple way to reset the flow
  };

  /**
   * Resend OTP
   */
  const handleResendOtp = async (): Promise<void> => {
    setLocalError('');
    const success = await generateOtp(currentEmail || email);
    if (!success) {
      setLocalError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold gradient-text">
            TezDM
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Automate your Instagram engagement
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              {otpStep === 'email' ? 'Welcome back' : 'Enter OTP'}
            </h2>
            <p className="text-gray-400">
              {otpStep === 'email' 
                ? 'Sign in to your account to continue' 
                : `We've sent a 6-digit code to ${currentEmail}`
              }
            </p>
          </div>

          {/* OAuth Success Message */}
          {oauthMessage && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-400">{oauthMessage}</p>
              </div>
            </div>
          )}

          {/* Email Step */}
          {otpStep === 'email' && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Error message */}
              {localError && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-400">{localError}</p>
                </div>
              )}

              {/* Generate OTP button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Generate OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {otpStep === 'otp' && (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              {/* OTP field */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                  OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type={showOtp ? 'text' : 'password'}
                    autoComplete="one-time-code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                    placeholder="000000"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowOtp(!showOtp)}
                  >
                    {showOtp ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {/* Error message */}
              {localError && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-400">{localError}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Verify OTP
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Email
                </button>
              </div>
            </form>
          )}

          {/* Loading Step */}
          {otpStep === 'loading' && (
            <div className="text-center space-y-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-400">
                {currentEmail ? 'Verifying OTP...' : 'Generating OTP...'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-primary-400 hover:text-primary-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-400 hover:text-primary-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 