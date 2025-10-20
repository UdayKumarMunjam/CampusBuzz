import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useNoticeStore = create((set, get) => ({
  notices: [],
  isLoading: false,
  creating: false,

  // Fetch all notices
  fetchNotices: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get("http://localhost:8080/api/notices/", {
        withCredentials: true,
      });
      set({ notices: res.data.notices || [] });
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to fetch notices");
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new notice (only allowed roles)
  createNotice: async (formData) => {
    set({ creating: true });
    try {
      const res = await axios.post(
        "http://localhost:8080/api/notices/",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        set({ notices: [res.data.notice, ...get().notices] });
        toast.success(res.data.message || "Notice created!");
      }
    } catch (error) {
      console.error("Create notice error:", error);
      toast.error(error.response?.data?.message || "Failed to create notice");
    } finally {
      set({ creating: false });
    }
  },

  // Delete a notice (only admin)
  deleteNotice: async (noticeId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8080/api/notices/${noticeId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        set({ notices: get().notices.filter((n) => n._id !== noticeId) });
        toast.success(res.data.message || "Notice deleted");
      }
    } catch (error) {
      console.error("Delete notice error:", error);
      toast.error(error.response?.data?.message || "Failed to delete notice");
    }
  },
}));
