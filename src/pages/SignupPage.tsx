import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Signup page component with AutoSocial design
 * @returns Signup page component
 */
const SignupPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Object with validation results
   */
  const validatePassword = (password: string): { isValid: boolean; checks: { hasLength: boolean; hasUppercase: boolean; hasLowercase: boolean; hasNumber: boolean; hasSpecial: boolean } } => {
    const checks = {
      hasLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    return {
      isValid: Object.values(checks).every(Boolean),
      checks,
    };
  };

  const passwordValidation = validatePassword(password);

  /**
   * Handle form submission
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(name, email, password);
      if (success) {
        navigate('/onboarding');
      } else {
        setError('An error occurred during signup. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
            Start automating your Instagram today
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              Create account
            </h2>
            <p className="text-gray-400">
              Get started with your free account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
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
                  placeholder="Create a password"
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
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <p className="text-xs font-medium text-gray-300 mb-2">
                    Password requirements:
                  </p>
                  <div className="space-y-1">
                    {Object.entries(passwordValidation.checks).map(([key, isValid]) => (
                      <div key={key} className="flex items-center text-xs">
                        <Check 
                          className={`w-3 h-3 mr-2 ${
                            isValid ? 'text-green-500' : 'text-gray-500'
                          }`} 
                        />
                        <span className={isValid ? 'text-green-400' : 'text-gray-500'}>
                          {key === 'hasLength' && 'At least 8 characters'}
                          {key === 'hasUppercase' && 'One uppercase letter'}
                          {key === 'hasLowercase' && 'One lowercase letter'}
                          {key === 'hasNumber' && 'One number'}
                          {key === 'hasSpecial' && 'One special character'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
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
                  placeholder="Confirm your password"
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

            {/* Terms and conditions */}
            <div className="flex items-start">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700 mt-1"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-300">
                I agree to the{' '}
                <a 
                  href="https://www.tezdm.com/terms-of-service/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary-400 hover:text-primary-300"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a 
                  href="https://www.tezdm.com/privacy-policy/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary-400 hover:text-primary-300"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Create account button */}
            <button
              type="submit"
              disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword || !agreeToTerms}
              className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Google sign up */}
          <button
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-bold text-gray-700">G</span>
            </div>
            Continue with Google
          </button>

          {/* Sign in link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 