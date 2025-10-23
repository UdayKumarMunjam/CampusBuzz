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
    <div className="p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* Banner Section */}
      <div className="mb-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                <Calendar className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  Campus Events
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">Discover exciting events, workshops, and activities</p>
              </div>
            </div>
          </div>
          {canCreateEvents && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="w-6 h-6" />
              <span>Create Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} onReset={resetSearch} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-8 overflow-x-auto">
        {["all", "upcoming"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
              filterStatus === status
                ? "bg-purple-600 text-white shadow-lg hover:bg-purple-700"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Plus className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Event</h2>
                    <p className="text-gray-600 dark:text-gray-300">Organize an amazing campus event</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredEvents.map(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
            const showDesc = expandedDescriptions[event._id];
            return (
              <div key={event._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 transform hover:-translate-y-2 relative group overflow-hidden">
                <div className="relative">
                  {/* Event Image */}
                  <div className="relative">
                    {event.image ? (
                      <img src={event.image} className="w-full h-56 object-cover rounded-t-2xl"/>
                    ) : (
                      <div className="w-full h-56 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-t-2xl">
                        <div className="text-center">
                          <div className="p-4 bg-gray-200 dark:bg-gray-600 rounded-full mb-3 mx-auto w-fit">
                            <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">No Image Available</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Event Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === "past" 
                          ? "bg-gray-500 text-white" 
                          : "bg-green-500 text-white"
                      }`}>
                        {event.status === "past" ? "Completed" : "Upcoming"}
                      </span>
                    </div>
                    
                    {canDeleteEvents && (
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6">
                    {/* Event Title */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">{event.title}</h3>
                    
                    {/* Event Description */}
                    <div className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      <p className={`transition-all duration-300 break-words leading-relaxed ${!showDesc ? 'line-clamp-2' : ''}`}>
                        {event.description}
                      </p>
                      {event.description.length > 100 && (
                        <button
                          onClick={() => setExpandedDescriptions({ ...expandedDescriptions, [event._id]: !showDesc })}
                          className="text-purple-600 dark:text-purple-400 text-xs mt-2 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
                        >
                          {showDesc ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                    
                    {/* Event Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded mr-3">
                          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400"/>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{formattedDate} at {event.time}</span>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded mr-3">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded mr-3">
                          <Users className="w-4 h-4 text-green-600 dark:text-green-400"/>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{event.maxAttendees} max attendees</span>
                      </div>
                      
                      {event.registrationLink && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-semibold"
                          >
                            <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded mr-3">
                              <ExternalLink className="w-4 h-4"/>
                            </div>
                            Register for Event
                          </a>
                        </div>
                      )}
                    </div>
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
