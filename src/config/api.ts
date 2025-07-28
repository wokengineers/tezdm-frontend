// API Configurations
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.stage.wokengineers.com/v1',
  ENDPOINTS: {
    AUTH: {
      OTP_AUTHENTICATION: '/ums/auth/otp_authentication',
      REFRESH_TOKEN: '/ums/auth/refresh_token',
      SIGNOUT: '/ums/auth/signout',
    },
    GROUPS: '/ums/groups/',
  },
};

// Environment
export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_STAGING: process.env.REACT_APP_ENVIRONMENT === 'staging',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
}; 