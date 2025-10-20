import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Send, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useFeedStore } from "../stores/feedStore";
import { useAuthStore } from "../stores/authStore";

const PreventScroll = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return null;
};

export default function PostCard({ post }) {
  const { user } = useAuthStore();
  const { likePost, addComment, followUser } = useFeedStore();

  const [comments, setComments] = useState(post?.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(user?.following?.includes(post.userId?._id) || false);

  const liked = post?.likes?.includes(user?._id) || false;
  const likesCount = post?.likes?.length || 0;

  const nextPhoto = (e) => {
    e?.stopPropagation();
    if (currentIndex < post.media.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevPhoto = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleToggleLike = () => {
    if (post._id) {
      likePost(post._id);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() === "" || !post._id) return;
    addComment(post._id, newComment.trim());
    setComments([...comments, {
      userId: { name: user?.name || "You" },
      content: newComment.trim(),
      createdAt: new Date()
    }]);
    setNewComment("");
  };

  const handleFollow = async () => {
    if (post.userId?._id) {
      const result = await followUser(post.userId._id);
      if (result !== null) {
        setIsFollowing(result);
      }
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get("http://localhost:8080/api/user/all", {
        withCredentials: true,
      });
      // Filter out current user and exclude admins
      setUsers(res.data.users.filter(u => u._id !== user._id && u.role !== 'admin'));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSendToUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      // TODO: Implement actual send functionality
      // For now, just show success message
      alert(`Post sent to ${selectedUsers.length} user(s)!`);
      setShowSendModal(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error sending post:", error);
      alert("Failed to send post");
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const variants = {
    enter: (dir) => ({
      opacity: 0,
      x: 300 * dir,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir) => ({
      opacity: 0,
      x: -300 * dir,
    }),
  };

  const togglePhotoModal = () => setIsPhotoOpen(!isPhotoOpen);
  const toggleDescription = () => setDescExpanded(!descExpanded);

  return (
    <>
      <div className="w-full bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <a href={`/profile/${post.userId?._id}`} className="flex items-center space-x-3 flex-1">
            <img
              src={post.userId?.avatar || "https://via.placeholder.com/40"}
              alt={`${post.userId?.name} profile`}
              className="w-12 h-12 rounded-full object-cover border-2 border-violet-500"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-lg">
                {post.userId?.name}
              </span>
              <span className="text-sm text-gray-600">
                {post.userId?.role}
              </span>
            </div>
          </a>
          {user?._id !== post.userId?._id && !isFollowing && (
            <button
              onClick={handleFollow}
              className="bg-violet-100 text-violet-600 text-sm font-medium px-4 py-2 rounded-full hover:bg-violet-200 transition-colors"
            >
              Connect
            </button>
          )}
        </div>

        {/* Media Carousel */}
        <div className="w-full relative cursor-pointer overflow-hidden" onClick={togglePhotoModal}>
          {post.media.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-sm px-2 py-1 rounded-lg z-20">
              {currentIndex + 1}/{post.media.length}
            </div>
          )}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              {post.media[currentIndex].type === "video" ? (
                <video controls className="w-full h-[500px] object-contain">
                  <source src={post.media[currentIndex].url} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={post.media[currentIndex].url}
                  alt="post media"
                  className="w-full h-[500px] object-contain"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows - Show based on position */}
          {currentIndex > 0 && (
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {currentIndex < post.media.length - 1 && (
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-200 hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Media Indicators */}
          {post.media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {post.media.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-white scale-125"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="p-4">
          <div className="text-gray-700">
            {descExpanded ? (
              <div>
                <p className="whitespace-pre-wrap break-words">{post.content}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDescription();
                  }}
                  className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium mt-2"
                >
                  Show less
                </button>
              </div>
            ) : (
              <div>
                <p className="whitespace-pre-wrap break-words">
                  {post.content.length > 120 ? post.content.slice(0, 120) + "..." : post.content}
                </p>
                {post.content.length > 120 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDescription();
                    }}
                    className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium"
                  >
                    Read more
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleToggleLike}
              className={`flex items-center space-x-2 transition-colors ${
                liked ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-red-500"
              }`}
            >
              {liked ? <Heart size={20} fill="currentColor" /> : <Heart size={20} />}
              <span>{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={20} />
              <span>{comments.length}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSendModal(true);
                fetchUsers();
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-500 transition-colors"
            >
              <Send size={20} />
              <span>Send</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
            >
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="p-4 border-t border-gray-200 space-y-3">
            {comments.map((c) => (
              <div key={c._id || c.createdAt} className="text-gray-700">
                <span className="font-semibold">{c.userId?.name || "User"}: </span>
                <span>{c.content}</span>
              </div>
            ))}
            <div className="flex mt-2 space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal Carousel */}
      {isPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <PreventScroll />

          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

          <div className="relative w-3/4 max-w-3xl h-3/4 flex items-center justify-center rounded-lg">
            <button
              onClick={togglePhotoModal}
              className="absolute top-4 right-4 text-black text-3xl font-bold cursor-pointer z-50 hover:text-gray-500"
            >
              <XCircle size={32} />
            </button>

            <AnimatePresence initial={false} mode="wait">
              {post.media[currentIndex].type === "video" ? (
                <motion.video
                  key={currentIndex}
                  src={post.media[currentIndex].url}
                  alt="full view"
                  className="max-h-full max-w-full object-contain rounded-lg"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <motion.img
                  key={currentIndex}
                  src={post.media[currentIndex].url}
                  alt="full view"
                  className="max-h-full max-w-full object-contain rounded-lg"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </AnimatePresence>

            {currentIndex > 0 && (
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-800 text-4xl z-50 p-2 cursor-pointer hover:bg-gray-200/40 rounded-full"
              >
                &#10094;
              </button>
            )}

            {currentIndex < post.media.length - 1 && (
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-800 text-4xl z-50 p-2 cursor-pointer hover:bg-gray-200/40 rounded-full"
              >
                &#10095;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Send Post</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Post Preview */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-800 font-medium mb-1">Post by {post.userId?.name}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
            </div>

            {/* Users List */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Select users to send to:</p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {loadingUsers ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No users available</p>
                ) : (
                  users.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => toggleUserSelection(u._id)}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(u._id)
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <img
                        src={u.avatar || "https://via.placeholder.com/32"}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.role}</p>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedUsers.includes(u._id)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}>
                        {selectedUsers.includes(u._id) && (
                          <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSendToUsers}
                disabled={selectedUsers.length === 0}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
              </button>
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSelectedUsers([]);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Post</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Post Preview */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-800 font-medium mb-1">Post by {post.userId?.name}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Share to:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`${post.content}\n\nShared from CampusBuzz`);
                    const url = encodeURIComponent(`${window.location.origin}/post/${post._id}`);
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                    setShowShareModal(false);
                  }}
                  className="flex flex-col items-center space-y-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    const text = encodeURIComponent(`${post.content}\n\nShared from CampusBuzz`);
                    const url = encodeURIComponent(`${window.location.origin}/post/${post._id}`);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    setShowShareModal(false);
                  }}
                  className="flex flex-col items-center space-y-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Facebook</span>
                </button>

                <button
                  onClick={() => {
                    const text = encodeURIComponent(`${post.content}\n\nShared from CampusBuzz`);
                    const url = encodeURIComponent(`${window.location.origin}/post/${post._id}`);
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                    setShowShareModal(false);
                  }}
                  className="flex flex-col items-center space-y-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <svg className="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">LinkedIn</span>
                </button>

                <button
                  onClick={() => {
                    const text = encodeURIComponent(`${post.content}\n\nShared from CampusBuzz`);
                    const url = encodeURIComponent(`${window.location.origin}/post/${post._id}`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                    setShowShareModal(false);
                  }}
                  className="flex flex-col items-center space-y-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Twitter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}