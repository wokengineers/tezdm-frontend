import React from 'react';

const AdminPanelPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Platform administration and management
        </p>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👨‍💼</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Admin Panel Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Administrative features will be available here for admin users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage; 