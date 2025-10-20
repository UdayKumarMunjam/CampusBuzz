import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useAdminUserStore = create((set, get) => ({
  users: [],
  isLoading: false,
  isUpdating: false,

  // Fetch all users
  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get("http://localhost:8080/api/admin/user/all", {
        withCredentials: true,
      });
      set({ users: res.data.users || [] });
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error("Failed to fetch users");
    } finally {
      set({ isLoading: false });
    }
  },

  // Add user
  addUser: async (userData) => {
    set({ isUpdating: true });
    try {
      const res = await axios.post("http://localhost:8080/api/admin/user/add", userData, {
        withCredentials: true,
      });

      if (res.data.success) {
        set({ users: [res.data.user, ...get().users] });
        toast.success(res.data.message || "User added successfully");
        return res.data.user; // Return the created user
      }
    } catch (error) {
      console.error("Add user error:", error);
      toast.error(error.response?.data?.message || "Failed to add user");
      return null; // Return null on error
    } finally {
      set({ isUpdating: false });
    }
  },

  // Edit user
  editUser: async (userId, updates) => {
    set({ isUpdating: true });
    try {
      const res = await axios.put(
        `http://localhost:8080/api/admin/user/edit/${userId}`,
        updates,
        { withCredentials: true }
      );

      if (res.data.success) {
        set({
          users: get().users.map((user) =>
            user._id === userId ? res.data.user : user
          ),
        });
        toast.success(res.data.message || "User updated");
      }
    } catch (error) {
      console.error("Edit user error:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      set({ isUpdating: false });
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    set({ isUpdating: true });
    try {
      const res = await axios.delete(
        `http://localhost:8080/api/admin/user/delete/${userId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        set({ users: get().users.filter((user) => user._id !== userId) });
        toast.success(res.data.message || "User deleted");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      set({ isUpdating: false });
    }
  },
}));
