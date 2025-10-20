import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Edit3, Search, MessageSquare, Calendar, BarChart3, Settings, Crown, Heart } from "lucide-react";
import { useFeedStore } from "../stores/feedStore";
import { useAdminUserStore } from "../stores/adminStore";
import { useEventsStore } from "../stores/eventStore";
import { timeAgo } from "../Utils/timeAgo";
import MediaCarousel from "./MediaCarousel";

// Default avatar fallback
const defaultAvatar =
  "data:image/svg+xml;base64," +
  btoa(`
<svg width="40" height="40" viewBox="0 0 24 24" fill="none"
xmlns="http://www.w3.org/2000/svg">
<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4
-4 1.79-4 4 1.79 4 4 4zm0 2
c-2.67 0-8 1.34-8 4v2h16v-2
c0-2.66-5.33-4-8-4z" fill="#6B7280"/>
</svg>`);


export default function AdminDashboard() {
   const { posts, fetchPosts, deletePost } = useFeedStore();
   const { events, fetchEvents } = useEventsStore();
   const [users, setUsers] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [showAddUserModal, setShowAddUserModal] = useState(false);
   const [editingUser, setEditingUser] = useState(null);
   const [newUser, setNewUser] = useState({
     name: "",
     email: "",
     role: "student",
     club: "",
   });

  const clubs = [
    { label: "Code Club", value: "code_club" },
    { label: "E-Cell", value: "e_cell" },
    { label: "Hopehouse", value: "hopehouse" },
    { label: "Cultural Club", value: "cultural_club" },
  ];

  // Stats
  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "blue" },
    { label: "Active Posts", value: posts.length, icon: MessageSquare, color: "green" },
    { label: "Events Created", value: events.length, icon: Calendar, color: "purple" },
  ];

  useEffect(() => {
    fetchPosts(100);
    fetchEvents();
  }, []);

  // Normalize posts for media display
  const normalizedPosts = posts.map(post => {
    if (post.media && post.media.length > 0) return post;
    if (post.mediaUrl) {
      return {
        ...post,
        media: [{ url: post.mediaUrl, type: post.mediaType || "image" }],
      };
    }
    return { ...post, media: [] };
  });

  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "teacher": return "bg-blue-100 text-blue-800";
      case "club_head":
      case "code_club_head":
      case "e_cell_head":
      case "hopehouse_head":
      case "cultural_club_head": return "bg-purple-100 text-purple-800";
      case "student": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role) => {
    const club = clubs.find(c => c.value + "_head" === role);
    if (club) return club.label;
    return role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Manage users, monitor content, and oversee platform operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200",
            green: "bg-gradient-to-r from-green-500 to-green-600 shadow-green-200",
            purple: "bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-200"
          };
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-start justify-between border border-gray-100">
              <div className={`p-3 rounded-xl ${colorClasses[stat.color]} text-white mb-4 shadow-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="xl:col-span-2 bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">User Management</h2>
            <button onClick={() => { setEditingUser(null); setShowAddUserModal(true); }} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <UserPlus className="w-4 h-4 mr-2" /> Add User
            </button>
          </div>
          <div className="mb-6 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-300 bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Posts</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                    <td className="px-6 py-4 flex items-center space-x-4">
                      <img src={user.avatar || defaultAvatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm" />
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(user.role)} shadow-sm`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="text-gray-700 font-medium">{user.posts}</td>
                    <td>
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Post Management */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Post Management</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {normalizedPosts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No posts available</p>
              </div>
            ) : (
              normalizedPosts.map(post => (
                <div key={post._id || post.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <img src={post.userId?.avatar || defaultAvatar} alt="user" className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm" />
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{post.userId?.name || post.author}</p>
                        <p className="text-xs text-gray-500">{timeAgo(post.createdAt || post.date)}</p>
                      </div>
                    </div>
                    <button onClick={() => deletePost(post._id || post.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Media */}
                  {post.media && post.media.length > 0 && (
                    <div className="mb-3 rounded-lg overflow-hidden shadow-sm">
                      <MediaCarousel media={post.media} maxHeight="8rem" />
                    </div>
                  )}

                  {/* Post Content */}
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="font-medium">{post.likes?.length || 0} likes</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
