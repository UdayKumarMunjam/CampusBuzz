import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Crown, Star, Mail, User } from 'lucide-react';
import axios from 'axios';

export default function ClubMembers() {
  const { clubId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const clubNames = {
    'code-club': 'Code Club',
    'e-cell': 'E-Cell'
  };


  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        console.log(`Fetching members for club: ${clubId}`);
        const res = await axios.get(`http://localhost:8080/api/user/club/${clubId}/members`);
        console.log('API Response:', res.data);

        const mappedMembers = res.data.members.map(member => ({
          id: member._id,
          name: member.name,
          role: member.role,
          email: member.email,
          avatar: member.avatar,
          joinDate: new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          contributions: member.posts || 0, // Using posts as contributions
          isLeader: member.role === 'President' || member.role === 'Vice President'
        }));

        console.log('Mapped members:', mappedMembers);
        setMembers(mappedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [clubId]);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const leaders = filteredMembers.filter(member => member.isLeader);
  const regularMembers = filteredMembers.filter(member => !member.isLeader);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {clubNames[clubId]} Members
        </h1>
        <p className="text-gray-600">Meet the amazing people who make our community thrive</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading members...</p>
        </div>
      ) : (
        <>
          {/* Leadership Team */}
          {leaders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Crown className="w-6 h-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Leadership Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaders.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-blue-600 font-medium">{member.role}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{member.contributions} contributions</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Joined {member.joinDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Members */}
      {regularMembers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-gray-600">{member.role}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{member.contributions} contributions</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Joined {member.joinDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No members found matching your search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}