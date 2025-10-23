import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, Trash2, X, Image, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores/authStore';
import { getLetterAvatar } from '../Utils/avatarUtils';
import { linkifyText } from '../Utils/linkUtils.jsx';
import toast from 'react-hot-toast';

const Conversation = ({ user }) => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { fetchUnreadMessageCount } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch conversation messages and participant details
  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) return;

      setLoading(true);
      try {
        // Fetch messages for this conversation
        const messagesResponse = await messageService.getMessages(conversationId);
        if (messagesResponse.success) {
          setMessages(messagesResponse.messages);
          // Refresh unread count after viewing messages (they get marked as read)
          await fetchUnreadMessageCount();
        }

        // Determine participant (the other user in the conversation)
        // Since messages contain sender/receiver info, we can get participant from the first message
        if (messagesResponse.messages && messagesResponse.messages.length > 0) {
          const firstMessage = messagesResponse.messages[0];
          const participantData = firstMessage.sender._id === user._id
            ? firstMessage.receiver
            : firstMessage.sender;
          setParticipant(participantData);
        } else {
          // If no messages yet, we need to fetch user details for the conversationId
          // This happens when starting a new conversation
          try {
            const userResponse = await fetch(`http://localhost:8080/api/user/profile/${conversationId}`, {
              credentials: 'include'
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setParticipant(userData.user);
            }
          } catch (err) {
            console.error('Error fetching participant details:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchConversationWrapper = () => fetchConversation();

    fetchConversationWrapper();

    // Connect to socket when component mounts
    socketService.connect(user._id);

    // Set up socket listeners
    socketService.onReceiveMessage((message) => {
      // Only add message if it's for this conversation
      if ((message.sender._id === conversationId || message.receiver._id === conversationId)) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    // Remove the messageSent listener since we're handling it via HTTP response
    // socketService.onMessageSent((message) => {
    //   console.log('Message sent confirmation:', message);
    // });

    socketService.onMessageDeleted((messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    socketService.onMessageError((error) => {
      console.error('Message error:', error);
    });

    socketService.onDeleteError((error) => {
      console.error('Delete error:', error);
      // If there's a delete error, refresh the messages to ensure UI is in sync
      fetchConversationWrapper();
    });

    // Cleanup function
    return () => {
      socketService.removeAllListeners();
    };
  }, [conversationId, user._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedImages.length === 0) || sending) return;

    setSending(true);
    const messageContent = newMessage;
    const imagesToSend = selectedImages.length > 0 ? selectedImages : null;
    setNewMessage('');
    setSelectedImages([]);

    try {
      const response = await messageService.sendMessage(conversationId, messageContent, imagesToSend);
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.status === 403) {
        toast.error('You can only send messages to connected users');
      } else {
        toast.error('Failed to send message');
      }
      // Restore message content if sending failed
      setNewMessage(messageContent);
      setSelectedImages(imagesToSend || []);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 10 images
    const maxImages = 10;
    const currentCount = selectedImages.length;
    const availableSlots = maxImages - currentCount;
    const filesToProcess = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      toast.error(`You can only select up to ${maxImages} images at once`);
    }

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = {
            id: Date.now() + Math.random(),
            file,
            base64: e.target.result,
            caption: ''
          };
          setSelectedImages(prev => [...prev, imageData]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeSelectedImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setShowImagePreview(true);
  };

  const handleImageGallery = (images, startIndex = 0) => {
    setGalleryImages(images);
    setCurrentImageIndex(startIndex);
    setShowImageGallery(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchMoveX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX && touchMoveX) {
      const diff = touchMoveX - touchStartX;
      if (diff > 50) {
        prevImage();
      } else if (diff < -50) {
        nextImage();
      }
    }
    setTouchStartX(null);
    setTouchMoveX(null);
  };

  const handleKeyPress = (e) => {
    if (!showImageGallery) return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') setShowImageGallery(false);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showImageGallery, galleryImages.length]);

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && galleryImages.length > 1) {
      nextImage();
    }
    if (isRightSwipe && galleryImages.length > 1) {
      prevImage();
    }
  };

  const togglePostDescription = (postId) => {
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

  const handlePostClick = (postId) => {
    // Navigate to feed with the post highlighted
    // We'll pass the postId as a URL parameter that the Feed component can use
    navigate(`/feed?highlight=${postId}`);
  };

  const handleMessageClick = (messageId) => {
    if (isSelectionMode) {
      setSelectedMessages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(messageId)) {
          newSet.delete(messageId);
          if (newSet.size === 0) {
            setIsSelectionMode(false);
          }
        } else {
          newSet.add(messageId);
        }
        return newSet;
      });
    } else {
      // Enter selection mode on first click
      setIsSelectionMode(true);
      setSelectedMessages(new Set([messageId]));
    }
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.size === 0) return;

    try {
      // Delete via HTTP first to ensure it works
      for (const messageId of selectedMessages) {
        try {
          const response = await messageService.deleteMessage(messageId);
          if (response.success) {
            // Remove from local state immediately
            setMessages(prev => prev.filter(msg => msg._id !== messageId));

            // Also notify via socket for real-time updates to other users
            socketService.deleteMessage(messageId, user._id);
          } else {
            console.error('Failed to delete message:', messageId, response);
          }
        } catch (messageError) {
          console.error('Error deleting individual message:', messageId, messageError);
          // Continue with other messages even if one fails
        }
      }

      // Reset selection mode
      setSelectedMessages(new Set());
      setIsSelectionMode(false);
      setShowDeleteConfirm(false);

      // Show success toast
      toast.success('Messages deleted successfully');
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  const cancelSelection = () => {
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString();
  };

// Removed defaultAvatar as we now use getLetterAvatar utility

  if (loading || !participant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            {isSelectionMode ? (
              <>
                <button
                  onClick={cancelSelection}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedMessages.size} selected
                  </h1>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  disabled={selectedMessages.size === 0}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/messages')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={participant.avatar || getLetterAvatar(participant.name)}
                  alt={participant.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = getLetterAvatar(participant.name);
                  }}
                />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{participant.name}</h1>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.sender._id === user._id;
            const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

            return (
              <div key={message._id}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedMessages.has(message._id)
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : ''
                    } ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                    }`}
                    onClick={() => handleMessageClick(message._id)}
                  >
                    {/* Render images if present */}
                    {message.images && message.images.length > 0 && (
                      <div className="mb-2">
                        {message.images.length === 1 ? (
                          // Single image
                          <img
                            src={message.images[0].url}
                            alt="Message image"
                            className="rounded-lg max-w-full h-auto cursor-pointer"
                            style={{ maxHeight: '200px' }}
                            onClick={() => handleImageGallery(message.images, 0)}
                          />
                        ) : message.images.length === 2 ? (
                          // Two images side by side
                          <div className="grid grid-cols-2 gap-1">
                            {message.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img.url}
                                alt={`Message image ${idx + 1}`}
                                className="rounded-lg w-full h-24 object-cover cursor-pointer"
                                onClick={() => handleImageGallery(message.images, idx)}
                              />
                            ))}
                          </div>
                        ) : message.images.length === 3 ? (
                          // Three images: one large, two small
                          <div className="grid grid-cols-2 gap-1">
                            <img
                              src={message.images[0].url}
                              alt="Message image 1"
                              className="rounded-lg w-full h-32 object-cover cursor-pointer row-span-2"
                              onClick={() => handleImageGallery(message.images, 0)}
                            />
                            <img
                              src={message.images[1].url}
                              alt="Message image 2"
                              className="rounded-lg w-full h-15 object-cover cursor-pointer"
                              onClick={() => handleImageGallery(message.images, 1)}
                            />
                            <img
                              src={message.images[2].url}
                              alt="Message image 3"
                              className="rounded-lg w-full h-15 object-cover cursor-pointer"
                              onClick={() => handleImageGallery(message.images, 2)}
                            />
                          </div>
                        ) : (
                          // Four or more images: 2x2 grid with +N indicator
                          <div className="grid grid-cols-2 gap-1">
                            {message.images.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img.url}
                                alt={`Message image ${idx + 1}`}
                                className="rounded-lg w-full h-24 object-cover cursor-pointer"
                                onClick={() => handleImageGallery(message.images, idx)}
                              />
                            ))}
                            <div 
                              className="relative rounded-lg w-full h-24 cursor-pointer"
                              onClick={() => handleImageGallery(message.images, 3)}
                            >
                              <img
                                src={message.images[3].url}
                                alt={`Message image 4`}
                                className="rounded-lg w-full h-full object-cover"
                              />
                              {message.images.length > 4 && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    +{message.images.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Render shared post if present */}
                    {message.messageType === 'shared_post' && message.sharedPost && (
                      <div 
                        className="border border-gray-200 dark:border-gray-600 rounded-lg mb-2 bg-white dark:bg-gray-800 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500"
                        onClick={() => handlePostClick(message.sharedPost.postId)}
                      >
                        {console.log('Displaying shared post:', message.sharedPost)}
                        {console.log('Shared post images:', message.sharedPost.images)}
                        
                        {/* Post header */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <img
                              src={message.sharedPost.author.avatar || getLetterAvatar(message.sharedPost.author.name)}
                              alt={message.sharedPost.author.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = getLetterAvatar(message.sharedPost.author.name);
                              }}
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {message.sharedPost.author.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(new Date(message.sharedPost.createdAt))}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Post images */}
                        {message.sharedPost.images && message.sharedPost.images.length > 0 && (
                          <div className="relative">
                            {message.sharedPost.images.length === 1 ? (
                              <img
                                src={message.sharedPost.images[0]}
                                alt="Shared post image"
                                className="w-full h-auto"
                                style={{ maxHeight: '400px', objectFit: 'cover' }}
                              />
                            ) : message.sharedPost.images.length === 2 ? (
                              <div className="grid grid-cols-2">
                                {message.sharedPost.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Shared post image ${idx + 1}`}
                                    className="w-full h-48 object-cover"
                                  />
                                ))}
                              </div>
                            ) : message.sharedPost.images.length === 3 ? (
                              <div className="grid grid-cols-2 h-96">
                                <img
                                  src={message.sharedPost.images[0]}
                                  alt="Shared post image 1"
                                  className="w-full h-full object-cover"
                                />
                                <div className="grid grid-rows-2">
                                  <img
                                    src={message.sharedPost.images[1]}
                                    alt="Shared post image 2"
                                    className="w-full h-full object-cover"
                                  />
                                  <img
                                    src={message.sharedPost.images[2]}
                                    alt="Shared post image 3"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 h-96">
                                <img
                                  src={message.sharedPost.images[0]}
                                  alt="Shared post image 1"
                                  className="w-full h-full object-cover"
                                />
                                <div className="grid grid-rows-2">
                                  <img
                                    src={message.sharedPost.images[1]}
                                    alt="Shared post image 2"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="relative">
                                    <img
                                      src={message.sharedPost.images[2]}
                                      alt="Shared post image 3"
                                      className="w-full h-full object-cover"
                                    />
                                    {message.sharedPost.images.length > 3 && (
                                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                        <span className="text-white font-bold text-2xl">
                                          +{message.sharedPost.images.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Post actions */}
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{message.sharedPost.likesCount || 0} likes</span>
                            <span>{message.sharedPost.commentsCount || 0} comments</span>
                          </div>
                        </div>
                        
                        {/* Post description at bottom */}
                        {message.sharedPost.content && (
                          <div className="p-3">
                            <div className="text-gray-700 dark:text-gray-300">
                              {expandedPosts.has(message.sharedPost.postId) ? (
                                <div>
                                  <p className="whitespace-pre-wrap break-words text-sm">{message.sharedPost.content}</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePostDescription(message.sharedPost.postId);
                                    }}
                                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium mt-2 text-sm"
                                  >
                                    Show less
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <p className="whitespace-pre-wrap break-words text-sm">
                                    {message.sharedPost.content.length > 120 ? message.sharedPost.content.slice(0, 120) + "..." : message.sharedPost.content}
                                  </p>
                                  {message.sharedPost.content.length > 120 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePostDescription(message.sharedPost.postId);
                                      }}
                                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium text-sm"
                                    >
                                      Read more
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Render text content if present */}
                    {message.content && message.messageType !== 'shared_post' && (
                      <p className="text-sm">{linkifyText(message.content)}</p>
                    )}
                    
                    <p className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(new Date(message.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Messages</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete {selectedMessages.size} message{selectedMessages.size > 1 ? 's' : ''}?
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessages}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && galleryImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          {/* Header with close button and counter */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowImageGallery(false)}
                className="text-white hover:text-gray-300 p-2"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Main image display */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={galleryImages[currentImageIndex]?.url}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Navigation arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Bottom thumbnail strip for multiple images */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex justify-center space-x-2 overflow-x-auto max-w-full">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-white' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Swipe indicators for mobile */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-50">
            {galleryImages.length > 1 && "Swipe or use arrow keys to navigate"}
          </div>
        </div>
      )}

      {/* Message Input */}
      {!isSelectionMode && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedImages([])}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {selectedImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.base64}
                        alt="Selected"
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeSelectedImage(image.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                multiple
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Add photos"
              >
                <Image className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={(!newMessage.trim() && selectedImages.length === 0) || sending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversation;