import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Edit3, MessageSquare, Calendar, Award, Heart, Share2, Loader, Mail, User, UserCheck } from 'lucide-react';
import { useAdminUserStore } from '../stores/adminStore';
import { useFeedStore } from '../stores/feedStore';
import { useEventsStore } from '../stores/eventStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { timeAgo } from '../Utils/timeAgo.js';
import { getLetterAvatar } from '../Utils/avatarUtils';
import MediaCarousel from '../components/MediaCarousel';

// Removed generateInitialsAvatar as we now use getLetterAvatar utility

// Removed defaultAvatar as we now use getLetterAvatar utility

export default function AdminDashboard() {
  const { users, fetchUsers, addUser, editUser, deleteUser, isUpdating } = useAdminUserStore();
  const { posts, fetchPosts, deletePost } = useFeedStore();
  const { events, fetchEvents } = useEventsStore();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    role: 'student',
    club: ''
  });
  const [emailError, setEmailError] = useState('');
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  const clubs = [
    { label: 'Code Club', value: 'code_club' },
    { label: 'E-Cell', value: 'e_cell' },
    { label: 'Hopehouse', value: 'hopehouse' },
    { label: 'Cultural Club', value: 'cultural_club' },
  ];

  useEffect(() => {
    fetchUsers();
    fetchPosts();
    fetchEvents();
  }, []);

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'blue' },
    { label: 'Active Posts', value: posts.length, icon: MessageSquare, color: 'green' },
    { label: 'Events Created', value: events.length, icon: Calendar, color: 'purple' }
  ];

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add User (prepend to top)
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.username) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!validateEmail(newUser.email)) {
      setEmailError("Please enter a valid email address");
      return;
    } else {
      setEmailError('');
    }

    const createdUser = await addUser(newUser);

    if (createdUser) {
      setShowAddUserModal(false);
      setNewUser({ name: '', username: '', email: '', role: 'student', club: '' });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role.includes("_head") ? "club_head" : user.role,
      club: user.role.includes("_head") ? user.role.replace("_head", "") : "",
    });
    setShowAddUserModal(true);
  };

  const handleUpdateUser = async () => {
    const updatedUser = await editUser(editingUser._id, newUser);
    // Update the user in the list
    setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    setShowAddUserModal(false);
    setEditingUser(null);
    setNewUser({ name: '', username: '', email: '', role: 'student', club: '' });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'club_head':
      case 'code_club_head':
      case 'e_cell_head':
      case 'hopehouse_head':
      case 'cultural_club_head':
        return 'bg-purple-100 text-purple-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role) => {
    const club = clubs.find(c => c.value === role);
    if (club) return club.label;
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = { blue: 'bg-gradient-to-r from-blue-500 to-blue-600', green: 'bg-gradient-to-r from-emerald-500 to-emerald-600', purple: 'bg-gradient-to-r from-violet-500 to-violet-600' };
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-3 rounded-xl ${colors[stat.color]} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-gray-700 text-sm">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-xl">
            <h2 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">User Management</h2>
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              onClick={() => {
                setEditingUser(null);
                setNewUser({ name: '', username: '', email: '', role: 'student', club: '' });
                setShowAddUserModal(true);
              }}
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
          <div className="p-6">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-3 mb-6 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
              <optgroup label="Club Heads">
                {clubs.map(club => (
                  <option key={club.value} value={club.value}>{club.label}</option>
                ))}
              </optgroup>
            </select>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div key={user._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-purple-50">
                  <div className="flex items-center space-x-4">
                    <img src={user.avatar || getLetterAvatar(user.name)} alt={user.name} className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm" onError={(e) => { e.target.src = getLetterAvatar(user.name); }} />
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(user.role)} shadow-sm`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteUser(user._id)} className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Management */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-xl">
            <h2 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Posts Management</h2>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No posts available</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-slate-50 hover:from-emerald-50 hover:to-blue-50">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <img src={post.userId?.avatar || getLetterAvatar(post.userId?.name || 'Unknown User')} alt="user" className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm" onError={(e) => { e.target.src = getLetterAvatar(post.userId?.name || 'Unknown User'); }} />
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{post.userId?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    <button onClick={() => deletePost(post._id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className={`text-sm mb-3 text-gray-700 leading-relaxed break-words ${expandedPosts.has(post._id) ? '' : 'line-clamp-1'}`}>{post.content}</p>
                  {post.content.length > 100 && (
                    <button
                      onClick={() => {
                        setExpandedPosts(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(post._id)) {
                            newSet.delete(post._id);
                          } else {
                            newSet.add(post._id);
                          }
                          return newSet;
                        });
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {expandedPosts.has(post._id) ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {post.media && post.media.length > 0 && (
                    <div className="mb-3 rounded-lg overflow-hidden shadow-sm">
                      <MediaCarousel media={post.media} maxHeight="8rem" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="font-medium">{post.likes?.length || 0} likes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">{post.shares?.length || 0} shares</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-gray-100 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  {editingUser ? <UserCheck className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {editingUser ? "Edit User" : "Add New User"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setEmailError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newUser.email}
                  onChange={(e) => {
                    setNewUser({...newUser, email: e.target.value});
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-gray-50 focus:bg-white ${emailError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}`}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>
              {newUser.role === "club_head" && (
                <div className="relative">
                  <select
                    value={newUser.club}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        club: e.target.value,
                        role: e.target.value + "_head",
                      })
                    }
                    className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select Club</option>
                    {clubs.map((club) => (
                      <option key={club.value} value={club.value}>
                        {club.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="relative">
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value, club: ""})}
                  className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-gray-50 focus:bg-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <optgroup label="Club Heads">
                    {clubs.map((club) => (
                      <option key={club.value} value={club.value}>
                        {club.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setEmailError('');
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                disabled={isUpdating}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                {isUpdating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>{editingUser ? "Updating..." : "Adding..."}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{editingUser ? "Update User" : "Add User"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
