import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

export const useFeedStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  uploading: false,

  // Fetch all posts
  fetchPosts: async (limit = 50) => {
    set({ isLoading: true });
    try {
      const res = await axios.get(
        `${API}/api/posts/?limit=${limit}`,
        { withCredentials: true }
      );
      set({ posts: res.data.posts || [] });
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new post
  createPost: async (formData) => {
    set({ uploading: true });
    try {
      const res = await axios.post(
        `${API}/api/posts/`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        }
      );

      if (res.data.success) {
        set({ posts: [res.data.post, ...get().posts] });
        toast.success(res.data.message || "Post created!");
      }
    } catch (error) {
      console.error("Create post error:", error);
      toast.error("Failed to create post");
    } finally {
      set({ uploading: false });
    }
  },

  // Like/unlike a post
  likePost: async (postId) => {
    try {
      const res = await axios.put(
        `${API}/api/posts/like/${postId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        set({
          posts: get().posts.map((post) =>
            post._id === postId ? res.data.post : post
          ),
        });
      }
    } catch (error) {
      console.error("Like/unlike error:", error);
      toast.error("Failed to like/unlike post");
    }
  },

  // Delete a post
  deletePost: async (postId) => {
    try {
      const res = await axios.delete(
        `${API}/api/posts/${postId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        set({
          posts: get().posts.filter((post) => post._id !== postId),
        });
        toast.success(res.data.message || "Post deleted");
      }
    } catch (error) {
      console.error("Delete post error:", error);
      toast.error("Failed to delete post");
    }
  },

  // Fetch user profile
  fetchUserProfile: async (userId) => {
    try {
      const res = await axios.get(
        `${API}/api/user/profile/${userId}`,
        { withCredentials: true }
      );
      return res.data.user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to fetch user profile");
      return null;
    }
  },

  // Add comment
  addComment: async (postId, content) => {
    try {
      const res = await axios.post(
        `${API}/api/posts/comment/${postId}`,
        { content },
        { withCredentials: true }
      );

      if (res.data.success) {
        set({
          posts: get().posts.map((post) =>
            post._id === postId ? res.data.post : post
          ),
        });
        toast.success("Comment added!");
      }
    } catch (error) {
      console.error("Add comment error:", error);
      toast.error("Failed to add comment");
    }
  },

  // Follow/unfollow
  followUser: async (userId) => {
    try {
      const res = await axios.post(
        `${API}/api/user/follow/${userId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        return res.data.isFollowing;
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
      toast.error("Failed to follow/unfollow user");
      return null;
    }
  },

  // Fetch posts of a user
  fetchUserPosts: async (userId) => {
    try {
      const res = await axios.get(
        `${API}/api/posts/user/${userId}`,
        { withCredentials: true }
      );
      return res.data.posts || [];
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Failed to fetch user posts");
      return [];
    }
  },
}));