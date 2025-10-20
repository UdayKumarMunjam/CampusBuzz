import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, User, Bell, Search, Link } from "lucide-react";
import { useNoticeStore } from "../stores/noticeStore";
import SkeletonPost from "./common/SkeletonPost.jsx";

export default function ENotice({ user }) {
  const { notices, fetchNotices, createNotice, deleteNotice, isLoading } =
    useNoticeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    author: "",
    category: "academic",
    file: null,
  });

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const canCreateNotices = user.role === "admin" || user.role === "teacher";
  const canDeleteNotices = user.role === "admin";

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || notice.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNotice = async () => {
    if (newNotice.title && newNotice.content && newNotice.author) {
      const formData = new FormData();
      formData.append("title", newNotice.title);
      formData.append("content", newNotice.content);
      formData.append("author", newNotice.author);
      formData.append("category", newNotice.category);
      if (newNotice.file) formData.append("file", newNotice.file); // optional file

      await createNotice(formData);
      setNewNotice({
        title: "",
        content: "",
        author: "",
        category: "academic",
        file: null,
      });
      setShowCreateModal(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    await deleteNotice(id);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-purple-100 text-purple-800";
      case "facility":
        return "bg-green-100 text-green-800";
      case "technical":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      {/* Banner Section */}
      <div className="mb-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">📢 CampusBuzz E-Notice Board</h1>
            <p className="text-lg opacity-90">Official CampusBuzz announcements, notices, and important updates</p>
          </div>
          {canCreateNotices && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all flex items-center space-x-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Create Notice</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="event">Events</option>
            <option value="facility">Facilities</option>
            <option value="technical">Technical</option>
          </select>
        </div>
      </div>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Create New Notice</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Notice Title"
                value={newNotice.title}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, title: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Author/Department"
                value={newNotice.author}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, author: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newNotice.category}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, category: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="academic">Academic</option>
                <option value="event">Events</option>
                <option value="facility">Facilities</option>
                <option value="technical">Technical</option>
              </select>
              <textarea
                placeholder="Notice Content"
                value={newNotice.content}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, content: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, file: e.target.files[0] })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg file:hidden"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Link className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-500">Choose file</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateNotice}
                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Create Notice
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonPost key={index} />
            ))}
          </div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.slice(0, visibleCount).map((notice) => (
            <div
              key={notice._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(
                          notice.category
                        )}`}
                      >
                        {notice.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {notice.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {notice.content}
                    </p>

                    {/* Optional File */}
                    {notice.fileUrl && (
                      <a
                        href={notice.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline mt-2 block"
                      >
                        📎 View Attachment
                      </a>
                    )}
                  </div>
                  {canDeleteNotices && (
                    <button
                      onClick={() => handleDeleteNotice(notice._id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{notice.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    by {notice.createdBy}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No notices found matching your criteria.
            </p>
          </div>
        )}
        {filteredNotices.length > visibleCount && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 5)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              More Updates &gt;&gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
