// API Configurations
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.stage.wokengineers.com/v1',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/ums/auth/email_password_authentication/login/',
      SIGNUP: '/ums/auth/email_password_authentication/signup/',
      REFRESH_TOKEN: '/ums/auth/refresh_token',
      SIGNOUT: '/ums/auth/signout',
    },
    GROUPS: '/ums/groups/',
    GROUP_MEMBERSHIPS: '/ums/group-memberships/',
  },
};

// Environment
export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_STAGING: process.env.REACT_APP_ENVIRONMENT === 'staging',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// Production optimizations
export const PRODUCTION_CONFIG = {
  ENABLE_DEBUG_LOGS: process.env.REACT_APP_ENABLE_DEBUG_MODE === 'true',
  ENABLE_SECURITY_LOGGING: process.env.REACT_APP_ENABLE_SECURITY_LOGGING === 'true',
  TOKEN_REFRESH_THRESHOLD: parseInt(process.env.REACT_APP_TOKEN_REFRESH_THRESHOLD || '300000'),
  MAX_DATA_AGE: parseInt(process.env.REACT_APP_MAX_DATA_AGE || '86400000'),
}; 