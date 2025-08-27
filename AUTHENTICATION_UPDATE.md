# Authentication System Update

## Overview
The authentication system has been updated from OTP-based authentication to email/password authentication while maintaining the same security standards and user experience.

## Changes Made

### 1. API Endpoints Updated
- **Old**: `/ums/auth/otp_authentication` (OTP generation and validation)
- **New**: 
  - `/ums/auth/email_password_authentication/login/` (Login)
  - `/ums/auth/email_password_authentication/signup/` (Signup)
  - `/ums/auth/email_password_authentication/forgot_password/` (Forgot password)
  - `/ums/auth/email_password_authentication/reset_password/` (Reset password)
  - `/ums/group-memberships/?group={groupId}` (Get user information)

### 2. Authentication Flow Changes

#### Before (OTP-based):
1. User enters email
2. System generates OTP and sends to email
3. User enters 6-digit OTP
4. System validates OTP and authenticates user

#### After (Email/Password-based):
1. **Signup Flow**:
   - User enters name, email, and password
   - System creates account
   - User is redirected to login page
2. **Login Flow**:
   - User enters email and password
   - System validates credentials and gets initial tokens
   - System fetches user groups
   - System refreshes token with first group
   - System fetches user information from group memberships
   - System creates user object with actual name from API
   - Same token management and group handling as before
3. **Forgot Password Flow**:
   - User enters email on forgot password page
   - System sends reset link to email
   - User clicks link with format: `/forgot-password/{otpToken}/{email}/{hmacSignature}`
   - User enters new password and confirms
   - System resets password and redirects to login

### 3. API Payload Changes

#### Login Request:
```json
{
  "credential": "user@example.com",
  "password": "userpassword",
  "confirm_password": "userpassword"
}
```

#### Signup Request:
```json
{
  "credential": "user@example.com",
  "password": "userpassword",
  "name": "User Name"
}
```

#### Response (same as before):
```json
{
  "status": 1,
  "message": "Success",
  "data": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### Group Memberships Response:
```json
{
  "status": 1,
  "message": "Success",
  "data": [
    {
      "id": 10,
      "user": "string1@gmail.com",
      "group": {
        "id": 20,
        "name": "tezdm"
      },
      "role": "super_admin",
      "permissions": [
        "super_admin_group"
      ],
      "user_name": "string"
    }
  ]
}
```

#### Forgot Password Request:
```json
{
  "credential": "user@example.com"
}
```

#### Forgot Password Response:
```json
{
  "status": 1,
  "message": "Success"
}
```

#### Reset Password Request:
```json
{
  "password": "newpassword",
  "confirm_password": "newpassword",
  "otp_token": "080293",
  "hmac_signature_b64": "MiNb3u51Mug3a4YforbII7Wy7oUcN2dyjRHHJRL0v7c=",
  "credential": "user@example.com"
}
```

#### Reset Password Response:
```json
{
  "status": 1,
  "message": "Success"
}
```

### 4. Validation Requirements

#### Email Validation:
- Must be a valid email format
- Required field

#### Password Validation:
- Minimum 8 characters
- Required field

#### Signup Additional Requirements:
- Full name required
- Password confirmation must match
- Terms of service agreement required

### 5. Security Features Maintained

- **Encrypted Token Storage**: Tokens are encrypted before storing in localStorage
- **Data Integrity Checks**: Checksums and version validation prevent tampering
- **Token Expiry Management**: Automatic validation of token expiration
- **Group-based Access**: Multi-group support with automatic group selection
- **Comprehensive Logout**: Server-side token invalidation and local data clearing

### 6. User Experience Improvements

- **Simplified Flow**: Single-step login instead of two-step OTP process
- **Better Error Handling**: Clear validation messages for each field
- **Consistent UI**: Same design language across login and signup pages
- **Loading States**: Visual feedback during authentication process
- **Clean Signup Flow**: Signup redirects to login page for explicit authentication

### 7. Files Modified

#### Core Authentication:
- `src/config/api.ts` - Updated API endpoints
- `src/services/authApi.ts` - New login/signup methods and group memberships API
- `src/contexts/AuthContext.tsx` - Removed OTP logic, added email/password authentication with user info fetching

#### UI Components:
- `src/pages/LoginPage.tsx` - Complete rewrite for email/password
- `src/pages/SignupPage.tsx` - Updated validation and API integration
- `src/pages/ForgotPasswordPage.tsx` - New forgot password page
- `src/pages/ResetPasswordPage.tsx` - New reset password page with URL parameters
- `src/App.tsx` - Added routes for forgot password pages

#### Documentation:
- `README.md` - Updated authentication section
- `AUTHENTICATION_UPDATE.md` - This file

### 8. Backward Compatibility

The changes are not backward compatible with the OTP system. Users will need to:
1. Create new accounts using the signup page
2. Use email/password combination for login
3. Existing OTP-based sessions will be cleared

### 9. Testing

To test the new authentication system:

1. **Signup Flow**:
   - Navigate to `/signup`
   - Fill in name, email, and password (min 8 chars)
   - Agree to terms
   - Should redirect to login page on success

2. **Login Flow**:
   - Navigate to `/login`
   - Enter email and password
   - Should redirect to dashboard on success

3. **Validation**:
   - Try invalid email formats
   - Try passwords shorter than 8 characters
   - Try mismatched passwords in signup
   - All should show appropriate error messages

### 10. Environment Variables

Make sure these environment variables are set:
```env
REACT_APP_API_BASE_URL=https://api.stage.wokengineers.com/v1
REACT_APP_ENCRYPTION_KEY=your-secure-encryption-key
REACT_APP_ENABLE_SECURITY_LOGGING=true
```

## Benefits of the Change

1. **Improved UX**: Faster login process without waiting for OTP
2. **Better Security**: Password-based authentication with encryption
3. **Standard Practice**: Follows industry-standard authentication patterns
4. **Reduced Complexity**: Simpler API integration and error handling
5. **Better Accessibility**: No dependency on email delivery for login

## Migration Notes

- All existing OTP-related code has been removed
- Token management and security features remain unchanged
- Group-based access control is preserved
- The same mock data structure is maintained for development 