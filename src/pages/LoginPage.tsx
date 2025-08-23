import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Email/Password Login page component
 * @returns Login page component
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>('');
  
  const { login, error: authError, isLoading: authLoading } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for OAuth success message
  const oauthMessage = location.state?.message;

  // Sync loading state with auth context
  useEffect(() => {
    setIsLoading(authLoading);
  }, [authLoading]);

  // Restore form data on component mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('login_form_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setEmail(data.email || '');
        setPassword(data.password || '');
      } catch (error) {
        console.error('Error restoring login form data:', error);
      }
    }
  }, []);

  // Preserve form data when fields change
  useEffect(() => {
    if (email || password) {
      sessionStorage.setItem('login_form_data', JSON.stringify({
        email,
        password
      }));
    }
  }, [email, password]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      // Ensure form data is preserved - don't clear any form fields
      console.log('Auth error occurred, preserving login form data:', { email, password: password ? '[REDACTED]' : '' });
    }
  }, [authError, email, password]);

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
    setLocalError('');
    
    // Validate email
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!password.trim()) {
      setLocalError('Please enter your password');
      return;
    }

    if (!validatePassword(password)) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    const success = await login(email, password);
    if (success) {
      // Clear saved form data on successful login
      sessionStorage.removeItem('login_form_data');
      navigate('/dashboard');
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
              Welcome back
            </h2>
            <p className="text-gray-400">
              Sign in to your account to continue
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

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
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
            </div>

            {/* Error message */}
            {localError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-400">{localError}</p>
              </div>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>



          {/* Sign up link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
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
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 