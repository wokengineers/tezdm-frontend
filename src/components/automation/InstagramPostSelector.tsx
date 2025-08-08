import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, Loader2, Image, Video, Grid, Play } from 'lucide-react';
import { automationApi, InstagramPost } from '../../services/automationApi';

interface InstagramPostSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (postIds: string[]) => void;
  profileInfoId: number;
  selectedPostIds: string[];
}

const InstagramPostSelector: React.FC<InstagramPostSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  profileInfoId,
  selectedPostIds
}) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [selectedPosts, setSelectedPosts] = useState<string[]>(selectedPostIds);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial posts
  useEffect(() => {
    if (isOpen && profileInfoId) {
      loadPosts();
    }
  }, [isOpen, profileInfoId]);

  // Initialize selected posts
  useEffect(() => {
    setSelectedPosts(selectedPostIds);
  }, [selectedPostIds]);

  const loadPosts = async (cursor?: string) => {
    try {
      setError(null);
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await automationApi.getPosts(profileInfoId, cursor);
      
      console.log('📸 Posts API Response:', response);
      
      // The API returns data directly in response.data (which is an array)
      if (response.data && Array.isArray(response.data)) {
        console.log('📸 Posts data:', response.data);
        if (cursor) {
          setPosts(prev => [...prev, ...response.data]);
        } else {
          setPosts(response.data);
        }
        // For pagination, we need to check the full response object
        const fullResponse = response as any;
        setNextCursor(fullResponse.next_cursor);
      } else {
        console.error('📸 No posts data found in response');
        console.error('📸 Response structure:', response);
        setError('Failed to load posts');
      }
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = useCallback(() => {
    if (nextCursor && !loadingMore) {
      loadPosts(nextCursor);
    }
  }, [nextCursor, loadingMore]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMorePosts();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loadMorePosts]);

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleApply = () => {
    onSelect(selectedPosts);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPosts(selectedPostIds);
    onClose();
  };

  const filteredPosts = posts || [];
  
  console.log('📸 Current posts state:', posts);
  console.log('📸 Filtered posts:', filteredPosts);

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
              📸 Select Instagram Posts
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose posts to monitor for comments
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>



        {/* Posts Grid */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto p-6"
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading posts...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-red-500">{error}</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-gray-500 dark:text-gray-400">No posts found</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="relative group cursor-pointer"
                  onClick={() => togglePostSelection(post.post_id)}
                >
                  {/* Post Card */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200">
                    {/* Media */}
                    <div className="relative w-full h-full">
                      {isVideo(post.media_url) ? (
                        <video
                          src={post.media_url}
                          className="w-full h-full object-cover"
                          muted
                          onLoadedData={(e) => {
                            const video = e.target as HTMLVideoElement;
                            video.currentTime = 1; // Show a frame from the video
                          }}
                        />
                      ) : (
                        <img
                          src={post.media_url}
                          alt={`Post ${post.post_id}`}
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
                        {isVideo(post.media_url) ? (
                          <Video className="w-8 h-8 text-gray-400" />
                        ) : (
                          <Image className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Media Type Indicator */}
                      <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 rounded flex items-center justify-center">
                        {getMediaTypeIcon(post.media_type, post.media_url)}
                      </div>

                      {/* Selection Overlay */}
                      <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 ${
                        selectedPosts.includes(post.post_id) ? 'bg-blue-500/30' : ''
                      }`}>
                        {selectedPosts.includes(post.post_id) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Info */}
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {post.post_id.slice(-8)}...
                    </p>
                    {post.caption && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                        {post.caption.slice(0, 30)}...
                      </p>
                    )}
                    <div className="flex justify-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {post.media_type && (
                        <span className="flex items-center gap-1">
                          {getMediaTypeIcon(post.media_type, post.media_url)}
                          <span className="text-xs">{post.media_type.replace('_', ' ')}</span>
                        </span>
                      )}
                      {post.likes_count !== undefined && (
                        <span>❤️ {post.likes_count}</span>
                      )}
                      {post.comments_count !== undefined && (
                        <span>💬 {post.comments_count}</span>
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
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading more posts...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedPosts.length} posts
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
                disabled={selectedPosts.length === 0}
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

export default InstagramPostSelector; 