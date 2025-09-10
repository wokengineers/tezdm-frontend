import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, Loader2, Image, Video, Grid, Play, RefreshCw, AlertCircle } from 'lucide-react';
import { automationApi } from '../../services/automationApi';

interface InstagramStory {
  story_id: string;
  media_url: string;
  caption?: string;
  likes_count?: number;
  comments_count?: number;
  media_type?: string;
}

interface InstagramStorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (storyIds: string[]) => void;
  profileInfoId: number;
  groupId: number;
  selectedStoryIds: string[];
}

const InstagramStorySelector: React.FC<InstagramStorySelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  profileInfoId,
  groupId,
  selectedStoryIds
}) => {
  const [stories, setStories] = useState<InstagramStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [selectedStories, setSelectedStories] = useState<string[]>(selectedStoryIds);
  const [error, setError] = useState<string | null>(null);
  
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial stories
  useEffect(() => {
    if (isOpen && profileInfoId && groupId) {
      loadStories();
    }
  }, [isOpen, profileInfoId, groupId]);

  // Initialize selected stories
  useEffect(() => {
    setSelectedStories(selectedStoryIds);
  }, [selectedStoryIds]);

  const loadStories = async (cursor?: string) => {
    try {
      setError(null);
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await automationApi.getStories(profileInfoId, groupId, cursor);
      
      // The API returns data directly in response.data (which is an array)
      if (response.data && Array.isArray(response.data)) {
        if (cursor) {
          setStories(prev => [...prev, ...response.data]);
        } else {
          setStories(response.data);
        }
        // For pagination, we need to check the full response object
        const fullResponse = response as any;
        setNextCursor(fullResponse.next_cursor);
      } else {
        console.error('📸 No stories data found in response');
        console.error('📸 Response structure:', response);
        const errorMessage = response.message || 'No stories data found in response';
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('📸 Error loading stories:', err);
      const errorMessage = err?.message || err?.toString() || 'Failed to load stories';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreStories = useCallback(() => {
    if (nextCursor && !loadingMore) {
      loadStories(nextCursor);
    }
  }, [nextCursor, loadingMore]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMoreStories();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loadMoreStories]);

  const toggleStorySelection = (storyId: string) => {
    setSelectedStories(prev => 
      prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleApply = () => {
    onSelect(selectedStories);
    onClose();
  };

  const handleCancel = () => {
    setSelectedStories(selectedStoryIds);
    onClose();
  };

  const filteredStories = stories || [];

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('video');
  };

  const getMediaTypeIcon = (mediaType?: string, mediaUrl?: string) => {
    if (mediaType === 'VIDEO') {
      return <Play className="w-4 h-4 text-white" />;
    } else if (mediaType === 'CAROUSEL_ALBUM') {
      return <Grid className="w-4 h-4 text-white" />;
    } else if (isVideo(mediaUrl || '')) {
      return <Play className="w-4 h-4 text-white" />;
    } else {
      return <Image className="w-4 h-4 text-white" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              📸 Select Instagram Stories
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose stories to monitor for replies
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Stories Grid */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto p-6"
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading stories...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
              <button
                onClick={() => loadStories()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-gray-500 dark:text-gray-400">No stories found</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredStories.map((story) => (
                <div
                  key={story.story_id}
                  className="relative group cursor-pointer"
                  onClick={() => toggleStorySelection(story.story_id)}
                >
                  {/* Story Card - Vertical aspect ratio for stories */}
                  <div className="relative aspect-[9/16] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200">
                    {/* Media */}
                    <div className="relative w-full h-full">
                      {isVideo(story.media_url) ? (
                        <video
                          src={story.media_url}
                          className="w-full h-full object-cover"
                          muted
                          onLoadedData={(e) => {
                            const video = e.target as HTMLVideoElement;
                            video.currentTime = 1; // Show a frame from the video
                          }}
                        />
                      ) : (
                        <img
                          src={story.media_url}
                          alt={`Story ${story.story_id}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      )}
                      
                      {/* Fallback for failed images */}
                      <div className="hidden absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {isVideo(story.media_url) ? (
                          <Video className="w-8 h-8 text-gray-400" />
                        ) : (
                          <Image className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Media Type Indicator */}
                      <div className="absolute top-2 left-2 w-5 h-5 bg-black/50 rounded flex items-center justify-center">
                        {getMediaTypeIcon(story.media_type, story.media_url)}
                      </div>

                      {/* Selection Overlay */}
                      <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 ${
                        selectedStories.includes(story.story_id) ? 'bg-blue-500/30' : ''
                      }`}>
                        {selectedStories.includes(story.story_id) && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Story Info - Compact for vertical layout */}
                  <div className="mt-1 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {story.story_id.slice(-6)}...
                    </p>
                    {story.caption && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 truncate">
                        {story.caption.slice(0, 20)}...
                      </p>
                    )}
                    <div className="flex justify-center gap-1 mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                      {story.media_type && (
                        <span className="flex items-center gap-0.5">
                          {getMediaTypeIcon(story.media_type, story.media_url)}
                          <span className="text-xs">{story.media_type.replace('_', ' ')}</span>
                        </span>
                      )}
                      {story.likes_count !== undefined && (
                        <span>❤️ {story.likes_count}</span>
                      )}
                      {story.comments_count !== undefined && (
                        <span>💬 {story.comments_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {loadingMore && (
            <div className="flex items-center justify-center mt-6">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading more stories...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedStories.length} stories
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedStories.length === 0}
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramStorySelector; 