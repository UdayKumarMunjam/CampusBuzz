import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoggingIn: false,
  isAuthenticated: false,
  isCheckingAuth: true,
  unreadMessageCount: 0,

  checkAuth: async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/user/check", {
        withCredentials: true,
      });
      set({ user: res.data.user, isAuthenticated: true });
      console.log(get().user);

      // Fetch unread message count after authentication
      if (res.data.user) {
        await get().fetchUnreadMessageCount();
      }
    } catch (error) {
      // Handle 401 Unauthorized errors gracefully
      if (error.response?.status === 401) {
        console.log("User not authenticated - showing landing page");
        set({ user: null, isAuthenticated: false });
      } else {
        console.log("Error in checkAuth:", error);
        set({ user: null, isAuthenticated: false });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const res = await axios.post("http://localhost:8080/api/user/login", data, {
        withCredentials: true,
      });
      set({ user: res.data.user || null, isAuthenticated: !!res.data.user });
      console.log(get().user);
      toast.success(res.data.message || "Logged in successfully");

      // Fetch unread message count after login
      if (res.data.user) {
        await get().fetchUnreadMessageCount();
        window.location.href = res.data.user.role === 'admin' ? '/' : '/feed';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      console.log(error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axios.post("http://localhost:8080/api/user/logout", {}, {
        withCredentials: true,
      });
      set({ user: null, isAuthenticated: false, unreadMessageCount: 0 });
      toast.success("Logged out successfully");

      // Redirect to landing page after logout
      window.location.href = '/';
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      console.log(error);
      // Even if logout API fails, clear local state and redirect
      set({ user: null, isAuthenticated: false, unreadMessageCount: 0 });
      window.location.href = '/';
    }
  },

  updateProfile: async (formData) => {
    try {
      const res = await axios.put("http://localhost:8080/api/user/profile", formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set({ user: res.data.user });
      toast.success(res.data.message || "Profile updated successfully");
      return { success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, logout user
        set({ user: null, isAuthenticated: false });
        toast.error("Session expired. Please login again.");
        return { success: false, expired: true };
      }
      toast.error(error.response?.data?.message || "Profile update failed");
      console.log(error);
      return { success: false };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const res = await axios.put("http://localhost:8080/api/user/profile",
        { password: passwordData.newPassword },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Password updated successfully");
      return { success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, logout user
        set({ user: null, isAuthenticated: false });
        toast.error("Session expired. Please login again.");
        return { success: false, expired: true };
      }
      toast.error(error.response?.data?.message || "Password change failed");
      console.log(error);
      return { success: false };
    }
  },

  fetchUnreadMessageCount: async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/messages/unread-count", {
        withCredentials: true,
      });
      set({ unreadMessageCount: res.data.unreadCount });
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      set({ unreadMessageCount: 0 });
    }
  },

  updateUnreadMessageCount: (count) => {
    set({ unreadMessageCount: count });
  },

  forgotPassword: async (email) => {
    try {
      const res = await axios.post("http://localhost:8080/api/user/forgot-password", { email });
      toast.success(res.data.message || "Password reset email sent successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
      console.log(error);
      return { success: false };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const res = await axios.post("http://localhost:8080/api/user/reset-password", { token, newPassword });
      toast.success(res.data.message || "Password reset successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      console.log(error);
      return { success: false };
    }
  },

}));
