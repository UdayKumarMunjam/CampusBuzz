import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useFeedStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  uploading: false,

  // Fetch all posts
  fetchPosts: async (limit = 50) => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`http://localhost:8080/api/posts/?limit=${limit}`, {
        withCredentials: true,
      });
      // console.log('Fetched posts from API:', res.data.posts.map(p => ({ id: p._id, media: p.media, mediaUrl: p.mediaUrl, mediaType: p.mediaType, content: p.content })));
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
        "http://localhost:8080/api/posts/",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000, // 60 seconds timeout for file uploads
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
        `http://localhost:8080/api/posts/like/${postId}`,
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
        `http://localhost:8080/api/posts/${postId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        set({ posts: get().posts.filter((post) => post._id !== postId) });
        toast.success(res.data.message || "Post deleted");
      }
    } catch (error) {
      console.error("Delete post error:", error);
      toast.error("Failed to delete post");
    }
  },
  // Fetch user profile by ID
  fetchUserProfile: async (userId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
        withCredentials: true,
      });
      return res.data.user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to fetch user profile");
      return null;
    }
  },

  // Add comment to a post
  addComment: async (postId, content) => {
    try {
      const res = await axios.post(
        `http://localhost:8080/api/posts/comment/${postId}`,
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

  // Follow/unfollow a user
  followUser: async (userId) => {
    try {
      const res = await axios.post(
        `http://localhost:8080/api/user/follow/${userId}`,
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

  // Fetch posts by specific user
  fetchUserPosts: async (userId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/posts/user/${userId}`, {
        withCredentials: true,
      });
      return res.data.posts || [];
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Failed to fetch user posts");
      return [];
    }
  },
}));
