import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Plus, Users, Trash2, Camera, ExternalLink, X } from "lucide-react";
import { useEventsStore } from "../stores/eventStore";
import SearchBar from "./common/searchBar.jsx";
import { useSearch } from "../hooks/useSearch.js";
import SkeletonPost from "./common/SkeletonPost.jsx";
import toast from "react-hot-toast";

export default function Events({ user }) {
  const { events, fetchEvents, createEvent, deleteEvent, isLoading, creating } = useEventsStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    organizer: "",
    maxAttendees: "",
    image: "",
    imageFile: null,
    registrationLink: ""
  });

  const { searchTerm, handleSearchChange, resetSearch } = useSearch();

  const canCreateEvents = ["admin", "club_head", "teacher"].includes(user.role);
  const canDeleteEvents = ["admin", "teacher"].includes(user.role);
  const today = new Date();

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events
    .map(event => ({ ...event, status: new Date(event.date) >= today ? "upcoming" : "past" }))
    .filter(event => {
      const matchesStatus = filterStatus === "upcoming" ? new Date(event.date) >= today : true;
      const matchesSearch =
        searchTerm === "" ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('date', newEvent.date);
      formData.append('time', newEvent.time);
      formData.append('location', newEvent.location);
      formData.append('organizer', newEvent.organizer);
      formData.append('maxAttendees', newEvent.maxAttendees);
      formData.append('registrationLink', newEvent.registrationLink);
      
      // Handle image file if it exists
      if (newEvent.imageFile) {
        formData.append('media', newEvent.imageFile);
      }
      
      await createEvent(formData);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        organizer: "",
        maxAttendees: "",
        image: "",
        imageFile: null,
        registrationLink: ""
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewEvent({
        ...newEvent,
        image: reader.result,
        imageFile: file
      });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 min-h-screen">

      {/* Banner Section */}
      <div className="mb-10 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-700/20"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-2 flex items-center space-x-3">
              <span className="text-6xl">🎉</span>
              <span>CampusBuzz Events</span>
            </h1>
            <p className="text-lg opacity-90">Discover exciting CampusBuzz events, workshops, and activities</p>
          </div>
          {canCreateEvents && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} onReset={resetSearch} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-3 mb-8 overflow-x-auto">
        {["all", "upcoming"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
              filterStatus === status
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:shadow-md"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-indigo-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Create New Event</h2>
                    <p className="text-purple-100">Organize an amazing CampusBuzz event</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
              <div className="space-y-6">
                {/* Title and Organizer */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Event Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter event title..."
                        value={newEvent.title}
                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-gray-700 placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Organizer</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Who is organizing?"
                        value={newEvent.organizer}
                        onChange={e => setNewEvent({ ...newEvent, organizer: e.target.value })}
                        className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-gray-700 placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Date, Time, Location, Max Attendees */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all bg-white/80 backdrop-blur-sm shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all bg-white/80 backdrop-blur-sm shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Where will it be held?"
                        value={newEvent.location}
                        onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-gray-700 placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Max Attendees</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Maximum attendees"
                        value={newEvent.maxAttendees}
                        onChange={e => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
                        className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-gray-700 placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Description</label>
                  <div className="relative">
                    <textarea
                      placeholder="Describe the event in detail..."
                      value={newEvent.description}
                      onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all resize-none h-32 text-gray-700 placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Event Image (Optional)</label>
                  <div className="relative">
                    <label className="flex items-center space-x-3 cursor-pointer bg-white/80 backdrop-blur-sm border-2 border-purple-200 border-dashed rounded-xl p-4 hover:border-purple-400 transition-all shadow-lg">
                      <Camera className="w-6 h-6 text-purple-500" />
                      <span className="text-gray-600 font-medium">Click to add event image</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                  </div>
                  {newEvent.image && (
                    <div className="relative">
                      <img src={newEvent.image} className="w-full h-48 object-cover rounded-xl border-2 border-purple-200 shadow-lg" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                    </div>
                  )}
                </div>

                {/* Registration Link */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Registration Link (Optional)</label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://registration-link.com"
                      value={newEvent.registrationLink}
                      onChange={e => setNewEvent({ ...newEvent, registrationLink: e.target.value })}
                      className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-gray-700 placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-4 mt-8 pt-6 border-t border-purple-200">
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-8 rounded-2xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>{creating ? "Creating..." : "Create Event"}</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-8 rounded-2xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonPost key={index} />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEvents.map(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
            const showDesc = expandedDescriptions[event._id];
            return (
              <div key={event._id} className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gradient-to-r from-purple-200 to-pink-200 hover:border-purple-300 transform hover:-translate-y-3 hover:scale-105 relative group cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-xl pointer-events-none group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-indigo-500/10 transition-all duration-300"></div>
                <div className="relative z-10 p-4">
                  <div className="relative mb-4">
                    {event.image ? (
                      <img src={event.image} className="w-full h-40 object-cover rounded-lg shadow-md"/>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg shadow-inner">
                        <div className="text-center">
                          <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <span className="text-gray-500 text-sm font-medium">No Image</span>
                        </div>
                      </div>
                    )}
                    {canDeleteEvents && (
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{event.title}</h3>
                    <div className="text-gray-600 text-sm mb-3">
                      <p className={`transition-all duration-300 break-words leading-relaxed ${!showDesc ? 'line-clamp-2' : ''}`}>
                        {event.description}
                      </p>
                      {event.description.length > 100 && (
                        <button
                          onClick={() => setExpandedDescriptions({ ...expandedDescriptions, [event._id]: !showDesc })}
                          className="text-purple-500 text-xs mt-2 hover:text-purple-700 transition-colors font-medium"
                        >
                          {showDesc ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 space-y-2 mb-4">
                      <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
                        <Calendar className="w-4 h-4 mr-2 text-purple-500"/>{formattedDate} at {event.time}
                      </div>
                      <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500"/>{event.location}
                      </div>
                      <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
                        <Users className="w-4 h-4 mr-2 text-purple-500"/>{event.maxAttendees} max attendees
                      </div>
                      {event.registrationLink && (
                        <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
                          <ExternalLink className="w-4 h-4 mr-2 text-purple-500"/>
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 underline transition-colors font-medium"
                          >
                            Register Here
                          </a>
                        </div>
                      )}
                    </div>
                    {event.status === "past" && (
                      <span className="inline-block text-sm text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full font-medium shadow-sm">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No events found</p>
      )}
    </div>
  );
}
