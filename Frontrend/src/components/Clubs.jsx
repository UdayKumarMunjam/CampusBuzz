import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Code, Lightbulb, Calendar, ChevronRight } from 'lucide-react';

export default function Clubs() {
  const navigate = useNavigate();

  const clubs = [
    {
      id: 'code-club',
      name: 'Code Club',
      description: 'Learn programming, build projects, and collaborate with fellow developers',
      logo: Code,
      memberCount: 234,
      activeProjects: 12,
      upcomingEvents: 3,
      gradient: 'from-blue-500 to-cyan-500',
      image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'e-cell',
      name: 'E-Cell',
      description: 'Entrepreneurship cell fostering innovation and startup culture on campus',
      logo: Lightbulb,
      memberCount: 189,
      activeProjects: 8,
      upcomingEvents: 2,
      gradient: 'from-purple-500 to-pink-500',
      image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Clubs</h1>
        <p className="text-gray-600">Explore communities like E-Cell and Code Club, learn new skills, and make lasting connections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {clubs.map((club) => {
          const LogoIcon = club.logo;
          return (
            <div
              key={club.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/clubs/${club.id}`)}
            >
              <div className="relative h-40 lg:h-48">
                <img
                  src={club.image}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${club.gradient} opacity-80`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <LogoIcon className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-2 lg:mb-4" />
                    <h2 className="text-xl lg:text-2xl font-bold">{club.name}</h2>
                  </div>
                </div>
              </div>
              
              <div className="p-4 lg:p-6">
                <p className="text-gray-600 mb-4 text-sm lg:text-base">{club.description}</p>
                
                <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                    </div>
                    <p className="text-lg lg:text-2xl font-bold text-gray-800">{club.memberCount}</p>
                    <p className="text-xs lg:text-xs text-gray-500">Members</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Code className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                    </div>
                    <p className="text-lg lg:text-2xl font-bold text-gray-800">{club.activeProjects}</p>
                    <p className="text-xs lg:text-xs text-gray-500">Projects</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" />
                    </div>
                    <p className="text-lg lg:text-2xl font-bold text-gray-800">{club.upcomingEvents}</p>
                    <p className="text-xs lg:text-xs text-gray-500">Events</p>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 lg:py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 text-sm lg:text-base">
                  <span>Explore Club</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}