import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingButtonProps {
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spinnerColor?: 'primary' | 'white' | 'gray' | 'red' | 'green';
}

/**
 * Generic loading button component
 */
const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  loadingText,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  spinnerSize = 'sm',
  spinnerColor = 'white'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledClasses = (loading || disabled) ? 'opacity-50 cursor-not-allowed' : '';

  const handleClick = async () => {
    if (loading || disabled) return;
    
    try {
      await onClick();
    } catch (error) {
      console.error('Button action failed:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {loading && (
        <LoadingSpinner 
          size={spinnerSize} 
          color={spinnerColor} 
          className="mr-2" 
        />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};

export default LoadingButton; 