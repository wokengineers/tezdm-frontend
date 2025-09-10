import { secureApi } from './secureApi';

// Type definitions
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface EventConfig {
  keywords?: string[];
  post_ids?: any;
  all_posts?: boolean;
  fuzzy_match_allowed?: boolean;
  fuzzy_match_percentage?: number;
  template?: string;
}

interface Event {
  id: number;
  event_type: string;
  event_category: string;
  event_config: EventConfig;
  previous_event_uuid: string | null;
  is_active: boolean;
  event_uuid: string;
}

interface Automation {
  id: number;
  name: string;
  is_active: boolean;
  events: Event[];
  profile_info_id: number;
  creation_date?: string;
  updation_date?: string;
}

interface AutomationFilters {
  search?: string;
  is_active?: boolean;
  event_category?: string;
  ordering?: string;
}

// New types for trigger-action configuration
interface TriggerActionConfig {
  [trigger: string]: string[][]; // Each trigger has an array of action groups
}

export interface InstagramPost {
  post_id: string;
  media_url: string;
  caption?: string;
  likes_count?: number;
  comments_count?: number;
  media_type?: string;
}

export interface PostsResponse {
  data: InstagramPost[];
  next_cursor?: string;
}

// Trigger and Action labels mapping
export const TRIGGER_LABELS: { [key: string]: string } = {
  'post_comment': 'Post Comment',
  'story_reply': 'Story Reply',
  'user_direct_message': 'User Direct Message'
};

export const ACTION_LABELS: { [key: string]: string } = {
  'reply_to_comment': 'Reply to Comment',
  'reply_to_comment_webhook': 'Reply to Comment (Webhook)',
  'send_dm': 'Send Direct Message',
  'send_dm_webhook': 'Send Direct Message (Webhook)',
  'reply_to_dm': 'Reply to Direct Message',
  'reply_to_dm_webhook': 'Reply to Direct Message (Webhook)',
  'ask_to_follow': 'Ask to Follow'
};

export const ACTION_DESCRIPTIONS: { [key: string]: string } = {
  'reply_to_comment': 'Reply directly to the comment on the post',
  'reply_to_comment_webhook': 'Send a webhook notification when replying to comment',
  'send_dm': 'Send a direct message to the user',
  'send_dm_webhook': 'Send a webhook notification when sending DM',
  'reply_to_dm': 'Reply to the user\'s direct message',
  'reply_to_dm_webhook': 'Send a webhook notification when replying to DM',
  'ask_to_follow': 'Encourage users to follow your account with a message and follow button'
};

/**
 * Automation API service
 */
export const automationApi = {
  /**
   * Make API request with automatic token refresh and security
   */
  async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return secureApi.makeRequest<T>(endpoint, options);
  },

  /**
   * Get trigger-action configuration
   */
          async getTriggerActionConfig(): Promise<ApiResponse<TriggerActionConfig>> {
          return this.makeRequest<TriggerActionConfig>('/tezdm/workflow/get_trigger_action_config/');
        },

        async createWorkflow(payload: any): Promise<ApiResponse<any>> {
          return this.makeRequest<any>('/tezdm/workflow/', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        },

        async updateWorkflow(workflowId: number, groupId: number, payload: any): Promise<ApiResponse<any>> {
          return this.makeRequest<any>(`/tezdm/workflow/${workflowId}/?group_id=${groupId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          });
        },

  /**
   * Get automations list with filters
   */
  async getAutomations(groupId: number, filters: AutomationFilters = {}): Promise<ApiResponse<Automation[]>> {
    const params = new URLSearchParams();
    
    // Add group_id (mandatory)
    params.append('group_id', groupId.toString());
    
    // Add ordering
    if (filters.ordering) {
      params.append('ordering', filters.ordering);
    } else {
      params.append('ordering', '-creation_date'); // default
    }
    
    // Add search parameter (lowercase)
    if (filters.search && filters.search.trim()) {
      params.append('search', filters.search.toLowerCase().trim());
    }
    
    // Add is_active filter (only when not "all")
    if (filters.is_active !== undefined) {
      params.append('is_active', filters.is_active.toString());
    }
    
    // Add event_category filter (only when not "all")
    if (filters.event_category && filters.event_category !== 'all') {
      params.append('event_category', filters.event_category);
    }
    
    const queryString = params.toString();
    const endpoint = `/tezdm/workflow/${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<Automation[]>(endpoint);
  },

  /**
   * Toggle automation status
   */
  async toggleAutomation(automationId: number, groupId: number, isActive: boolean): Promise<ApiResponse<Automation>> {
    return this.makeRequest<Automation>(`/tezdm/workflow/${automationId}/?group_id=${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  /**
   * Delete automation
   */
  async deleteAutomation(automationId: number, groupId: number): Promise<ApiResponse<{ message: string; status: number }>> {
    return this.makeRequest<{ message: string; status: number }>(`/tezdm/workflow/${automationId}/?group_id=${groupId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Create new automation
   */
  async createAutomation(groupId: number, payload: {
    workflow: {
      name: string;
      description?: string;
    };
    events: Array<{
      temp_id: string;
      event_type: 'trigger' | 'action';
      event_category: string;
      event_config: any;
      next_event_temp_id?: string;
      is_active: boolean;
    }>;
  }): Promise<ApiResponse<Automation>> {
    // Add profile_info_id to the payload (you'll need to get this from the user's connected accounts)
    const profileInfoId = 1; // TODO: Get actual profile_info_id from user's connected accounts
    
    const createPayload = {
      workflow: {
        ...payload.workflow,
        profile_info_id: profileInfoId
      },
      events: payload.events
    };

    return this.makeRequest<Automation>('/tezdm/workflow/', {
      method: 'POST',
      body: JSON.stringify(createPayload),
    });
  },

  async getPosts(profileInfoId: number, groupId: number, nextCursor?: string): Promise<ApiResponse<InstagramPost[]>> {
    const params = new URLSearchParams();
    params.append('profile_info_id', profileInfoId.toString());
    params.append('group_id', groupId.toString());
    
    if (nextCursor) {
      params.append('next_cursor', nextCursor);
    }
    
    const url = `/tezdm/workflow/get_instagram_posts/?${params.toString()}`;
    
    try {
      const response = await this.makeRequest<InstagramPost[]>(url);
      return response;
    } catch (error) {
      console.error('📸 API Error:', error);
      throw error;
    }
  },

  async getStories(profileInfoId: number, groupId: number, nextCursor?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    params.append('profile_info_id', profileInfoId.toString());
    params.append('group_id', groupId.toString());
    
    if (nextCursor) {
      params.append('next_cursor', nextCursor);
    }
    
    const url = `/tezdm/workflow/get_instagram_stories/?${params.toString()}`;
    
    try {
      const response = await this.makeRequest<any[]>(url);
      return response;
    } catch (error) {
      console.error('📸 Stories API Error:', error);
      throw error;
    }
  },
};

export type { Automation, Event, EventConfig, AutomationFilters, TriggerActionConfig }; 