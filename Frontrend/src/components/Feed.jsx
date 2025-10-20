import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Heart, Share2, Trash2, X, Copy, MessageCircle, UserPlus } from "lucide-react";
import { useFeedStore } from "../stores/feedStore";
import { useAuthStore } from "../stores/authStore";
import SkeletonPost from "./common/SkeletonPost"; // import skeleton
import MediaCarousel from "./MediaCarousel";
import PostCard from "./PostCard";
import { timeAgo } from "../Utils/timeAgo";
import { getLetterAvatar } from "../Utils/avatarUtils";

// Removed defaultAvatar as we now use getLetterAvatar utility

export default function Feed({ user: propUser }) {
  const navigate = useNavigate();
  const { user: storeUser } = useAuthStore();
  const user = propUser || storeUser; // Use prop user if available, fallback to store
  const {
    posts,
    fetchPosts,
    createPost,
    likePost,
    deletePost,
    addComment,
    followUser,
    isLoading,
    uploading,
  } = useFeedStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ content: "" });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [enlargedPost, setEnlargedPost] = useState(null);
  const [shareModal, setShareModal] = useState({ show: false, post: null });
  const [commentModal, setCommentModal] = useState({ show: false, post: null });
  const [newComment, setNewComment] = useState("");
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const videoRefs = useRef({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (searchTerm.startsWith("#") &&
        post.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim() && selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append("content", newPost.content);
    selectedFiles.forEach((file) => {
      formData.append("media", file);
    });
    if (user) {
      formData.append("name", user.name);
      formData.append("avatar", user.avatar || "");
      formData.append("role", user.role);
    }

    await createPost(formData);

    setNewPost({ content: "" });
    setSelectedFiles([]);
    setShowNewPost(false);
  };

  const toggleEnlarge = (post) => {
    setEnlargedPost(enlargedPost && enlargedPost._id === post._id ? null : post);
  };

  const handleShare = async (post) => {
    // Build complete post content including media URLs
    let fullContent = post.content;

    if (post.media && post.media.length > 0) {
      const mediaUrls = post.media.map(media => media.url).join('\n');
      fullContent += `\n\nMedia: ${mediaUrls}`;
    }

    const shareData = {
      title: `Post by ${post.userId?.name || post.userDetails?.name}`,
      text: fullContent,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
        setShareModal({ show: true, post });
      }
    } else {
      setShareModal({ show: true, post });
    }
  };

  const handleFollow = async (userId) => {
    await followUser(userId);
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
    await addComment(postId, newComment.trim());
    setNewComment("");
    setCommentModal({ show: false, post: null });
  };

  const togglePostExpansion = (postId) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const shareToPlatform = (platform, post) => {
    // Build complete post content including media URLs
    let fullContent = post.content;

    if (post.media && post.media.length > 0) {
      const mediaUrls = post.media.map(media => media.url).join('\n');
      fullContent += `\n\nMedia: ${mediaUrls}`;
    }

    const text = encodeURIComponent(`${fullContent}\n\nShared from CampusBuzz`);
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'copy':
        // Copy to clipboard
        navigator.clipboard.writeText(`${fullContent}\n\n${window.location.href}`);
        alert('Content copied to clipboard!');
        setShareModal({ show: false, post: null });
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
    setShareModal({ show: false, post: null });
  };

  return (
    <div className="p-2 lg:p-2 max-w-4xl mx-auto flex flex-col h-[calc(100vh-1rem)]">
      {/* Header Section */}
      <div className="flex-shrink-0 mb-2">
        <div className="flex items-center space-x-4 mb-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search posts, hashtags (#campuslife), or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowNewPost(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Post</span>
          </button>
        </div>
      </div>

      {/* Scrollable Posts */}
      <div
        className="flex-1 min-h-0 space-y-6 overflow-y-scroll"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {isLoading &&
          Array.from({ length: 3 }).map((_, idx) => <SkeletonPost key={idx} />)}

        {!isLoading &&
          filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={!uploading ? () => setShowNewPost(false) : undefined}>
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Post</h3>
              {!uploading && (
                <button
                  onClick={() => setShowNewPost(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <textarea
              placeholder="Share something with your campus community... Use #hashtags!"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              disabled={uploading}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            <div className="flex items-center mt-3 space-x-4">
              {/* Camera Icon Button */}
              <label
                htmlFor="file-upload"
                className={`cursor-pointer p-3 rounded-lg transition-colors flex items-center justify-center ${
                  uploading
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 ${uploading ? 'text-gray-400' : 'text-gray-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7h4l2-3h6l2 3h4v13H3V7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11a4 4 0 100 8 4 4 0 000-8z"
                  />
                </svg>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />

              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded px-2 py-1">
                      <span className="text-gray-700 text-sm truncate max-w-xs">
                        {file.name}
                      </span>
                      {!uploading && (
                        <button
                          onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleCreatePost}
                disabled={uploading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {selectedFiles.length > 1 ? `Uploading ${selectedFiles.length} files...` : "Posting..."}
                  </>
                ) : (
                  "Post"
                )}
              </button>
              <button
                onClick={() => setShowNewPost(false)}
                disabled={uploading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Media Modal */}
      {enlargedPost && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full h-full max-w-screen max-h-screen flex items-center justify-center">
            <button
              onClick={() => setEnlargedPost(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-gray-200 hover:bg-gray-300 p-2 sm:p-3 rounded-full shadow-lg z-50 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-gray-800" />
            </button>
            {enlargedPost.media && enlargedPost.media.length > 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                {enlargedPost.media.length === 1 ? (
                  // Single image/video - fill screen
                  enlargedPost.media[0].type === "image" ? (
                    <img
                      src={enlargedPost.media[0].url}
                      alt="Enlarged"
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'auto' }}
                    />
                  ) : (
                    <video
                      src={enlargedPost.media[0].url}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      controls
                      muted={false}
                    />
                  )
                ) : (
                  // Multiple images - use carousel
                  <MediaCarousel media={enlargedPost.media} />
                )}
              </div>
            ) : (
              // Fallback for old posts with single media
              enlargedPost.mediaType === "image" ? (
                <img
                  src={enlargedPost.mediaUrl || enlargedPost.media}
                  alt="Enlarged"
                  className="w-full h-full object-cover max-w-full max-h-full"
                  style={{ imageRendering: 'auto' }}
                />
              ) : (
                <video
                  src={enlargedPost.mediaUrl || enlargedPost.media}
                  className="w-full h-full object-cover max-w-full max-h-full"
                  autoPlay
                  loop
                  controls
                  muted={false}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Comment</h3>
              <button
                onClick={() => setCommentModal({ show: false, post: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => handleAddComment(commentModal.post._id)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Comment
              </button>
              <button
                onClick={() => setCommentModal({ show: false, post: null })}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">Share Post</h3>
              <button
                onClick={() => setShareModal({ show: false, post: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => shareToPlatform('whatsapp', shareModal.post)}
                className="w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center justify-center"
                title="Share on WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </button>
              <button
                onClick={() => shareToPlatform('twitter', shareModal.post)}
                className="w-10 h-10 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors flex items-center justify-center"
                title="Share on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button
                onClick={() => shareToPlatform('copy', shareModal.post)}
                className="w-10 h-10 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors flex items-center justify-center"
                title="Copy to Clipboard"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
