import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useLostFoundStore = create((set, get) => ({
  items: [],
  loading: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  },

  fetchItems: async (page = 1) => {
    set({ loading: true });
    try {
      const res = await axios.get(`http://localhost:8080/api/lostfound/?page=${page}&limit=6`);
      set({
        items: res.data.items,
        pagination: res.data.pagination
      });
    } catch (err) {
      console.error("Fetch LostFound error:", err);
      toast.error("Failed to load items");
    } finally {
      set({ loading: false });
    }
  },

  createItem: async (formData) => {
    try {
      const res = await axios.post("http://localhost:8080/api/lostfound/", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        set({ items: [res.data.lostFound, ...get().items] });
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating item");
    }
  },

  markResolved: async (id) => {
    try {
      const res = await axios.put(`http://localhost:8080/api/lostfound/resolve/${id}`);
      if (res.data.success) {
        set({
          items: get().items.map(i => i._id === id ? { ...i, status: "resolved" } : i),
        });
        toast.success("Marked as resolved");
      }
    } catch (err) {
      toast.error("Failed to resolve item");
    }
  },

  sendMessage: async (itemId, message) => {
    try {
      const res = await axios.post("http://localhost:8080/api/lostfound/sendMessage", { itemId, message }, { withCredentials: true });
      if (res.data.success) {
        toast.success("Message sent!");
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  },

  deleteItem: async (id) => {
    try {
      const res = await axios.delete(`http://localhost:8080/api/lostfound/${id}`, { withCredentials: true });
      if (res.data.success) {
        set({
          items: get().items.filter(item => item._id !== id),
        });
        toast.success("Item deleted successfully");
      }
    } catch (err) {
      console.error("Delete LostFound error:", err);
      toast.error(err.response?.data?.message || "Failed to delete item");
    }
  }
}));
