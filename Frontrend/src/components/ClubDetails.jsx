import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Calendar, Award, Code, Lightbulb, ChevronRight, Star, Activity } from 'lucide-react';
import BackButton from './common/BackButton';
import axios from 'axios';

export default function ClubDetails({ user }) {
  const { clubId } = useParams();
  const navigate = useNavigate();
  
  // State for backend data
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static club data (About section)
  const clubData = {
    'code-club': {
      name: 'Code Club',
      description: 'A vibrant community of programmers, developers, and tech enthusiasts working together to learn, build, and innovate.',
      logo: Code,
      founded: '2019',
      rating: 4.8,
      gradient: 'from-blue-500 to-cyan-500',
      image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
      about: {
        mission: 'To create a collaborative environment where students can learn programming, develop technical skills, and work on innovative projects.',
        vision: 'To be the leading tech community on campus, fostering innovation and preparing students for successful careers in technology.',
        activities: ['Weekly coding workshops', 'Hackathons and competitions', 'Open source contributions', 'Tech talks and seminars', 'Project collaborations']
      }
    },
    'e-cell': {
      name: 'E-Cell',
      description: 'Entrepreneurship Cell dedicated to fostering startup culture, innovation, and business development among students.',
      logo: Lightbulb,
      founded: '2020',
      rating: 4.6,
      gradient: 'from-purple-500 to-pink-500',
      image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
      about: {
        mission: 'To nurture entrepreneurial mindset among students and provide platform for startup ideas to flourish.',
        vision: 'To create successful entrepreneurs who will contribute to economic growth and innovation.',
        activities: ['Startup pitch competitions', 'Business plan workshops', 'Mentorship programs', 'Investor networking events', 'Entrepreneurship bootcamps']
      }
    }
  };

  // Fetch backend data
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        setLoading(true);
        
        // Fetch members from backend
        const membersResponse = await axios.get(`/api/clubs/${clubId}/members`);
        setMembers(membersResponse.data.members || []);
        
        // Fetch events from backend
        const eventsResponse = await axios.get(`/api/clubs/${clubId}/events`);
        setEvents(eventsResponse.data.events || []);
        
        // Fetch recent activities from backend
        const activitiesResponse = await axios.get(`/api/clubs/${clubId}/activities`);
        setRecentActivities(activitiesResponse.data.activities || []);
        
      } catch (error) {
        console.error('Error fetching club data:', error);
        // Set default empty arrays on error
        setMembers([]);
        setEvents([]);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) {
      fetchClubData();
    }
  }, [clubId]);

  const club = clubData[clubId];
  if (!club) return <div>Club not found</div>;

  const LogoIcon = club.logo;

  const menuItems = [
    { label: 'Members', path: `/clubs/${clubId}/members`, icon: Users },
    { label: 'About', path: `/clubs/${clubId}/about`, icon: Award },
    { label: 'Activities', path: `/clubs/${clubId}/activities`, icon: Calendar },
  ];

  if (user.role === 'admin' || user.role === 'club_head') {
    menuItems.push({ label: 'Manage Members', path: `/clubs/${clubId}/manage`, icon: Users });
  }

  return (
    <div className="p-8">
      <BackButton className="mb-6" />
      
      {/* Hero Section */}
      <div className="relative rounded-lg overflow-hidden mb-8">
        <div className="h-64 relative">
          <img
            src={club.image}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${club.gradient} opacity-80`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <LogoIcon className="w-20 h-20 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-300 fill-current" />
                  <span className="ml-1">{club.rating}</span>
                </div>
                <span>•</span>
                <span>{loading ? '...' : members.length} members</span>
                <span>•</span>
                <span>Since {club.founded}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  <span className="font-medium text-gray-700 group-hover:text-blue-600">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Club Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About {club.name}</h2>
          <p className="text-gray-600 mb-6">{club.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {loading ? '...' : members.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Active Members</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Calendar className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {loading ? '...' : events.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Upcoming Events</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activities</h2>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 dark:text-white">{activity.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full text-xs">
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}