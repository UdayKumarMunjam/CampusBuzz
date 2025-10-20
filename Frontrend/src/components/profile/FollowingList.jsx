import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, User } from "lucide-react";
import BackButton from "../common/BackButton";
import { useAuthStore } from "../../stores/authStore";

const defaultAvatar =
  "data:image/svg+xml;base64," +
  btoa(`
<svg width="128" height="128" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="8" r="4" fill="#6B7280"/>
  <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" fill="#6B7280"/>
</svg>
`);

export default function FollowingList() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        // Fetch user profile to get following
        const response = await fetch(`http://localhost:8080/api/user/profile/${userId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          setFollowing(userData.user.following || []);
        }
      } catch (error) {
        console.error("Error fetching following:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <BackButton className="mb-6" />
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 lg:p-8">
        <BackButton className="mb-6" />
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8 mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Following by {user.name}
          </h1>

          {following.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Not following anyone yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {following.map((followedUser) => (
                <div
                  key={followedUser._id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/profile/${followedUser._id}`)}
                >
                  <img
                    src={followedUser.avatar || defaultAvatar}
                    alt={followedUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{followedUser.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{followedUser.role.replace('_', ' ')}</p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}