# OTP-Based Authentication Setup

## Overview

The TezDM frontend now uses OTP-based authentication instead of traditional email/password login. This provides better security and eliminates the need for password management.

## Authentication Flow

### 1. Email Input
- User enters their email address
- Clicks "Generate OTP" button
- System calls the OTP generation API

### 2. OTP Validation
- User receives 6-digit OTP via email
- User enters the OTP code
- System validates OTP and retrieves initial tokens

### 3. Group Selection
- System automatically fetches user groups
- Selects the first available group
- Refreshes token with group permissions

### 4. Authentication Complete
- User is logged in and redirected to dashboard
- Access and refresh tokens are stored in localStorage
- Group ID is stored for signout functionality

### 5. Signout Process
- User clicks logout button
- System calls signout API with refresh token and group ID
- All local data is cleared (tokens, user data, group ID)
- User is redirected to login page

## Route Protection

### Public Routes (Login/Signup)
- **Unauthenticated users**: Can access login and signup pages
- **Authenticated users**: Automatically redirected to dashboard
- **Purpose**: Prevents logged-in users from accessing auth pages

### Protected Routes (Dashboard, Settings, etc.)
- **Unauthenticated users**: Automatically redirected to login page
- **Authenticated users**: Can access all protected pages
- **Purpose**: Ensures only authenticated users access app features

## API Endpoints

### Base URL
```
https://api.stage.wokengineers.com/v1
```

### Authentication Endpoints
- **Generate OTP**: `POST /ums/auth/otp_authentication`
- **Validate OTP**: `POST /ums/auth/otp_authentication`
- **Get Groups**: `GET /ums/groups/`
- **Refresh Token**: `POST /ums/auth/refresh_token`
- **Signout**: `POST /ums/auth/signout`

### Profile OAuth Endpoints
- **Get Platforms**: `GET /profile/oauth/`
- **Get OAuth URL**: `GET /profile/oauth/{platform_id}/?group_id={group_id}`
- **Complete OAuth**: `POST /profile/oauth/auth_redirection/`

### Profile Management Endpoints
- **Get Connected Accounts**: `GET /profile/manage/listing/?group_id={group_id}&page={page}`
- **Delete Connected Account**: `DELETE /profile/manage/listing/{account_id}/?group_id={group_id}`

### OAuth Flow
1. **Get available platforms** → Single API call to `/profile/oauth/`
2. **User clicks platform** → API call to `/profile/oauth/{id}/?group_id={group_id}` to get OAuth URL
3. **Show popup modal** → Display QR code and direct redirect options
4. **User authorization** → Redirect to platform OAuth URL
5. **Complete connection** → Platform redirects back with code/state → `/profile/oauth/auth_redirection/`

## Environment Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=https://api.stage.wokengineers.com/v1
REACT_APP_ENVIRONMENT=staging
```

## Implementation Details

### Files Modified/Created
- `src/services/authApi.ts` - API service layer
- `src/contexts/AuthContext.tsx` - Authentication context with OTP methods
- `src/pages/LoginPage.tsx` - New OTP-based login UI
- `src/config/api.ts` - API configuration
- `src/components/Layout.tsx` - Updated to use new signout method and removed account switcher
- `src/components/PublicRoute.tsx` - Guards public routes from authenticated users
- `src/App.tsx` - Updated routing with PublicRoute protection
- `src/services/profileApi.ts` - Profile OAuth API service
- `src/pages/ConnectAccountsPage.tsx` - Social account connection page
- `src/pages/OAuthRedirectPage.tsx` - OAuth redirect handler

### Key Features
- **Multi-step UI**: Email → OTP → Success
- **Error Handling**: Comprehensive error messages
- **Loading States**: Visual feedback during API calls
- **Token Management**: Automatic token storage and refresh
- **Type Safety**: Full TypeScript support
- **Route Protection**: Public and protected route guards
- **Smart Redirects**: Authenticated users can't access login page
- **Simplified UI**: Single Instagram account support (Phase 1)
- **Social Profile Integration**: Instagram connection status in header menu
- **Easy Account Management**: Connected Accounts in navigation sidebar with status indicators
- **OAuth Integration**: Complete social platform connection flow
- **QR Code Support**: Mobile-friendly connection options with real QR code generation
- **Smart Redirects**: Context-aware post-connection navigation
- **Modal Navigation**: Easy return to platform selection from OAuth modal
- **Connected Accounts Management**: View, monitor, and delete connected social accounts
- **Account Status Tracking**: Real-time status monitoring (Connected/Reconnect Required)

## Testing

### Development Testing
1. Start the development server: `npm start`
2. Navigate to `/login`
3. Enter any valid email format
4. Use the OTP received via email
5. Verify successful login and redirect

### API Testing
- All API calls follow the `{status, message, data}` response format
- Status `1` indicates success, any other value indicates error
- Error messages are displayed to users

## Error Scenarios

- **Invalid Email**: Shows validation error
- **OTP Generation Failed**: Shows API error message
- **Invalid OTP**: Shows validation error
- **No Groups**: Shows "No groups found" error
- **Network Error**: Shows connection error message
- **Signout Failed**: Continues with local logout even if API fails

## Security Features

- OTP expires after a set time
- Tokens are stored securely in localStorage
- Automatic token refresh with group permissions
- No password storage or transmission 