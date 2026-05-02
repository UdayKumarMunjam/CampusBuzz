// src/components/LostFound.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  User,
  Trash2,
  MessageCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useLostFoundStore } from "../stores/lostFoundStore";
import SkeletonPost from "./common/SkeletonPost.jsx";
import InteractiveForm from "./common/InteractiveForm.jsx";
import toast from "react-hot-toast";

export default function LostFound({ user }) {
  const { id } = useParams();
  const {
    items,
    isLoading,
    pagination,
    fetchItems,
    createItem,
    deleteItem,
    markResolved,
  } = useLostFoundStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newItem, setNewItem] = useState({
    title: "",
    type: "lost",
    description: "",
    location: "",
    image: null,
  });

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [messageText, setMessageText] = useState("");

  // Fetch items on mount and when filters change
  useEffect(() => {
    fetchItems(1); // Reset to first page when filters change
  }, [fetchItems, searchTerm, filterType, filterStatus]);

  // Handle resolution from URL
  useEffect(() => {
    if (id) {
      markResolved(id);
    }
  }, [id, markResolved]);

  // Filtering
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const lostFoundFormFields = [
    {
      name: 'title',
      label: 'Item Title',
      type: 'text',
      placeholder: 'What item was lost/found?',
      required: true
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      defaultValue: 'lost',
      options: [
        { value: 'lost', label: 'Lost Item' },
        { value: 'found', label: 'Found Item' }
      ]
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Provide detailed description...',
      rows: 4,
      required: true
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Where was it lost/found?',
      required: true
    },
  ];

  const handleCreateItem = async (formData) => {
    try {
      await createItem(formData);
      setShowCreateModal(false);
      toast.success("Item posted successfully!");
    } catch (error) {
      toast.error("Failed to create item");
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      const response = await axios.post('http://${API}/api/lostfound/sendMessage', { itemId: selectedItem._id, message: messageText }, { withCredentials: true });
      if (response.data.success) {
        toast.success("Message sent successfully");
        setShowMessageModal(false);
        setMessageText("");
        setSelectedItem(null);
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Send message error:", error);
      const errorMessage = error.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
    }
  };

  const getTypeColor = (type) => {
    return type === "lost"
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";
  };

  const handlePageChange = (page) => {
    fetchItems(page);
  };

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      {/* Banner Section */}
      <div className="mb-10 bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-2xl">
                <Search className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Lost & Found</h1>
                <p className="text-lg text-purple-200">Help your campus community find lost items and reunite with belongings</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-3 shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1"
          >
            <Plus className="w-6 h-6" />
            <span>Report Item</span>
          </button>
        </div>
      </div>

      <div className="mb-8">

        {/* Search + Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-400 absolute left-4 top-4" />
              <input
                type="text"
                placeholder="Search items, locations, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-4 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
            >
              <option value="all">All Types</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-4 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Create Form */}
      {showCreateModal && (
        <InteractiveForm
          title="Report Lost/Found Item"
          fields={lostFoundFormFields}
          onSubmit={handleCreateItem}
          submitText="Report Item"
          isLoading={isLoading}
          allowFileUpload={true}
          acceptedFileTypes="image/*"
          maxFiles={1}
          fileFieldName="media"
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/80 via-blue-900/80 to-cyan-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[95vh] overflow-hidden flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Send Message</h2>
                    <p className="text-indigo-100">About: {selectedItem?.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowMessageModal(false); setMessageText(""); setSelectedItem(null); }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Your Message</label>
                  <textarea
                    placeholder="Type your message here... (e.g., 'I think I found your item!' or 'Can you provide more details?')"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-none h-40 text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSendMessage}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold hover:from-indigo-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
                <button
                  onClick={() => { setShowMessageModal(false); setMessageText(""); setSelectedItem(null); }}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-8 rounded-2xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonPost key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden border border-purple-500/20 hover:border-purple-400/40 transform hover:-translate-y-2 relative group cursor-pointer"
            >
              <div className="relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="p-3 bg-purple-500/20 backdrop-blur-sm rounded-full mb-2 mx-auto w-fit">
                        <Camera className="w-8 h-8 text-purple-400" />
                      </div>
                      <span className="text-purple-300 text-sm">No Image</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-md ${getTypeColor(
                      item.type
                    )}`}
                  >
                    {item.type}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-md ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
                {(user._id === item.createdBy || user.role === "admin") && (
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-purple-100 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-purple-500/20">
                    <div className="p-1 bg-blue-500/20 rounded mr-2">
                      <MapPin className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="font-medium text-white">{item.location}</span>
                  </div>
                  <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-purple-500/20">
                    <div className="p-1 bg-green-500/20 rounded mr-2">
                      <Calendar className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-white">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-purple-500/20">
                    <div className="p-1 bg-purple-500/20 rounded mr-2">
                      <User className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-white truncate">{item.reporterEmail || "Anonymous"}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => { setSelectedItem(item); setShowMessageModal(true); }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg transition-all text-sm font-semibold flex items-center justify-center space-x-1 shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  {item.status === "active" && user._id === item.createdBy && (
                    <button
                      onClick={() => markResolved(item._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                    >
                      Mark Found
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <span className="text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total items)
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {filteredItems.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-full w-fit mx-auto mb-4">
            <Search className="w-16 h-16 text-purple-400" />
          </div>
          <p className="text-purple-200 text-lg">
            No items found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
