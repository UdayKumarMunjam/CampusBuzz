import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
export const useEventsStore = create((set, get) => ({
  events: [],
  isLoading: false,
  creating: false,

  // Fetch all events
  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get("http://localhost:8080/api/events/", {
        withCredentials: true,
      });
      set({ events: res.data.events || [] });
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new event (only allowed roles)
  createEvent: async (formData) => {
    set({ creating: true });
    try {
      const res = await axios.post(
        "http://localhost:8080/api/events/",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          },
        }
      );

      if (res.data.success) {
        set({ events: [res.data.event, ...get().events] });
        toast.success(res.data.message || "Event created!");
      }
    } catch (error) {
      console.error("Create event error:", error);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      set({ creating: false });
    }
  },

  // Delete an event (only admin or creator)
  deleteEvent: async (eventId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8080/api/events/${eventId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        set({ events: get().events.filter((e) => e._id !== eventId) });
        toast.success(res.data.message || "Event deleted");
      }
    } catch (error) {
      console.error("Delete event error:", error);
      toast.error("Failed to delete event");
    }
  },

  // Fetch events created by a specific user
  fetchUserEvents: async (userId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/events/user/${userId}`, {
        withCredentials: true,
      });
      return res.data.events || [];
    } catch (error) {
      console.error("Error fetching user events:", error);
      toast.error("Failed to fetch user events");
      return [];
    }
  },
}));
