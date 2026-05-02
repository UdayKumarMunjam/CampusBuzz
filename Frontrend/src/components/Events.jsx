import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Plus, Users, Trash2, Camera, ExternalLink, X } from "lucide-react";
import { useEventsStore } from "../stores/eventStore";
import SearchBar from "./common/searchBar.jsx";
import { useSearch } from "../hooks/useSearch.js";
import SkeletonPost from "./common/SkeletonPost.jsx";
import InteractiveForm from "./common/InteractiveForm.jsx";
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

  const eventFormFields = [
    {
      name: 'title',
      label: 'Event Title',
      type: 'text',
      placeholder: 'Enter event title...',
      required: true
    },
    {
      name: 'organizer',
      label: 'Organizer',
      type: 'text',
      placeholder: 'Who is organizing?',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe your event...',
      rows: 4,
      required: true
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true
    },
    {
      name: 'time',
      label: 'Time',
      type: 'time',
      required: true
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Where will it be held?',
      required: true
    },
    {
      name: 'maxAttendees',
      label: 'Max Attendees',
      type: 'number',
      placeholder: 'Maximum number of attendees',
      required: true,
      validation: (value) => {
        const num = parseInt(value);
        if (num < 1) return 'Must be at least 1';
        if (num > 10000) return 'Must be less than 10,000';
        return true;
      }
    },
    {
      name: 'registrationLink',
      label: 'Registration Link',
      type: 'url',
      placeholder: 'https://example.com/register (optional)'
    }
  ];

  const handleCreateEvent = async (formData) => {
    try {
      await createEvent(formData);
      setShowCreateModal(false);
      toast.success("Event created successfully!");
    } catch (error) {
      toast.error("Failed to create event");
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
    <div className="p-4 lg:p-8 min-h-screen">

      {/* Banner Section */}
      <div className="mb-10 bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-2xl">
                <Calendar className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  Campus Events
                </h1>
                <p className="text-lg text-purple-200">Discover exciting events, workshops, and activities</p>
              </div>
            </div>
          </div>
          {canCreateEvents && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-3 shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1"
            >
              <Plus className="w-6 h-6" />
              <span>Create Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl p-6">
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
                : "bg-white/10 backdrop-blur-xl text-purple-200 border border-purple-500/20 hover:border-purple-400/40 hover:shadow-md hover:bg-white/20"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Interactive Create Form */}
      {showCreateModal && (
        <InteractiveForm
          title="Create New Event"
          fields={eventFormFields}
          onSubmit={handleCreateEvent}
          submitText="Create Event"
          isLoading={creating}
          allowFileUpload={true}
          acceptedFileTypes="image/*"
          maxFiles={1}
          fileFieldName="media"
          onClose={() => setShowCreateModal(false)}
        />
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
              <div key={event._id} className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-400/40 transform hover:-translate-y-2 relative group overflow-hidden">
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
                    <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">{event.title}</h3>
                    
                    {/* Event Description */}
                    <div className="text-purple-100 text-sm mb-4">
                      <p className={`transition-all duration-300 break-words leading-relaxed ${!showDesc ? 'line-clamp-2' : ''}`}>
                        {event.description}
                      </p>
                      {event.description.length > 100 && (
                        <button
                          onClick={() => setExpandedDescriptions({ ...expandedDescriptions, [event._id]: !showDesc })}
                          className="text-purple-400 text-xs mt-2 hover:text-purple-300 transition-colors font-medium"
                        >
                          {showDesc ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                    
                    {/* Event Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
                        <div className="p-1 bg-purple-500/20 rounded mr-3">
                          <Calendar className="w-4 h-4 text-purple-400"/>
                        </div>
                        <span className="text-white font-medium">{formattedDate} at {event.time}</span>
                      </div>
                      
                      <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
                        <div className="p-1 bg-blue-500/20 rounded mr-3">
                          <MapPin className="w-4 h-4 text-blue-400"/>
                        </div>
                        <span className="text-white font-medium">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
                        <div className="p-1 bg-green-500/20 rounded mr-3">
                          <Users className="w-4 h-4 text-green-400"/>
                        </div>
                        <span className="text-white font-medium">{event.maxAttendees} max attendees</span>
                      </div>
                      
                      {event.registrationLink && (
                        <div className="bg-purple-500/10 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-purple-300 hover:text-purple-200 transition-colors font-semibold"
                          >
                            <div className="p-1 bg-purple-500/20 rounded mr-3">
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
