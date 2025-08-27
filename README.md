# TezDM - Instagram Automation Platform

A modern, scalable React-based frontend for an Instagram Automation Platform that allows users to set up workflows for Instagram interactions like auto-DM on comments, keyword-triggered messaging, and more.

## 🚀 Features

### Core Functionality
- **Instagram Automation**: Auto-reply to comments, DMs, and story replies
- **Keyword Triggers**: Set up automation based on specific keywords
- **Multi-Account Support**: Manage multiple Instagram accounts
- **Analytics Dashboard**: Track performance metrics and engagement rates
- **Rate Limit Management**: Built-in rate limiting to comply with Instagram guidelines
- **Webhook Integrations**: Connect with external systems and CRMs

### User Experience
- **Modern UI/UX**: Clean, professional interface with Tailwind CSS
- **Dark/Light Mode**: Full theme support with smooth transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Live activity monitoring and status updates
- **Intuitive Navigation**: Easy-to-use sidebar navigation with collapsible design
- **Account Switcher**: Dedicated panel for managing multiple social accounts

### Scalability
- **Multi-Platform Ready**: Architecture designed to support Facebook, WhatsApp, LinkedIn
- **Modular Components**: Reusable components for easy feature expansion
- **TypeScript**: Full type safety and better development experience
- **Context API**: Efficient state management with React Context

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Build Tool**: Create React App
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tezdm_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

5. **Login with your credentials**
   - Use your email and password to sign in
   - Or create a new account using the signup page

## 🎨 Design System

### Colors
- **Primary Gradient**: `#3B82F6` → `#8b5cf6`
- **Background**: Light gray (`#f9fafb`) / Dark gray (`#111827`)
- **Text**: Dark gray (`#111827`) / Light gray (`#f9fafb`)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weight**: 600 for headings and buttons
- **Professional**: Clear, readable text with proper hierarchy

### Components
- **Buttons**: Rounded (`border-radius: 9999px`) with gradient backgrounds
- **Cards**: Clean white/dark cards with subtle shadows
- **Transitions**: Smooth `cubic-bezier(0.4, 0, 0.2, 1)` with 0.2s duration

## 📱 Pages & Features

### Authentication
- **Login Page**: Email/password authentication with secure token management
- **Signup Page**: User registration with email validation and password requirements (minimum 8 characters)
- **Forgot Password**: Email-based password reset with secure token validation
- **Reset Password**: Secure password reset with URL parameters and HMAC signature
- **Protected Routes**: Secure access to authenticated features
- **Token Management**: Encrypted token storage with automatic refresh
- **Group-based Access**: Multi-group support with automatic group selection
- **User Information**: Automatic fetching of user name and role from group memberships


### Onboarding
- **Step-by-step Guide**: Welcome, how it works, plan selection, account connection
- **Interactive Progress**: Visual progress indicator and step navigation
- **Plan Selection**: Free vs Pro plan comparison

### Dashboard
- **Overview Stats**: Total DMs, open rate, active automations, failed DMs
- **Quick Actions**: Create automation, view analytics, connect accounts
- **Recent Activity**: Latest automation executions and status
- **Top Performing**: Best performing automation with metrics

### Account Management
- **Connect Accounts**: Instagram Business account connection via OAuth

### Automation Management
- **Automation List**: View and manage all automations with real-time API integration
- **Search & Filter**: Debounced search with status and type filtering
- **Toggle Status**: Activate/deactivate automations with API calls
- **Duplicate/Delete**: Full CRUD operations for automations
- **Real-time Updates**: Live status updates and error handling
- **Multi-Platform**: Support for Facebook (active), WhatsApp, LinkedIn (coming soon)
- **Account Status**: Connection status and management options
- **Account Switcher**: Easy switching between multiple connected accounts
- **Connected Accounts Required**: Users must connect Instagram accounts before creating automations

### Automation
- **Automation List**: View all automation rules with edit/delete options
- **Automation Builder**: Step-by-step workflow creation with platform/trigger selection
- **Trigger Types**: Comments, story replies, follows, messages
- **Reply Types**: Direct messages, webhooks, public replies
- **Workflow Steps**: Configurable action steps for each trigger type

### Analytics & Monitoring
- **Performance Metrics**: DM statistics, engagement rates, growth trends
- **Activity Log**: Detailed history of automation executions
- **Real-time Monitoring**: Live status updates and error tracking

### Settings & Billing
- **User Preferences**: Theme toggle, notification settings, privacy controls
- **Plan Management**: Single TezDM Pro plan (₹499/month, unlimited DMs)
- **Billing History**: Payment history and invoice management
- **Account Management**: Profile information and password changes

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── constants/          # API endpoints and mock data
├── pages/              # Page components
├── utils/              # Utility functions
├── App.tsx            # Main app component
├── index.tsx          # Entry point
└── index.css          # Global styles
```

### Key Components
- **Layout**: Main layout with sidebar navigation
- **ProtectedRoute**: Authentication guard component
- **ThemeProvider**: Dark/light mode management
- **AuthProvider**: User authentication state

### Mock Data
The application uses mock data for development:
- User profiles and connected accounts
- Automation rules and configurations with detailed triggers and steps
- Analytics and performance metrics with realistic data
- Activity logs and billing information
- Platform configurations for Instagram, Facebook, WhatsApp, LinkedIn

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create a `.env` file for environment-specific configuration:
```env
REACT_APP_API_BASE_URL=https://api.stage.wokengineers.com/v1
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
REACT_APP_META_APP_ID=your-meta-app-id
REACT_APP_ENCRYPTION_KEY=your-encryption-key
REACT_APP_ENABLE_SECURITY_LOGGING=true
REACT_APP_TOKEN_REFRESH_THRESHOLD=300000
REACT_APP_MAX_DATA_AGE=86400000
```

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔮 Future Enhancements

### Planned Features
- **Advanced Automation Builder**: Visual workflow editor with drag-and-drop
- **AI-Powered Responses**: Smart reply suggestions and content generation
- **Advanced Analytics**: Detailed performance insights and custom reports
- **Team Collaboration**: Multi-user account management and role-based access
- **API Integration**: Webhook and third-party integrations (Zapier, n8n, etc.)
- **Mobile App**: React Native mobile application
- **Real-time Notifications**: Push notifications for automation events

### Platform Expansion
- **Facebook**: Comment and message automation
- **WhatsApp**: Business message automation
- **LinkedIn**: Professional networking automation
- **Twitter**: Tweet and DM automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@tezdm.com
- Documentation: [docs.tezdm.com](https://docs.tezdm.com)
- Community: [community.tezdm.com](https://community.tezdm.com)

---

**Built with ❤️ for Instagram automation enthusiasts** 