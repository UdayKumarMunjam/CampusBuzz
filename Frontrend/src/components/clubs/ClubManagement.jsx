import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Trash2, Crown, Users, Search, Mail } from 'lucide-react';
import BackButton from '../common/BackButton';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ClubManagement({ user }) {
  const { clubId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const clubNames = {
    'code-club': 'Code Club',
    'e-cell': 'E-Cell'
  };


  const canManageClub = user.role === 'admin' || user.role === 'club_head';

  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/user/club/${clubId}/members`, {
          withCredentials: true,
        });
        setMembers(res.data.members.map(member => ({
          id: member._id,
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          role: member.role,
          joinDate: new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          isActive: member.status === 'active',
          isLeader: member.role === 'President' || member.role === 'Vice President'
        })));
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load club members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [clubId]);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = async () => {
    if (newMemberName && newMemberEmail) {
      try {
        const res = await axios.post('http://localhost:8080/api/user/club/member/add', {
          name: newMemberName,
          email: newMemberEmail,
          role: newMemberRole,
          clubId: clubId
        }, {
          withCredentials: true,
        });

        toast.success(res.data.message || 'Member added successfully');

        // Refresh members list
        const membersRes = await axios.get(`http://localhost:8080/api/user/club/${clubId}/members`, {
          withCredentials: true,
        });
        setMembers(membersRes.data.members.map(member => ({
          id: member._id,
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          role: member.role,
          joinDate: new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          isActive: member.status === 'active',
          isLeader: member.role === 'President' || member.role === 'Vice President'
        })));

        setNewMemberName('');
        setNewMemberRole('Member');
        setNewMemberEmail('');
        setShowAddMemberModal(false);
      } catch (error) {
        console.error('Error adding member:', error);
        toast.error(error.response?.data?.message || 'Failed to add member');
      }
    }
  };

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter(member => member.id !== memberId));
  };

  const handleToggleActive = (memberId) => {
    setMembers(members.map(member =>
      member.id === memberId
        ? { ...member, isActive: !member.isActive }
        : member
    ));
  };

  const handlePromoteToLeader = (memberId) => {
    setMembers(members.map(member =>
      member.id === memberId
        ? { ...member, isLeader: true, role: 'Leader' }
        : member
    ));
  };

  if (!canManageClub) {
    return (
      <div className="p-4 lg:p-8">
        <BackButton className="mb-6" />
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Access Restricted</p>
          <p className="text-gray-400">Only club heads and admins can manage club members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <BackButton className="mb-6" />
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              Manage {clubNames[clubId]} Members
            </h1>
            <p className="text-gray-600">Add, remove, and manage club members</p>
          </div>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden lg:inline">Add Member</span>
            <span className="lg:hidden">Add</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
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

      {/* Members List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Club Members ({loading ? '...' : filteredMembers.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-4 lg:p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-4 lg:p-6 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No members found</p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div key={member.id} className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover"
                      />
                      {member.isLeader && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {!member.isActive && (
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">INACTIVE</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm lg:text-base">{member.name}</h3>
                      <p className="text-blue-600 font-medium text-sm">{member.role}</p>
                      <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
                        <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>{member.email}</span>
                      </div>
                      <p className="text-xs text-gray-400">Joined {member.joinDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!member.isLeader && (
                      <button
                        onClick={() => handlePromoteToLeader(member.id)}
                        className="bg-yellow-100 text-yellow-800 px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm hover:bg-yellow-200 transition-colors"
                      >
                        Promote
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleActive(member.id)}
                      className={`px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm transition-colors ${
                        member.isActive
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {member.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Member</h3>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Full Name
                 </label>
                 <input
                   type="text"
                   placeholder="Enter member's full name"
                   value={newMemberName}
                   onChange={(e) => setNewMemberName(e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Role
                 </label>
                 <select
                   value={newMemberRole}
                   onChange={(e) => setNewMemberRole(e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="Member">Member</option>
                   <option value="Vice President">Vice President</option>
                   <option value="Secretary">Secretary</option>
                   <option value="Treasurer">Treasurer</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Email
                 </label>
                 <input
                   type="email"
                   placeholder="Enter member's email address"
                   value={newMemberEmail}
                   onChange={(e) => setNewMemberEmail(e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
               </div>
             </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddMember}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Member
              </button>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setNewMemberName('');
                  setNewMemberRole('Member');
                  setNewMemberEmail('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}