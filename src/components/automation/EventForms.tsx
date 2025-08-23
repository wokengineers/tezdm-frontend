import React, { useState } from 'react';
import { AlertCircle, Plus, X, Info, Tag } from 'lucide-react';

// Types for form validation
interface ValidationError {
  field: string;
  message: string;
}

interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Base form props interface
interface BaseFormProps {
  config: any;
  onChange: (config: any) => void;
  errors?: ValidationError[];
}

// Extended props for forms that need post selection
interface PostSelectionFormProps extends BaseFormProps {
  onOpenPostSelector?: () => void;
  profileInfoId?: number;
}

interface StorySelectionFormProps extends BaseFormProps {
  onOpenStorySelector?: () => void;
  profileInfoId?: number;
}



/**
 * Modern Tag Input Component
 */
const TagInput: React.FC<{
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}> = ({ tags, onTagsChange, placeholder = "Add tags...", maxTags = 10 }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-md"
          >
            <Tag className="w-3 h-3" />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
        />
      </div>
      {tags.length >= maxTags && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Maximum {maxTags} tags allowed
        </p>
      )}
    </div>
  );
};

/**
 * Compact Post Comment Trigger Form
 */
export const PostCommentTriggerForm: React.FC<PostSelectionFormProps> = ({ config, onChange, errors, onOpenPostSelector, profileInfoId }) => {
  const addSampleKeyword = (keyword: string) => {
    const currentKeywords = config.keywords || [];
    if (!currentKeywords.includes(keyword)) {
      handleChange('keywords', [...currentKeywords, keyword]);
    }
  };
  
  const validateForm = (): FormValidation => {
    const errors: ValidationError[] = [];

    // Comment validation - require either all_comments OR keywords (allow both to coexist)
    if (!config.all_comments && (!config.keywords || config.keywords.length === 0)) {
      errors.push({ field: 'comments', message: 'Please add keywords or select all comments' });
    }

    // Post validation - require either all_posts OR post_ids (allow both to coexist)
    if (!config.all_posts && (!config.post_ids || config.post_ids.length === 0)) {
      errors.push({ field: 'posts', message: 'Please select posts to monitor' });
    }

    // Fuzzy match validation - only when fuzzy match is enabled
    if (config.fuzzy_match_allowed) {
      if (!config.fuzzy_match_percentage || config.fuzzy_match_percentage === null) {
        errors.push({ field: 'fuzzy_match_percentage', message: 'Fuzzy match percentage is required' });
      }
      if (config.fuzzy_match_percentage !== null && (config.fuzzy_match_percentage < 0 || config.fuzzy_match_percentage > 100)) {
        errors.push({ field: 'fuzzy_match_percentage', message: 'Percentage must be between 0 and 100' });
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    
    // Special handling for fuzzy match checkbox
    if (field === 'fuzzy_match_allowed') {
      if (value === true) {
        // When enabling fuzzy match, set default percentage if not set
        if (!newConfig.fuzzy_match_percentage && newConfig.fuzzy_match_percentage !== 0) {
          newConfig.fuzzy_match_percentage = 80;
        }
      } else {
        // When disabling fuzzy match, clear the percentage
        newConfig.fuzzy_match_percentage = null;
      }
    }
    
    // Special handling for all_comments change
    if (field === 'all_comments') {
      if (value === true) {
        // When switching to all comments, disable fuzzy match
        newConfig.fuzzy_match_allowed = false;
        newConfig.fuzzy_match_percentage = null;
      }
    }
    
    onChange(newConfig);
  };

  const allErrors = errors || [];

  return (
    <div className="space-y-4">
      {/* Posts Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Posts to monitor
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="posts_selection"
              checked={config.all_posts || false}
              onChange={() => handleChange('all_posts', true)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              All my posts
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="posts_selection"
              checked={!config.all_posts}
              onChange={() => handleChange('all_posts', false)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Specific posts
            </span>
          </label>

          {!config.all_posts && (
            <div className="ml-6 mt-2 space-y-3">
              {config.post_ids && config.post_ids.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Selected: {config.post_ids.length} posts
                  </p>
                  <TagInput
                    tags={config.post_ids}
                    onTagsChange={(tags) => handleChange('post_ids', tags)}
                    placeholder="Add post IDs"
                  />
                </div>
              )}
              
              <button
                type="button"
                onClick={onOpenPostSelector}
                disabled={!profileInfoId}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>📸</span>
                Select Posts
              </button>
              
              {!profileInfoId && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Connect an Instagram account to browse posts
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comments to monitor
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="comments_selection"
              checked={config.all_comments || false}
              onChange={() => handleChange('all_comments', true)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              All comments
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="comments_selection"
              checked={!config.all_comments}
              onChange={() => handleChange('all_comments', false)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Comments with keywords
            </span>
          </label>

          {!config.all_comments && (
            <div className="ml-6 mt-2">
              <TagInput
                tags={config.keywords || []}
                onTagsChange={(tags) => handleChange('keywords', tags)}
                placeholder="Type keywords and press Enter (e.g., price, size, available)"
              />
              
            </div>
          )}
        </div>
      </div>

      {/* Fuzzy Match Section - Only show when using keywords */}
      {!config.all_comments && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={Boolean(config.fuzzy_match_allowed)}
              onChange={(e) => handleChange('fuzzy_match_allowed', e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable fuzzy matching
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Match similar words (e.g., "price" will also match "pricing", "prices")
              </p>
            </div>
          </div>

          {config.fuzzy_match_allowed && (
            <div className="ml-6 flex items-center space-x-3">
              <label className="text-sm text-gray-700 dark:text-gray-300 min-w-0">
                Similarity threshold:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={config.fuzzy_match_percentage || 80}
                  onChange={(e) => handleChange('fuzzy_match_percentage', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex items-center space-x-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {config.fuzzy_match_percentage || 80}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {allErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {allErrors.map((error, index) => (
                <p key={index} className={index > 0 ? 'mt-1' : ''}>• {error.message}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact Story Reply Trigger Form
 */
export const StoryReplyTriggerForm: React.FC<StorySelectionFormProps> = ({ config, onChange, errors, onOpenStorySelector, profileInfoId }) => {
  const validateForm = (): FormValidation => {
    const errors: ValidationError[] = [];

    // Story validation - require either all_stories OR story_ids (allow both to coexist)
    if (!config.all_stories && (!config.story_ids || config.story_ids.length === 0)) {
      errors.push({ field: 'stories', message: 'Please select stories to monitor' });
    }

    // Message validation - require either all_messages OR keywords (allow both to coexist)
    if (!config.all_messages && (!config.keywords || config.keywords.length === 0)) {
      errors.push({ field: 'messages', message: 'Please add keywords or select all messages' });
    }

    // Fuzzy match validation - only when fuzzy match is enabled
    if (config.fuzzy_match_allowed) {
      if (!config.fuzzy_match_percentage || config.fuzzy_match_percentage === null) {
        errors.push({ field: 'fuzzy_match_percentage', message: 'Fuzzy match percentage is required' });
      }
      if (config.fuzzy_match_percentage !== null && (config.fuzzy_match_percentage < 0 || config.fuzzy_match_percentage > 100)) {
        errors.push({ field: 'fuzzy_match_percentage', message: 'Percentage must be between 0 and 100' });
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    
    // Special handling for fuzzy match checkbox
    if (field === 'fuzzy_match_allowed') {
      if (value === true) {
        // When enabling fuzzy match, set default percentage if not set
        if (!newConfig.fuzzy_match_percentage && newConfig.fuzzy_match_percentage !== 0) {
          newConfig.fuzzy_match_percentage = 80;
        }
      } else {
        // When disabling fuzzy match, clear the percentage
        newConfig.fuzzy_match_percentage = null;
      }
    }
    
    // Special handling for all_messages change
    if (field === 'all_messages') {
      if (value === true) {
        // When switching to all messages, disable fuzzy match
        newConfig.fuzzy_match_allowed = false;
        newConfig.fuzzy_match_percentage = null;
      }
    }
    
    onChange(newConfig);
  };

  const allErrors = errors || [];

  return (
    <div className="space-y-4">
      {/* Stories Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Stories to monitor
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="stories_selection"
              checked={config.all_stories || false}
              onChange={() => handleChange('all_stories', true)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              All my stories
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="stories_selection"
              checked={!config.all_stories}
              onChange={() => handleChange('all_stories', false)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Specific stories
            </span>
          </label>

          {!config.all_stories && (
            <div className="ml-6 mt-2 space-y-3">
              {config.story_ids && config.story_ids.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Selected: {config.story_ids.length} stories
                  </p>
                  <TagInput
                    tags={config.story_ids}
                    onTagsChange={(tags) => handleChange('story_ids', tags)}
                    placeholder="Add story IDs"
                  />
                </div>
              )}
              
              <button
                type="button"
                onClick={onOpenStorySelector}
                disabled={!profileInfoId}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>📸</span>
                Select Stories
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Messages to monitor
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="messages_selection"
              checked={config.all_messages || false}
              onChange={() => handleChange('all_messages', true)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              All messages
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="messages_selection"
              checked={!config.all_messages}
              onChange={() => handleChange('all_messages', false)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Messages with keywords
            </span>
          </label>

          {!config.all_messages && (
            <div className="ml-6 mt-2">
              <TagInput
                tags={config.keywords || []}
                onTagsChange={(tags) => handleChange('keywords', tags)}
                placeholder="Type keywords and press Enter (e.g., hi, help, price)"
              />
              
            </div>
          )}
        </div>
      </div>

      {/* Fuzzy Match Section - Only show when using keywords */}
      {!config.all_messages && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={Boolean(config.fuzzy_match_allowed)}
              onChange={(e) => handleChange('fuzzy_match_allowed', e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable fuzzy matching
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Match similar words (e.g., "price" will also match "pricing", "prices")
              </p>
            </div>
          </div>

          {config.fuzzy_match_allowed && (
            <div className="ml-6 flex items-center space-x-3">
              <label className="text-sm text-gray-700 dark:text-gray-300 min-w-0">
                Similarity threshold:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={config.fuzzy_match_percentage || 80}
                  onChange={(e) => handleChange('fuzzy_match_percentage', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex items-center space-x-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {config.fuzzy_match_percentage || 80}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {allErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {allErrors.map((error, index) => (
                <p key={index} className={index > 0 ? 'mt-1' : ''}>• {error.message}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact User Direct Message Trigger Form
 */
export const UserDirectMessageTriggerForm: React.FC<BaseFormProps> = ({ config, onChange, errors }) => {
  const addSampleKeyword = (keyword: string) => {
    const currentKeywords = config.keywords || [];
    if (!currentKeywords.includes(keyword)) {
      handleChange('keywords', [...currentKeywords, keyword]);
    }
  };
  const validateForm = (): FormValidation => {
    const errors: ValidationError[] = [];

    // Message validation - require either all_messages OR keywords (allow both to coexist)
    if (!config.all_messages && (!config.keywords || config.keywords.length === 0)) {
      errors.push({ field: 'messages', message: 'Please add keywords or select all messages' });
    }

    // Only validate fuzzy match if it's enabled
    if (config.fuzzy_match_allowed) {
      if (!config.fuzzy_match_percentage || config.fuzzy_match_percentage === null) {
        errors.push({ field: 'fuzzy_match_percentage', message: 'Fuzzy match percentage is required' });
      }
      if (config.fuzzy_match_percentage !== null && (config.fuzzy_match_percentage < 0 || config.fuzzy_match_percentage > 100)) {
        errors.push({ field: 'fuzzy_match_percentage', message: 'Percentage must be between 0 and 100' });
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    
    // Special handling for fuzzy match checkbox
    if (field === 'fuzzy_match_allowed') {
      if (value === true) {
        // When enabling fuzzy match, set default percentage if not set
        if (!newConfig.fuzzy_match_percentage && newConfig.fuzzy_match_percentage !== 0) {
          newConfig.fuzzy_match_percentage = 80;
        }
      } else {
        // When disabling fuzzy match, clear the percentage
        newConfig.fuzzy_match_percentage = null;
      }
    }
    
    // Special handling for all_messages change
    if (field === 'all_messages') {
      if (value === true) {
        // When switching to all messages, disable fuzzy match
        newConfig.fuzzy_match_allowed = false;
        newConfig.fuzzy_match_percentage = null;
      }
    }
    
    onChange(newConfig);
  };

  const allErrors = errors || [];

  return (
    <div className="space-y-4">
      {/* Message Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Messages to monitor
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="messages_selection"
              checked={config.all_messages || false}
              onChange={() => handleChange('all_messages', true)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              All direct messages
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="messages_selection"
              checked={!config.all_messages}
              onChange={() => handleChange('all_messages', false)}
              className="border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Messages with keywords
            </span>
          </label>
        </div>
      </div>

      {/* Keywords Section */}
      {!config.all_messages && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Keywords
          </label>
          <TagInput
            tags={config.keywords || []}
            onTagsChange={(tags) => handleChange('keywords', tags)}
            placeholder="Type keywords and press Enter (e.g., hi, help, price)"
          />

        </div>
      )}

      {/* Fuzzy Match Section - Only show when keywords are selected */}
      {!config.all_messages && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={Boolean(config.fuzzy_match_allowed)}
              onChange={(e) => handleChange('fuzzy_match_allowed', e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable fuzzy matching
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Match similar words (e.g., "price" will also match "pricing", "prices")
              </p>
            </div>
          </div>

          {config.fuzzy_match_allowed && (
            <div className="ml-6 flex items-center space-x-3">
              <label className="text-sm text-gray-700 dark:text-gray-300 min-w-0">
                Similarity threshold:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={config.fuzzy_match_percentage || 80}
                  onChange={(e) => handleChange('fuzzy_match_percentage', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex items-center space-x-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {config.fuzzy_match_percentage || 80}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {allErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {allErrors.map((error, index) => (
                <p key={index} className={index > 0 ? 'mt-1' : ''}>• {error.message}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact Reply Event Action Form
 */
export const ReplyEventActionForm: React.FC<BaseFormProps> = ({ config, onChange, errors }) => {
  const selectSampleTemplate = (template: string) => {
    handleChange('template', template);
  };
  const validateForm = (): FormValidation => {
    const errors: ValidationError[] = [];

    if (!config.template || config.template.trim() === '') {
      errors.push({ field: 'template', message: 'Reply template is required' });
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    onChange(newConfig);
  };

  const allErrors = errors || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Reply Template *
        </label>
        <textarea
          value={config.template || ''}
          onChange={(e) => handleChange('template', e.target.value)}
          placeholder="Write your reply message here..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />

      </div>

      {/* Error Display */}
      {allErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {allErrors.map((error, index) => (
                <p key={index} className={index > 0 ? 'mt-1' : ''}>• {error.message}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Base Webhook Form Component
 */
const BaseWebhookForm: React.FC<{
  config: any;
  onChange: (config: any) => void;
  errors?: ValidationError[];
  examplePayload: string;
  expectedResponse: string;
  title: string;
}> = ({ config, onChange, errors, examplePayload, expectedResponse, title }) => {
  const validateForm = (): FormValidation => {
    const errors: ValidationError[] = [];

    if (!config.endpoint || config.endpoint.trim() === '') {
      errors.push({ field: 'endpoint', message: 'Webhook endpoint is required' });
    } else if (!config.endpoint.startsWith('http')) {
      errors.push({ field: 'endpoint', message: 'Endpoint must start with http or https' });
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    onChange(newConfig);
  };

  const allErrors = errors || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Webhook Endpoint *
        </label>
        <input
          type="url"
          value={config.endpoint || ''}
          onChange={(e) => handleChange('endpoint', e.target.value)}
          placeholder="https://your-webhook-endpoint.com/webhook"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Must start with http:// or https://
        </p>
      </div>

      {/* Example Payload */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Example Payload (POST request)
        </h4>
        <pre className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
          {examplePayload}
        </pre>
      </div>

      {/* Expected Response */}
      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
          Expected Response
        </h4>
        <pre className="text-xs text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
          {expectedResponse}
        </pre>
        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
          Your webhook should return this JSON response to complete the action.
        </p>
      </div>

      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
        <div className="flex items-start">
          <Info className="w-3 h-3 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
          <div className="text-blue-700 dark:text-blue-300">
            A POST request will be sent to your webhook endpoint with event data when triggered.
          </div>
        </div>
      </div>

      {/* Error Display */}
      {allErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {allErrors.map((error, index) => (
                <p key={index} className={index > 0 ? 'mt-1' : ''}>• {error.message}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Send DM Webhook Form
 */
export const SendDmWebhookForm: React.FC<BaseFormProps> = ({ config, onChange, errors }) => {
  const examplePayload = `{
  "message": "Hello from Instagram!"
}`;

  const expectedResponse = `{
  "message": "Your response message here"
}`;

  return (
    <BaseWebhookForm
      config={config}
      onChange={onChange}
      errors={errors}
      examplePayload={examplePayload}
      expectedResponse={expectedResponse}
      title="Send DM Webhook"
    />
  );
};

/**
 * Reply to Comment Webhook Form
 */
export const ReplyToCommentWebhookForm: React.FC<BaseFormProps> = ({ config, onChange, errors }) => {
  const examplePayload = `{
  "comment": "Great post!"
}`;

  const expectedResponse = `{
  "comment": "Your reply comment here"
}`;

  return (
    <BaseWebhookForm
      config={config}
      onChange={onChange}
      errors={errors}
      examplePayload={examplePayload}
      expectedResponse={expectedResponse}
      title="Reply to Comment Webhook"
    />
  );
};

/**
 * Reply to DM Webhook Form
 */
export const ReplyToDmWebhookForm: React.FC<BaseFormProps> = ({ config, onChange, errors }) => {
  const examplePayload = `{
  "message": "Hello from Instagram!"
}`;

  const expectedResponse = `{
  "message": "Your reply message here"
}`;

  return (
    <BaseWebhookForm
      config={config}
      onChange={onChange}
      errors={errors}
      examplePayload={examplePayload}
      expectedResponse={expectedResponse}
      title="Reply to DM Webhook"
    />
  );
};

/**
 * Generic Webhook Event Action Form (fallback)
 */
export const WebhookEventActionForm: React.FC<BaseFormProps> = ({ config, onChange, errors }) => {
  const examplePayload = `{
  "event_type": "webhook_event",
  "data": "Event data will be sent here",
  "timestamp": "2024-01-15T10:30:00Z"
}`;

  const expectedResponse = `{
  "status": "success",
  "message": "Action completed"
}`;

  return (
    <BaseWebhookForm
      config={config}
      onChange={onChange}
      errors={errors}
      examplePayload={examplePayload}
      expectedResponse={expectedResponse}
      title="Webhook Event"
    />
  );
};

/**
 * Form factory function to get the appropriate form component
 */
export const getEventForm = (eventCategory: string) => {
  switch (eventCategory) {
    case 'post_comment':
      return PostCommentTriggerForm;
    case 'story_reply':
      return StoryReplyTriggerForm;
    case 'user_direct_message':
      return UserDirectMessageTriggerForm;
    case 'reply_to_comment':
    case 'reply_to_dm':
      return ReplyEventActionForm;
    case 'reply_to_comment_webhook':
      return ReplyToCommentWebhookForm;
    case 'reply_to_dm_webhook':
      return ReplyToDmWebhookForm;
    case 'send_dm_webhook':
      return SendDmWebhookForm;
    case 'send_dm':
      return ReplyEventActionForm; // Send DM uses the same form as reply
    default:
      return null;
  }
}; 