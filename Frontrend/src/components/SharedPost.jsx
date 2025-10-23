import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PostCard from './PostCard';
import { useAuthStore } from '../stores/authStore';

export default function SharedPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching post with ID:', postId);
      const response = await axios.get(`http://localhost:8080/api/posts/${postId}`);
      console.log('Post response:', response.data);
      
      if (response.data.success) {
        setPost(response.data.post);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      console.error('Error details:', error.response?.data);
      if (error.response?.status === 404) {
        setError('Post not found');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Backend server is not running');
      } else {
        setError('Failed to load post');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (user) {
      navigate('/feed');
    } else {
      navigate('/');
    }
  };

  const handleJoinCampusBuzz = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {user ? 'Go to Feed' : 'Go to Home'}
            </button>
            {!user && (
              <button
                onClick={handleJoinCampusBuzz}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Join CampusBuzz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shared Post</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">From CampusBuzz</p>
              </div>
            </div>
            {!user && (
              <button
                onClick={handleJoinCampusBuzz}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Join CampusBuzz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {post && (
          <div className="mb-6">
            <PostCard post={post} />
          </div>
        )}

        {/* Call to Action for Non-Users */}
        {!user && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Join CampusBuzz Community
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect with your campus community, share moments, and discover amazing content like this post.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleJoinCampusBuzz}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
                >
                  Get Started
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={handleJoinCampusBuzz}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
