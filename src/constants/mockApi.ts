/**
 * API endpoints for the Instagram Automation Platform
 */
export const endpoints = {
  login: '/api/auth/login',
  signup: '/api/auth/signup',
  getUser: '/api/user',
  getAutomations: '/api/automations',
  createAutomation: '/api/automations/create',
  updateAutomation: '/api/automations/:id',
  deleteAutomation: '/api/automations/:id',
  getStats: '/api/analytics',
  webhook: '/api/webhook',
  plans: '/api/plans',
  connectInstagram: '/api/accounts/instagram',
  connectFacebook: '/api/accounts/facebook',
  connectWhatsApp: '/api/accounts/whatsapp',
  disconnectAccount: '/api/accounts/:id/disconnect',
  getActivityLog: '/api/activity',
  updateSettings: '/api/settings',
  getBilling: '/api/billing',
  upgradePlan: '/api/billing/upgrade',
};

/**
 * Account interface
 */
export interface Account {
  id: string;
  platform: string;
  username: string;
  avatar?: string;
  isActive: boolean;
  isPrimary: boolean;
}

/**
 * Platform interface
 */
export interface Platform {
  name: string;
  color: string;
  status: 'active' | 'coming_soon' | 'planned';
  features: string[];
}

/**
 * Billing history item interface
 */
export interface BillingHistoryItem {
  id: string;
  description: string;
  amount: string;
  date: string;
  status: 'paid' | 'pending' | 'failed';
}

/**
 * Automation interface
 */
export interface Automation {
  id: string;
  name: string;
  platform: string;
  trigger: string;
  status: 'active' | 'draft' | 'paused';
  accountId: string;
  createdAt: string;
  updatedAt: string;
  config: any;
  stats: {
    triggered: number;
    sent: number;
    failed: number;
    lastTriggered: string | null;
  };
}

/**
 * Mock data for development and testing
 */
export const mockData = {
  user: {
    id: "user1",
    name: "Lakshit Ukani",
    email: "lakshit@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    connectedAccounts: [
      { 
        id: "acc1", 
        platform: "instagram", 
        username: "@lakshit.insta", 
        isPrimary: true,
        avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=40&h=40&fit=crop&crop=face",
        status: "connected"
      },
      { 
        id: "acc2", 
        platform: "instagram", 
        username: "@lakshit.brand", 
        isPrimary: false,
        avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=40&h=40&fit=crop&crop=face",
        status: "connected"
      }
    ],
    plan: "free",
    notifications: true,
    createdAt: "2024-01-15T10:30:00Z",
    lastLogin: "2024-01-20T14:22:00Z"
  },
  // Connected accounts data for account switcher and connect accounts page
  connectedAccounts: [
    {
      id: 'acc1',
      platform: 'instagram',
      username: '@lakshit.insta',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      isActive: true,
      isPrimary: true
    },
    {
      id: 'acc2',
      platform: 'instagram',
      username: '@lakshit.brand',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      isActive: true,
      isPrimary: false
    },
    {
      id: 'acc3',
      platform: 'instagram',
      username: '@tezdm.official',
      avatar: undefined, // No avatar to test fallback
      isActive: false,
      isPrimary: false
    },
    {
      id: 'acc4',
      platform: 'facebook',
      username: '@tezdm.page',
      avatar: undefined,
      isActive: true,
      isPrimary: false
    }
  ],
  automations: [
    {
      id: "auto1",
      name: "Instagram Comment Reply",
      platform: "instagram",
      trigger: "comment",
      status: "active",
      accountId: "acc1",
      createdAt: "2024-01-18T09:15:00Z",
      updatedAt: "2024-01-20T14:30:00Z",
      config: {
        postSelection: "all_posts",
        selectedPosts: [],
        commentFilter: "all_comments",
        keywords: ["freebie", "giveaway", "discount"],
        replyMessages: [
          "Thanks for commenting! Check your DM 😎",
          "Awesome comment! We've sent you something special 💝",
          "Love your energy! Check your messages 🎉"
        ],
        dmMessage: "Hey! Thanks for engaging with our content. Here's your exclusive offer: [LINK]",
        dmButton: {
          text: "Get Offer",
          url: "https://example.com/offer"
        },
        webhook: {
          enabled: false,
          url: "",
          events: ["comment_received", "dm_sent"]
        }
      },
      stats: {
        triggered: 45,
        sent: 42,
        failed: 3,
        lastTriggered: "2024-01-20T14:30:00Z"
      }
    },
    {
      id: "auto2",
      name: "Instagram Story Reply",
      platform: "instagram",
      trigger: "story_reply",
      status: "active",
      accountId: "acc1",
      createdAt: "2024-01-19T11:30:00Z",
      updatedAt: "2024-01-20T12:15:00Z",
      config: {
        storyFilter: "all_stories",
        replyMessages: [
          "Thanks for the story reply! Here's your exclusive content 🎁",
          "Love your reaction! Check your DM for something special ✨",
          "Amazing! We've sent you a surprise in your messages 🎯"
        ],
        dmMessage: "Hey there! Thanks for engaging with our story. Here's your exclusive content: [CONTENT_LINK]",
        dmButton: {
          text: "View Content",
          url: "https://example.com/content"
        },
        webhook: {
          enabled: true,
          url: "https://api.example.com/webhook",
          events: ["story_reply_received", "dm_sent"]
        }
      },
      stats: {
        triggered: 23,
        sent: 21,
        failed: 2,
        lastTriggered: "2024-01-20T12:15:00Z"
      }
    },
    {
      id: "auto3",
      name: "Instagram Follow Welcome",
      platform: "instagram",
      trigger: "follow",
      status: "draft",
      accountId: "acc2",
      createdAt: "2024-01-20T08:45:00Z",
      updatedAt: "2024-01-20T08:45:00Z",
      config: {
        dmMessage: "Welcome! Thanks for following us 🙏 We're excited to have you here!",
        dmButton: {
          text: "Learn More",
          url: "https://example.com/welcome"
        },
        webhook: {
          enabled: false,
          url: "",
          events: ["follow_received", "dm_sent"]
        }
      },
      stats: {
        triggered: 12,
        sent: 10,
        failed: 2,
        lastTriggered: "2024-01-20T10:30:00Z"
      }
    },
    {
      id: "auto4",
      name: "Instagram Comment Reply (2)",
      platform: "instagram",
      trigger: "comment",
      status: "draft",
      accountId: "acc1",
      createdAt: "2024-01-21T10:00:00Z",
      updatedAt: "2024-01-21T10:00:00Z",
      config: {
        postSelection: "single_post",
        selectedPosts: ["post_123"],
        commentFilter: "keyword_based",
        keywords: ["question", "help", "support"],
        replyMessages: [
          "Great question! We've sent you detailed info in DM 📚",
          "Thanks for asking! Check your messages for the answer 💡"
        ],
        dmMessage: "Hi! Thanks for your question. Here's the detailed answer: [ANSWER]",
        dmButton: {
          text: "Read More",
          url: "https://example.com/help"
        },
        webhook: {
          enabled: false,
          url: "",
          events: ["comment_received", "dm_sent"]
        }
      },
      stats: {
        triggered: 0,
        sent: 0,
        failed: 0,
        lastTriggered: null
      }
    }
  ],
  analytics: {
    totalDMs: 1430,
    openRate: "42%",
    ctr: "18%",
    failedDMs: 12,
    totalAutomations: 3,
    activeAutomations: 2,
    monthlyGrowth: "+15%",
    topPerformingAutomation: "Freebie Comment Reply",
    platformBreakdown: {
      instagram: 1430,
      facebook: 0,
      whatsapp: 0
    },
    dailyStats: [
      { date: "2024-01-15", dms: 45, opens: 19 },
      { date: "2024-01-16", dms: 52, opens: 22 },
      { date: "2024-01-17", dms: 38, opens: 16 },
      { date: "2024-01-18", dms: 61, opens: 26 },
      { date: "2024-01-19", dms: 48, opens: 20 },
      { date: "2024-01-20", dms: 55, opens: 23 }
    ]
  },
  plans: [
    { 
      name: "TezDM Pro", 
      dmsPerDay: -1, // -1 indicates unlimited
      price: "₹499/month",
      features: [
        "Unlimited DMs & Comments",
        "All automation features",
        "CRM & Analytics Dashboard",
        "Multi-account support",
        "Meta OAuth Connect"
      ],
      popular: true,
      badge: "All features included"
    }
  ],
  activityLog: [
    {
      id: "act1",
      type: "dm_sent",
      automation: "Freebie Comment Reply",
      account: "@lakshit.insta",
      message: "Thanks! Check your DM 😎",
      status: "success",
      timestamp: "2024-01-20T14:30:00Z"
    },
    {
      id: "act2",
      type: "dm_failed",
      automation: "Story Reply Automation",
      account: "@lakshit.insta",
      message: "Thanks for the story reply! Here's your exclusive content 🎁",
      status: "failed",
      error: "Rate limit exceeded",
      timestamp: "2024-01-20T14:25:00Z"
    },
    {
      id: "act3",
      type: "webhook_triggered",
      automation: "Follow Welcome DM",
      account: "@lakshit.brand",
      message: "Webhook sent to CRM",
      status: "success",
      timestamp: "2024-01-20T14:20:00Z"
    }
  ],
  billing: {
    currentPlan: "tezdm pro",
    nextBilling: "2024-02-01T00:00:00Z",
    billingHistory: [
      {
        id: "inv1",
        description: "TezDM Pro - January 2024",
        amount: "₹499.00",
        date: "2024-01-01T00:00:00Z",
        status: "paid"
      },
      {
        id: "inv2", 
        description: "TezDM Pro - December 2023",
        amount: "₹499.00",
        date: "2023-12-01T00:00:00Z",
        status: "paid"
      },
      {
        id: "inv3",
        description: "TezDM Pro - November 2023", 
        amount: "₹499.00",
        date: "2023-11-01T00:00:00Z",
        status: "paid"
      }
    ],
    usage: {
      dmsUsed: 1430,
      dmsLimit: -1, // -1 indicates unlimited
      resetDate: "2024-02-01T00:00:00Z"
    }
  }
};

/**
 * Platform configuration for scalability
 */
export const platforms: Record<string, Platform> = {
  instagram: {
    name: "Instagram",
    color: "#E4405F",
    status: "active",
    features: ["comments", "story_replies", "follows", "dms", "webhooks"]
  },
  facebook: {
    name: "Facebook",
    color: "#1877F2",
    status: "active",
    features: ["comments", "messages", "webhooks"]
  },
  whatsapp: {
    name: "WhatsApp",
    color: "#25D366",
    status: "coming_soon",
    features: ["messages", "webhooks"]
  },
  linkedin: {
    name: "LinkedIn",
    color: "#0A66C2",
    status: "planned",
    features: ["posts", "messages", "connections"]
  }
};

/**
 * Trigger types for automation
 */
export const triggerTypes = {
  comment: {
    name: "Comment",
    description: "Trigger when someone comments on your post",
    icon: "message-circle"
  },
  story_reply: {
    name: "Story Reply",
    description: "Trigger when someone replies to your story",
    icon: "image"
  },
  follow: {
    name: "Follow",
    description: "Trigger when someone follows your account",
    icon: "user-plus"
  },
  keyword: {
    name: "Keyword",
    description: "Trigger when specific keywords are mentioned",
    icon: "hash"
  }
};

/**
 * Reply types for automation
 */
export const replyTypes = {
  dm: {
    name: "Direct Message",
    description: "Send a private message to the user",
    icon: "message-square"
  },
  webhook: {
    name: "Webhook",
    description: "Send data to your external system",
    icon: "webhook"
  },
  public_reply: {
    name: "Public Reply",
    description: "Reply publicly to the comment",
    icon: "message-circle"
  }
};

/**
 * Trigger step interface
 */
export interface TriggerStep {
  id: string;
  name: string;
  description: string;
  type: string;
  options?: any;
}

/**
 * Trigger interface
 */
export interface Trigger {
  name: string;
  description: string;
  icon: string;
  steps: TriggerStep[];
}

/**
 * Platform interface for automation
 */
export interface AutomationPlatform {
  name: string;
  icon: string;
  color: string;
  triggers: Record<string, Trigger>;
}

/**
 * Platform interface for connection
 */
export interface ConnectionPlatform {
  name: string;
  color: string;
  status: 'active' | 'coming_soon' | 'planned';
  features: string[];
}

/**
 * Automation configuration data
 */
export const automationConfig: {
  automationPlatforms: Record<string, AutomationPlatform>;
} = {
  automationPlatforms: {
    instagram: {
      name: "Instagram",
      icon: "instagram",
      color: "#E4405F",
      triggers: {
        comment: {
          name: "Post or Reel Comments",
          description: "User comments on your Post or Reel",
          icon: "message-circle",
          steps: [
            {
              id: "post_selection",
              name: "Post Selection",
              description: "Which posts should I monitor?",
              type: "dropdown",
              options: [
                { value: "all_posts", label: "All my posts" },
                { value: "single_post", label: "Single post" },
                { value: "multiple_posts", label: "Multiple posts" }
              ]
            },
            {
              id: "comment_filter",
              name: "Comment Filter",
              description: "When should I respond to comments?",
              type: "dropdown",
              options: [
                { value: "all_comments", label: "Every comment" },
                { value: "keyword_based", label: "Comments with keywords" },
                { value: "question_based", label: "Questions only" }
              ]
            },
            {
              id: "reply_message",
              name: "Reply to Comments",
              description: "Configure automatic replies to Instagram comments",
              type: "message_builder",
              options: {
                randomize: true,
                messages: [
                  "Thanks for commenting! Check your DM 😎",
                  "Awesome comment! We've sent you something special 💝",
                  "Love your energy! Check your messages 🎉"
                ]
              }
            },
            {
              id: "dm_message",
              name: "Welcome Message",
              description: "Configure the first message sent to users",
              type: "dm_builder",
              options: {
                message: "Hey! Thanks for engaging with our content. Here's your exclusive offer: [LINK]",
                button: {
                  text: "Get Offer",
                  url: "https://example.com/offer"
                }
              }
            },
            {
              id: "webhook",
              name: "Webhook Integration",
              description: "Send data to external services",
              type: "webhook_config",
              options: {
                enabled: false,
                url: "",
                events: ["comment_received", "dm_sent"]
              }
            }
          ]
        },
        story_reply: {
          name: "Story Reply",
          description: "User replies to your Story",
          icon: "image",
          steps: [
            {
              id: "story_filter",
              name: "Story Filter",
              description: "Which stories should I monitor?",
              type: "dropdown",
              options: [
                { value: "all_stories", label: "All my stories" },
                { value: "specific_stories", label: "Specific stories" }
              ]
            },
            {
              id: "reply_message",
              name: "Reply to Story",
              description: "Configure automatic replies to story replies",
              type: "message_builder",
              options: {
                randomize: true,
                messages: [
                  "Thanks for the story reply! Here's your exclusive content 🎁",
                  "Love your reaction! Check your DM for something special ✨",
                  "Amazing! We've sent you a surprise in your messages 🎯"
                ]
              }
            },
            {
              id: "dm_message",
              name: "Welcome Message",
              description: "Configure the first message sent to users",
              type: "dm_builder",
              options: {
                message: "Hey there! Thanks for engaging with our story. Here's your exclusive content: [CONTENT_LINK]",
                button: {
                  text: "View Content",
                  url: "https://example.com/content"
                }
              }
            },
            {
              id: "webhook",
              name: "Webhook Integration",
              description: "Send data to external services",
              type: "webhook_config",
              options: {
                enabled: false,
                url: "",
                events: ["story_reply_received", "dm_sent"]
              }
            }
          ]
        },
        follow: {
          name: "Follow",
          description: "User follows your account",
          icon: "user-plus",
          steps: [
            {
              id: "dm_message",
              name: "Welcome Message",
              description: "Configure the first message sent to users",
              type: "dm_builder",
              options: {
                message: "Welcome! Thanks for following us 🙏 We're excited to have you here!",
                button: {
                  text: "Learn More",
                  url: "https://example.com/welcome"
                }
              }
            },
            {
              id: "webhook",
              name: "Webhook Integration",
              description: "Send data to external services",
              type: "webhook_config",
              options: {
                enabled: false,
                url: "",
                events: ["follow_received", "dm_sent"]
              }
            }
          ]
        },
        message: {
          name: "Instagram Message",
          description: "User sends a message",
          icon: "message-square",
          steps: [
            {
              id: "message_filter",
              name: "Message Filter",
              description: "Which messages should I respond to?",
              type: "dropdown",
              options: [
                { value: "all_messages", label: "All messages" },
                { value: "keyword_based", label: "Messages with keywords" }
              ]
            },
            {
              id: "auto_reply",
              name: "Auto Reply",
              description: "Configure automatic replies to messages",
              type: "message_builder",
              options: {
                randomize: true,
                messages: [
                  "Thanks for your message! We'll get back to you soon 📱",
                  "Hi! Thanks for reaching out. We're here to help! 💬"
                ]
              }
            },
            {
              id: "webhook",
              name: "Webhook Integration",
              description: "Send data to external services",
              type: "webhook_config",
              options: {
                enabled: false,
                url: "",
                events: ["message_received", "reply_sent"]
              }
            }
          ]
        }
      }
    },
    facebook: {
      name: "Facebook",
      icon: "facebook",
      color: "#1877F2",
      triggers: {
        comment: {
          name: "Post Comments",
          description: "User comments on your Facebook post",
          icon: "message-circle",
          steps: []
        }
      }
    },
    whatsapp: {
      name: "WhatsApp",
      icon: "message-circle",
      color: "#25D366",
      triggers: {
        message: {
          name: "WhatsApp Message",
          description: "User sends a WhatsApp message",
          icon: "message-square",
          steps: []
        }
      }
    }
  }
}; 