import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, BookOpen, Code, Lightbulb, Filter, Plus } from 'lucide-react';
import { useActivityStore } from '../stores/activityStore';
import { useAuthStore } from '../stores/authStore';
import AddActivityModal from './AddActivityModal';

export default function ClubActivities() {
  const { clubId } = useParams();
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const { activities, isLoading, fetchActivitiesByClub } = useActivityStore();
  const { user } = useAuthStore();

  const clubNames = {
    'code-club': 'Code Club',
    'e-cell': 'E-Cell'
  };

  useEffect(() => {
    if (clubId) {
      fetchActivitiesByClub(clubId);
    }
  }, [clubId, fetchActivitiesByClub]);

  const clubActivities = activities || [];
  
  const filteredActivities = clubActivities.filter(activity => {
    if (filterType === 'all') return true;
    return activity.type === filterType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'competition': return 'bg-red-100 text-red-800';
      case 'project': return 'bg-blue-100 text-blue-800';
      case 'seminar': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'workshop': return BookOpen;
      case 'competition': return Trophy;
      case 'project': return Code;
      case 'seminar': return BookOpen;
      default: return BookOpen;
    }
  };

  const canAddActivity = () => {
    return user && (user.role === 'admin' || user.role === 'teacher' || user.role === 'club_head');
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {clubNames[clubId]} Activities
          </h1>
          <p className="text-gray-600">Explore our past and upcoming events, workshops, and projects</p>
        </div>
        {canAddActivity() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Add New Activity
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'workshop', 'competition', 'project', 'seminar'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filterType === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => {
            const IconComponent = getIcon(activity.type);
            return (
              <div key={activity._id} className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gradient-to-r from-purple-200 to-pink-200 hover:border-purple-300 transform hover:-translate-y-3 hover:scale-105 relative group cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-xl pointer-events-none group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-indigo-500/10 transition-all duration-300"></div>
                <div className="relative z-10 p-4">
                  <div className="relative mb-4">
                    {activity.image ? (
                      <img src={activity.image} className="w-full h-40 object-cover rounded-lg shadow-md"/>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg shadow-inner">
                        <div className="text-center">
                          <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <span className="text-gray-500 text-sm font-medium">No Image</span>
                        </div>
                      </div>
                    )}

                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{activity.title}</h3>
                    <div className="text-gray-600 text-sm mb-3">
                      <p className="transition-all duration-300 break-words leading-relaxed line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 space-y-2 mb-4">
                      <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
                        <Calendar className="w-4 h-4 mr-2 text-purple-500"/>{new Date(activity.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {activity.time}
                      </div>
                      <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500"/>{activity.location}
                      </div>
                      <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
                        <Users className="w-4 h-4 mr-2 text-purple-500"/>{activity.attendees}/{activity.maxAttendees} attendees
                      </div>
                    </div>

                    {activity.status === "past" && (
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
      )}

      {filteredActivities.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No activities found for the selected filter.</p>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <AddActivityModal
          clubId={clubId}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}