import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, Zap } from 'lucide-react';
import { authApi } from '../services/authApi';

/**
 * Reset Password page component
 * @returns Reset password page component
 */
const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [isValidLink, setIsValidLink] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { otpToken, email, hmacSignature } = useParams<{
    otpToken: string;
    email: string;
    hmacSignature: string;
  }>();

  /**
   * Validate URL parameters on component mount
   */
  useEffect(() => {
    if (!otpToken || !email || !hmacSignature) {
      setError('Invalid reset link. Please request a new password reset.');
      setIsValidLink(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format in reset link.');
      setIsValidLink(false);
      return;
    }

    setIsValidLink(true);
  }, [otpToken, email, hmacSignature]);

  /**
   * Validate password length
   */
  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    
    if (!isValidLink) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Validate password
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(
        password,
        confirmPassword,
        otpToken!,
        hmacSignature!,
        email!
      );
      setSuccess(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidLink && !success) {
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
          </div>

          {/* Error Card */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Invalid Reset Link
              </h2>
              <p className="text-gray-400 mb-6">
                {error || 'This password reset link is invalid or has expired.'}
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="btn-primary"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Reset your password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          {!success ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">
                  Reset Password
                </h2>
                <p className="text-gray-400">
                  Enter your new password for <span className="text-white font-medium">{email}</span>
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Password must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Reset password button */}
                <button
                  type="submit"
                  disabled={isLoading || !validatePassword(password) || password !== confirmPassword}
                  className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Reset Password
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Password Reset Successfully
              </h2>
              <p className="text-gray-400 mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 