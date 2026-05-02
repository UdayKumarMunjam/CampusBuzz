import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, User, Bell, Search, Link } from "lucide-react";
import { useNoticeStore } from "../stores/noticeStore";
import SkeletonPost from "./common/SkeletonPost.jsx";
import InteractiveForm from "./common/InteractiveForm.jsx";

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

  const noticeFormFields = [
    {
      name: 'title',
      label: 'Notice Title',
      type: 'text',
      placeholder: 'Enter notice title...',
      required: true
    },
    {
      name: 'author',
      label: 'Author',
      type: 'text',
      placeholder: 'Who is posting this notice?',
      required: true
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'academic', label: 'Academic' },
        { value: 'event', label: 'Event' },
        { value: 'facility', label: 'Facility' },
        { value: 'technical', label: 'Technical' }
      ]
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      placeholder: 'Enter notice content...',
      rows: 6,
      required: true
    }
  ];

  const handleCreateNotice = async (formData) => {
    try {
      await createNotice(formData);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create notice:", error);
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
    <div className="p-4 lg:p-8 min-h-screen">
      {/* Banner Section */}
      <div className="mb-10 bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-2xl">
                <Bell className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">E-Notice Board</h1>
                <p className="text-lg text-purple-200">Official announcements, notices, and important updates</p>
              </div>
            </div>
          </div>
          {canCreateNotices && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-3 shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1"
            >
              <Plus className="w-6 h-6" />
              <span>Create Notice</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-8">
        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
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

      {/* Interactive Create Form */}
      {showCreateModal && (
        <InteractiveForm
          title="Create New Notice"
          fields={noticeFormFields}
          onSubmit={handleCreateNotice}
          submitText="Create Notice"
          isLoading={isLoading}
          allowFileUpload={true}
          acceptedFileTypes="*"
          maxFiles={1}
          onClose={() => setShowCreateModal(false)}
        />
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
              className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-400/40 transform hover:-translate-y-1"
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
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {notice.title}
                    </h2>
                    <p className="text-purple-100 leading-relaxed">
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

                <div className="flex items-center justify-between text-sm text-purple-300 pt-4 border-t border-purple-500/20">
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
            <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-full w-fit mx-auto mb-4">
              <Bell className="w-12 h-12 text-purple-400" />
            </div>
            <p className="text-purple-200 text-lg">
              No notices found matching your criteria.
            </p>
          </div>
        )}
        {filteredNotices.length > visibleCount && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 5)}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1"
            >
              Load More Notices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
