import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Calendar, Award, Code, Lightbulb, ChevronRight, Star } from 'lucide-react';
import BackButton from './common/BackButton';

export default function ClubDetails({ user }) {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const clubData = {
    'code-club': {
      name: 'Code Club',
      description: 'A vibrant community of programmers, developers, and tech enthusiasts working together to learn, build, and innovate.',
      logo: Code,
      memberCount: 15,
      founded: '2019',
      rating: 4.8,
      gradient: 'from-blue-500 to-cyan-500',
      image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
      recentActivities: [
        { title: 'React Workshop', date: '2 days ago', type: 'Workshop' },
        { title: 'Hackathon 2024 Winners', date: '1 week ago', type: 'Achievement' },
        { title: 'New Member Orientation', date: '2 weeks ago', type: 'Event' }
      ]
    },
    'e-cell': {
      name: 'E-Cell',
      description: 'Entrepreneurship Cell dedicated to fostering startup culture, innovation, and business development among students.',
      logo: Lightbulb,
      memberCount: 10,
      founded: '2020',
      rating: 4.6,
      gradient: 'from-purple-500 to-pink-500',
      image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
      recentActivities: [
        { title: 'Pitch Competition', date: '1 day ago', type: 'Competition' },
        { title: 'Startup Funding Workshop', date: '5 days ago', type: 'Workshop' },
        { title: 'Alumni Entrepreneur Meet', date: '1 week ago', type: 'Networking' }
      ]
    }
  };

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
                <span>{club.memberCount} members</span>
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
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{club.memberCount}</p>
              <p className="text-sm text-gray-600">Active Members</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">12+</p>
              <p className="text-sm text-gray-600">Events This Year</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {club.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{activity.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{activity.date}</span>
                    <span>•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}