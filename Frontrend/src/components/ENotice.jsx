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
      <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Bell className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">E-Notice Board</h1>
                <p className="text-gray-600 dark:text-gray-300">Official announcements, notices, and important updates</p>
              </div>
            </div>
          </div>
          {canCreateNotices && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Create Notice</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-8">
        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="event">Events</option>
              <option value="facility">Facilities</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Plus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Notice</h3>
                  <p className="text-gray-600 dark:text-gray-300">Share important announcements with the community</p>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Notice Title</label>
                  <input
                    type="text"
                    placeholder="Enter notice title..."
                    value={newNotice.title}
                    onChange={(e) =>
                      setNewNotice({ ...newNotice, title: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Author/Department</label>
                    <input
                      type="text"
                      placeholder="Author name..."
                      value={newNotice.author}
                      onChange={(e) =>
                        setNewNotice({ ...newNotice, author: e.target.value })
                      }
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Category</label>
                    <select
                      value={newNotice.category}
                      onChange={(e) =>
                        setNewNotice({ ...newNotice, category: e.target.value })
                      }
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="academic">Academic</option>
                      <option value="event">Events</option>
                      <option value="facility">Facilities</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Notice Content</label>
                  <textarea
                    placeholder="Enter detailed notice content..."
                    value={newNotice.content}
                    onChange={(e) =>
                      setNewNotice({ ...newNotice, content: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl resize-none h-32 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Attachment (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) =>
                        setNewNotice({ ...newNotice, file: e.target.files[0] })
                      }
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl file:hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white dark:bg-gray-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Link className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-gray-500 dark:text-gray-400">
                        {newNotice.file ? newNotice.file.name : "Choose file (optional)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-gray-600 p-6">
              <div className="flex space-x-4">
                <button
                  onClick={handleCreateNotice}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Bell className="w-5 h-5" />
                  <span>Create Notice</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
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
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600"
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
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {notice.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-600">
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
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-4">
              <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No notices found matching your criteria.
            </p>
          </div>
        )}
        {filteredNotices.length > visibleCount && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 5)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Load More Notices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
