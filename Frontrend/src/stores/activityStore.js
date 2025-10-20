import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useActivityStore = create((set, get) => ({
  activities: [],
  isLoading: false,
  error: null,

  // Fetch activities by club
  fetchActivitiesByClub: async (clubId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`http://localhost:8080/api/activities/club/${clubId}`);
      set({ activities: res.data.activities, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch activities";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return { success: false };
    }
  },

  // Create new activity
  createActivity: async (activityData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post("http://localhost:8080/api/activities", activityData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({
        activities: [...state.activities, res.data.activity],
        isLoading: false
      }));
      toast.success(res.data.message || "Activity created successfully");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create activity";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return { success: false };
    }
  },

  // Update activity
  updateActivity: async (activityId, activityData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.put(`http://localhost:8080/api/activities/${activityId}`, activityData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({
        activities: state.activities.map(activity =>
          activity._id === activityId ? res.data.activity : activity
        ),
        isLoading: false
      }));
      toast.success(res.data.message || "Activity updated successfully");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update activity";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return { success: false };
    }
  },

  // Delete activity
  deleteActivity: async (activityId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.delete(`http://localhost:8080/api/activities/${activityId}`, {
        withCredentials: true,
      });
      set((state) => ({
        activities: state.activities.filter(activity => activity._id !== activityId),
        isLoading: false
      }));
      toast.success(res.data.message || "Activity deleted successfully");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete activity";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return { success: false };
    }
  },

  // Clear activities
  clearActivities: () => {
    set({ activities: [], error: null });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  }
}));