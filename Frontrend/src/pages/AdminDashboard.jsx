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

    // Check for existing email and username
    const existingEmail = users.find(user => user.email.toLowerCase() === newUser.email.toLowerCase());
    if (existingEmail) {
      toast.error("This email address is already registered. Please use a different email.");
      return;
    }

    const existingUsername = users.find(user => user.username.toLowerCase() === newUser.username.toLowerCase());
    if (existingUsername) {
      toast.error("This username is already taken. Please choose a different username.");
      return;
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

    // Check for existing email and username (excluding current user)
    const existingEmail = users.find(user => 
      user.email.toLowerCase() === newUser.email.toLowerCase() && 
      user._id !== editingUser._id
    );
    if (existingEmail) {
      toast.error("This email address is already registered. Please use a different email.");
      return;
    }

    const existingUsername = users.find(user => 
      user.username.toLowerCase() === newUser.username.toLowerCase() && 
      user._id !== editingUser._id
    );
    if (existingUsername) {
      toast.error("This username is already taken. Please choose a different username.");
      return;
    }

    const updatedUser = await editUser(editingUser._id, newUser);
    if (updatedUser) {
      setShowAddUserModal(false);
      setEditingUser(null);
      setNewUser({ name: '', username: '', email: '', role: 'student', club: '' });
    }
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
    <div className="p-4 lg:p-8 min-h-screen">
      {/* Banner Section */}
      <div className="mb-10 bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-2xl">
            <Users className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-lg text-purple-200">Manage users, posts, and monitor platform activity</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = { blue: 'bg-gradient-to-r from-purple-500 to-purple-600', green: 'bg-gradient-to-r from-purple-500 to-purple-600', purple: 'bg-gradient-to-r from-purple-500 to-purple-600' };
          return (
            <div key={stat.label} className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-400/40 transform hover:-translate-y-1 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-3 rounded-xl ${colors[stat.color]} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-purple-200 text-sm">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-400/40">
          <div className="p-6 border-b border-purple-500/20 flex justify-between items-center bg-white/5 backdrop-blur-sm rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <button
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1"
              onClick={() => {
                setEditingUser(null);
                setNewUser({ name: '', username: '', email: '', role: 'student', club: '' });
                setShowAddUserModal(true);
              }}
            >
              <UserPlus className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>
          <div className="p-6">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 mb-4 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-3 mb-6 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
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
                <div key={user._id} className="flex justify-between items-center p-4 border border-purple-500/20 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 hover:border-purple-400/40">
                  <div className="flex items-center space-x-4">
                    <img src={user.avatar || getLetterAvatar(user.name)} alt={user.name} className="w-12 h-12 rounded-full border-2 border-purple-400/50 shadow-sm" onError={(e) => { e.target.src = getLetterAvatar(user.name); }} />
                    <div>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-sm text-purple-200">{user.email}</p>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(user.role)} shadow-sm`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => handleEditUser(user)} className="text-purple-400 hover:text-white p-2 rounded-lg hover:bg-purple-500/20 transition-all duration-200">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteUser(user._id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Management */}
        <div className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-400/40">
          <div className="p-6 border-b border-purple-500/20 bg-white/5 backdrop-blur-sm rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white">Posts Management</h2>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-full w-fit mx-auto mb-4">
                  <MessageSquare className="w-12 h-12 text-purple-400" />
                </div>
                <p className="text-purple-200 text-lg">No posts available</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="p-4 border border-purple-500/20 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 hover:border-purple-400/40">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <img src={post.userId?.avatar || getLetterAvatar(post.userId?.name || 'Unknown User')} alt="user" className="w-10 h-10 rounded-full border-2 border-purple-400/50 shadow-sm" onError={(e) => { e.target.src = getLetterAvatar(post.userId?.name || 'Unknown User'); }} />
                      <div>
                        <p className="font-semibold text-sm text-white">{post.userId?.name || 'Unknown User'}</p>
                        <p className="text-xs text-purple-300">{timeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    <button onClick={() => deletePost(post._id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className={`text-sm mb-3 text-purple-100 leading-relaxed break-words ${expandedPosts.has(post._id) ? '' : 'line-clamp-1'}`}>{post.content}</p>
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
                      className="text-xs text-purple-400 hover:text-white font-medium"
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
                    <div className="flex items-center space-x-4 text-xs text-purple-300">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="font-medium">{post.likes?.length || 0} likes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4 text-purple-400" />
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
          <div className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  {editingUser ? <UserCheck className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {editingUser ? "Edit User" : "Add New User"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setEmailError('');
                }}
                className="text-purple-400 hover:text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newUser.email}
                  onChange={(e) => {
                    setNewUser({...newUser, email: e.target.value});
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white/10 backdrop-blur-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 transition-colors shadow-sm ${emailError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-purple-500/30 focus:ring-purple-500 focus:border-purple-500'}`}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value, club: ""})}
                  className="w-full pl-10 pr-4 py-3 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-purple-500/10 hover:border-purple-400/40 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="student" className="bg-gray-800 text-white">Student</option>
                  <option value="teacher" className="bg-gray-800 text-white">Teacher</option>
                  <option value="admin" className="bg-gray-800 text-white">Admin</option>
                  <option value="club_head" className="bg-gray-800 text-white">Club Head</option>
                </select>
              </div>
              {newUser.role === "club_head" && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-purple-400" />
                  </div>
                  <select
                    value={newUser.club}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        club: e.target.value,
                        role: e.target.value + "_head",
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-purple-500/10 hover:border-purple-400/40 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="" className="bg-gray-800 text-white">Select Club</option>
                    {clubs.map((club) => (
                      <option key={club.value} value={club.value} className="bg-gray-800 text-white">
                        {club.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setEmailError('');
                }}
                className="px-6 py-3 bg-white/10 backdrop-blur-xl text-purple-200 rounded-xl hover:bg-white/20 hover:text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md border border-purple-500/20"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                disabled={isUpdating}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
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
