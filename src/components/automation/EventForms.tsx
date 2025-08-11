import React, { useState } from 'react';
import { AlertCircle, Plus, X, Info, Tag } from 'lucide-react';

// Business-specific sample texts
interface BusinessSample {
  keywords: string[];
  templates: string[];
}

interface BusinessSamples {
  [key: string]: BusinessSample;
}

const BUSINESS_SAMPLES: BusinessSamples = {
  fashion: {
    keywords: ["price", "size", "available", "shipping", "color", "material", "discount", "cost", "measurements", "fit"],
    templates: [
      "Hi! The price is $XX. DM me for more details! 💫",
      "Thanks for asking! Available sizes: XS, S, M, L, XL. What's your size? 📏",
      "Shipping is free for orders over $50! Delivery takes 3-5 business days 🚚",
      "Yes, it's in stock! Limited quantities though. DM to secure yours! ⚡"
    ]
  },
  food: {
    keywords: ["delicious", "menu", "delivery", "hours", "price", "ingredients", "taste", "fresh", "organic"],
    templates: [
      "Thanks! Our full menu is on our website. DM for daily specials! 🍽️",
      "We deliver within 5 miles! Free delivery on orders over $25 🚚",
      "We're open Mon-Sat 8AM-10PM, Sun 9AM-9PM. See you soon! ⏰",
      "All our ingredients are fresh and locally sourced! No preservatives 🌱"
    ]
  },
  fitness: {
    keywords: ["workout", "program", "coaching", "results", "transformation", "training", "diet", "motivation"],
    templates: [
      "Thanks! I have a 12-week transformation program. DM me for details! 💪",
      "My clients see results in 4-6 weeks! Want to join the next challenge? 🔥",
      "You got this! Consistency is key. Ready to start your journey? 🎯",
      "I offer 1-on-1 coaching and group programs. What's your goal? Let's chat! 🎯"
    ]
  },
  beauty: {
    keywords: ["beautiful", "makeup", "skincare", "routine", "products", "ingredients", "results", "reviews"],
    templates: [
      "Thanks! This is our bestseller. DM for the full ingredient list! ✨",
      "Here's my morning routine: Cleanser → Serum → Moisturizer → SPF. Want the full breakdown? 💄",
      "Most customers see results in 2-4 weeks! Want to try our starter kit? 🌟",
      "I'll post a tutorial this week! Follow for more beauty tips and tricks! 💫"
    ]
  },
  digital: {
    keywords: ["course", "ebook", "template", "download", "digital", "learn", "tutorial", "guide", "price"],
    templates: [
      "Thanks! My course covers everything you need. DM for the curriculum! 📚",
      "Lifetime access to all updates! Plus bonus templates and resources 🎁",
      "Students have increased their income by 200%! Ready to join? 🚀",
      "24/7 support and community access included! Never learn alone 💪"
    ]
  },
  handmade: {
    keywords: ["beautiful", "handmade", "unique", "custom", "personalized", "gift", "materials", "process"],
    templates: [
      "Thanks! I do custom orders. DM me your idea! ✨",
      "Each piece is handmade with love! Takes 3-5 days to create 🎨",
      "I use only premium materials: sterling silver, genuine stones, etc. 💎",
      "Perfect for gifts! I can add personalization. What's the occasion? 🎁"
    ]
  }
};

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
 * Sample Keywords Component
 */
const SampleKeywords: React.FC<{
  onAddKeyword: (keyword: string) => void;
}> = ({ onAddKeyword }) => {
  // Get all unique keywords from all business types
  const allKeywords = Array.from(new Set(
    Object.values(BUSINESS_SAMPLES).flatMap(business => business.keywords)
  )).slice(0, 12); // Limit to 12 most common keywords

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-500 mb-2">Quick add common keywords:</p>
      <div className="flex flex-wrap gap-1">
        {allKeywords.map(keyword => (
          <button
            key={keyword}
            onClick={() => onAddKeyword(keyword)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded border transition-colors"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Sample Templates Component
 */
const SampleTemplates: React.FC<{
  onSelectTemplate: (template: string) => void;
}> = ({ onSelectTemplate }) => {
  // Get a mix of templates from all business types
  const allTemplates = Object.values(BUSINESS_SAMPLES).flatMap(business => business.templates).slice(0, 6);

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-500 mb-2">Quick templates:</p>
      <div className="space-y-1">
        {allTemplates.map((template, index) => (
          <button
            key={index}
            onClick={() => onSelectTemplate(template)}
            className="block w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded border transition-colors"
          >
            <span className="font-medium">Sample {index + 1}:</span> {template}
          </button>
        ))}
      </div>
    </div>
  );
};

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

    // Comment validation
    if (config.all_comments && config.keywords && config.keywords.length > 0) {
      errors.push({ field: 'comments', message: 'Choose either all comments or keywords, not both' });
    }

    if (!config.all_comments && (!config.keywords || config.keywords.length === 0)) {
      errors.push({ field: 'comments', message: 'Please add keywords or select all comments' });
    }

    // Post validation
    if (config.all_posts && config.post_ids && config.post_ids.length > 0) {
      errors.push({ field: 'posts', message: 'Choose either all posts or specific posts, not both' });
    }

    if (!config.all_posts && (!config.post_ids || config.post_ids.length === 0)) {
      errors.push({ field: 'posts', message: 'Please select posts to monitor' });
    }

    // Fuzzy match validation - only validate if keywords are being used
    if (!config.all_comments && config.keywords && config.keywords.length > 0) {
      if (config.fuzzy_match_allowed && !config.fuzzy_match_percentage) {
        errors.push({ field: 'fuzzy_match_percentage', message: 'Fuzzy match percentage is required' });
      }

      if (config.fuzzy_match_percentage && !config.fuzzy_match_allowed) {
        errors.push({ field: 'fuzzy_match_allowed', message: 'Fuzzy match must be enabled to use percentage' });
      }

      if (config.fuzzy_match_percentage && (config.fuzzy_match_percentage < 0 || config.fuzzy_match_percentage > 100)) {
        errors.push({ field: 'fuzzy_match_percentage', message: 'Percentage must be between 0 and 100' });
      }
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
                placeholder="Add keywords like: price, size, available, shipping"
              />
              <SampleKeywords 
                onAddKeyword={addSampleKeyword}
              />
            </div>
          )}
        </div>
      </div>

      {/* Fuzzy Match Section - Only show when using keywords */}
      {!config.all_comments && (
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.fuzzy_match_allowed || false}
              onChange={(e) => handleChange('fuzzy_match_allowed', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enable fuzzy matching
            </span>
          </label>

          {config.fuzzy_match_allowed && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Match %:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={config.fuzzy_match_percentage || 80}
                onChange={(e) => handleChange('fuzzy_match_percentage', parseInt(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
          )}
        </div>
      )}

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

    // Story validation
    if (config.all_stories && config.story_ids && config.story_ids.length > 0) {
      errors.push({ field: 'stories', message: 'Choose either all stories or specific stories, not both' });
    }

    if (!config.all_stories && (!config.story_ids || config.story_ids.length === 0)) {
      errors.push({ field: 'stories', message: 'Please select stories to monitor' });
    }

    // Message validation
    if (config.all_messages && config.keywords && config.keywords.length > 0) {
      errors.push({ field: 'messages', message: 'Choose either all messages or keywords, not both' });
    }

    if (!config.all_messages && (!config.keywords || config.keywords.length === 0)) {
      errors.push({ field: 'messages', message: 'Please add keywords or select all messages' });
    }

    // Fuzzy match validation
    if (config.fuzzy_match_allowed && !config.fuzzy_match_percentage) {
      errors.push({ field: 'fuzzy_match_percentage', message: 'Fuzzy match percentage is required' });
    }

    if (config.fuzzy_match_percentage && !config.fuzzy_match_allowed) {
      errors.push({ field: 'fuzzy_match_allowed', message: 'Fuzzy match must be enabled to use percentage' });
    }

    if (config.fuzzy_match_percentage && (config.fuzzy_match_percentage < 0 || config.fuzzy_match_percentage > 100)) {
      errors.push({ field: 'fuzzy_match_percentage', message: 'Percentage must be between 0 and 100' });
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
                placeholder="Add keywords like: hi, help, price, order"
              />
              <SampleKeywords 
                onAddKeyword={(keyword) => {
                  const currentKeywords = config.keywords || [];
                  if (!currentKeywords.includes(keyword)) {
                    handleChange('keywords', [...currentKeywords, keyword]);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Fuzzy Match Section - Only show when using keywords */}
      {!config.all_messages && (
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.fuzzy_match_allowed || false}
              onChange={(e) => handleChange('fuzzy_match_allowed', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enable fuzzy matching
            </span>
          </label>

          {config.fuzzy_match_allowed && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Match %:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={config.fuzzy_match_percentage || 80}
                onChange={(e) => handleChange('fuzzy_match_percentage', parseInt(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
          )}
        </div>
      )}

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

    if (config.all_messages && config.keywords && config.keywords.length > 0) {
      errors.push({ field: 'messages', message: 'Choose either all messages or keywords, not both' });
    }

    if (!config.all_messages && (!config.keywords || config.keywords.length === 0)) {
      errors.push({ field: 'messages', message: 'Please add keywords or select all messages' });
    }

    if (config.fuzzy_match_allowed && !config.fuzzy_match_percentage) {
      errors.push({ field: 'fuzzy_match_percentage', message: 'Fuzzy match percentage is required' });
    }

    if (config.fuzzy_match_percentage && (config.fuzzy_match_percentage < 0 || config.fuzzy_match_percentage > 100)) {
      errors.push({ field: 'fuzzy_match_percentage', message: 'Percentage must be between 0 and 100' });
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
            placeholder="Add keywords like: hi, help, price, order"
          />
          <SampleKeywords 
            onAddKeyword={addSampleKeyword}
          />
        </div>
      )}

      {/* Fuzzy Match Section - Only show when keywords are selected */}
      {!config.all_messages && (
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.fuzzy_match_allowed || false}
              onChange={(e) => handleChange('fuzzy_match_allowed', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enable fuzzy matching
            </span>
          </label>

          {config.fuzzy_match_allowed && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Match %:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={config.fuzzy_match_percentage || 80}
                onChange={(e) => handleChange('fuzzy_match_percentage', parseInt(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
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
        <SampleTemplates 
          onSelectTemplate={selectSampleTemplate}
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