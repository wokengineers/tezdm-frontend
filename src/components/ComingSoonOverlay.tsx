import React from 'react';
import { Clock, Zap, BarChart3, CreditCard } from 'lucide-react';

interface ComingSoonOverlayProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({ 
  title, 
  description, 
  icon: Icon = Clock,
  children 
}) => {
  return (
    <div className="relative">
      {/* Background Content with Blur */}
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center max-w-md mx-4">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-white" />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {title}
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {description}
          </p>
          
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium">
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon
          </div>
          
          {/* Additional Info */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            We're working hard to bring you this feature. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonOverlay; 