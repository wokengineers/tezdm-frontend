import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray' | 'red' | 'green';
  className?: string;
}

/**
 * Generic loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
    red: 'border-red-400 border-t-transparent',
    green: 'border-green-500 border-t-transparent'
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-2 rounded-full animate-spin ${colorClasses[color]} ${className}`}
    />
  );
};

export default LoadingSpinner; 