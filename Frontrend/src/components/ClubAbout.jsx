import React from 'react';
import { useParams } from 'react-router-dom';
import { Target, Award, Users, Calendar, Code, Lightbulb } from 'lucide-react';

export default function ClubAbout() {
  const { clubId } = useParams();

  const clubData = {
    'code-club': {
      name: 'Code Club',
      logo: Code,
      mission: 'To create a collaborative learning environment where students can develop programming skills, work on innovative projects, and prepare for successful careers in technology.',
      vision: 'To be the leading student organization that bridges the gap between academic learning and industry requirements in computer science and technology.',
      values: [
        'Innovation and Creativity',
        'Collaborative Learning',
        'Open Source Contribution',
        'Continuous Learning',
        'Technical Excellence'
      ],
      history: 'Founded in 2019 by a group of passionate computer science students, Code Club has grown from a small study group to one of the most active technical societies on campus. Our club has organized numerous workshops, hackathons, and coding competitions.',
      achievements: [
        'Winner of Inter-University Hackathon 2023',
        'Organized 50+ technical workshops',
        'Contributed to 20+ open source projects',
        '95% placement rate for active members',
        'Partnership with 15+ tech companies'
      ],
      upcomingGoals: [
        'Launch Code Mentorship Program',
        'Establish Alumni Network',
        'Create Industry Partnership Program',
        'Develop Campus Tech Incubator'
      ]
    },
    'e-cell': {
      name: 'E-Cell',
      logo: Lightbulb,
      mission: 'To foster entrepreneurial spirit among students by providing platforms for innovation, mentorship, and startup development, creating job creators rather than job seekers.',
      vision: 'To establish our campus as a leading hub for student entrepreneurship and innovation, contributing to the startup ecosystem of our region.',
      values: [
        'Innovation and Risk-taking',
        'Leadership Development',
        'Social Impact',
        'Sustainability',
        'Networking and Collaboration'
      ],
      history: 'Established in 2020 during the pandemic, E-Cell emerged from the need to support student entrepreneurs facing new challenges. Despite starting virtually, we quickly became a cornerstone for innovation on campus.',
      achievements: [
        '25 startups launched by members',
        '$2M+ in funding raised by alumni startups',
        '100+ pitch sessions conducted',
        'Partnerships with 10 venture capital firms',
        'National Entrepreneurship Award 2023'
      ],
      upcomingGoals: [
        'Launch Student Incubation Center',
        'Establish Angel Investment Network',
        'Create Social Entrepreneurship Track',
        'Develop Industry Mentorship Program'
      ]
    }
  };

  const club = clubData[clubId];
  if (!club) return <div>Club not found</div>;

  const LogoIcon = club.logo;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <LogoIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">About {club.name}</h1>
          <p className="text-gray-600">Learn more about our mission, values, and impact</p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{club.mission}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Award className="w-6 h-6 text-purple-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{club.vision}</p>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {club.values.map((value, index) => (
              <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <span className="text-gray-700 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <div className="flex items-center mb-4">
            <Calendar className="w-6 h-6 text-green-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Our History</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">{club.history}</p>
        </div>

        {/* Achievements & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Key Achievements</h2>
            <div className="space-y-3">
              {club.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Upcoming Goals</h2>
            <div className="space-y-3">
              {club.upcomingGoals.map((goal, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{goal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Join CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-center text-white mt-12">
          <h2 className="text-2xl font-bold mb-4">Ready to Join {club.name}?</h2>
          <p className="mb-6">Be part of our amazing community and contribute to our shared mission</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}