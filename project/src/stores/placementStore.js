import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const usePlacementStore = create((set, get) => ({
  placements: [],
  years: [],
  isLoading: false,
  isUpdating: false,

  // Fetch all placement achievements
  fetchPlacements: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`http://localhost:8080/api/placements`, {
        withCredentials: true,
      });
      set({ placements: res.data.placements || [] });
    } catch (error) {
      console.error("Fetch placements error:", error);
      toast.error("Failed to fetch placement achievements");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch available years for filtering
  fetchYears: async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/placements/years", {
        withCredentials: true,
      });
      set({ years: res.data.years || [] });
    } catch (error) {
      console.error("Fetch years error:", error);
    }
  },

  // Add placement achievement
  addPlacement: async (placementData) => {
    set({ isUpdating: true });
    try {
      const res = await axios.post("http://localhost:8080/api/placements", placementData, {
        withCredentials: true,
      });

      if (res.data.success) {
        set({ placements: [res.data.placement, ...get().placements] });
        toast.success(res.data.message || "Placement achievement added successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to add placement achievement");
        return false;
      }
    } catch (error) {
      console.error("Add placement error:", error);
      toast.error(error.response?.data?.message || "Failed to add placement achievement");
      return false;
    } finally {
      set({ isUpdating: false });
    }
  },

  // Delete placement achievement
  deletePlacement: async (placementId) => {
    set({ isUpdating: true });
    try {
      const res = await axios.delete(`http://localhost:8080/api/placements/${placementId}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        set({ placements: get().placements.filter((placement) => placement._id !== placementId) });
        toast.success(res.data.message || "Placement achievement deleted");
      }
    } catch (error) {
      console.error("Delete placement error:", error);
      toast.error(error.response?.data?.message || "Failed to delete placement achievement");
    } finally {
      set({ isUpdating: false });
    }
  },
}));