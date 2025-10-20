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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Campus Clubs</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Discover vibrant communities, learn new skills, collaborate on exciting projects, and build lasting connections with fellow students</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {clubs.map((club) => {
          const LogoIcon = club.logo;
          return (
            <div
              key={club.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer border border-gray-100"
              onClick={() => navigate(`/clubs/${club.id}`)}
            >
              <div className="relative h-48 lg:h-56 overflow-hidden">
                <img
                  src={club.image}
                  alt={club.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${club.gradient} opacity-90`} />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="text-center text-white">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 inline-block mb-4">
                      <LogoIcon className="w-12 h-12 lg:w-16 lg:h-16" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold drop-shadow-lg">{club.name}</h2>
                  </div>
                </div>
              </div>
              
              <div className="p-6 lg:p-8">
                <p className="text-gray-700 mb-6 text-base leading-relaxed">{club.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{club.memberCount}</p>
                    <p className="text-sm text-gray-600 font-medium">Members</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Code className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{club.activeProjects}</p>
                    <p className="text-sm text-gray-600 font-medium">Projects</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{club.upcomingEvents}</p>
                    <p className="text-sm text-gray-600 font-medium">Events</p>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <span>Explore Club</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}