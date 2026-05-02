import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Medal, Award, Plus, Trash2, Search, Filter, Camera, Upload } from 'lucide-react';
import { usePlacementStore } from '../stores/placementStore';
export default function AchievementCategory({ user }) {
  const { category } = useParams();
  console.log('AchievementCategory rendered with category:', category);
  // const [filterYear, setFilterYear] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const canManageAchievements = user.role === 'admin' || user.role === 'teacher';
  const categoryData = {
    placements: {
      name: 'Placement Achievements',
      description: 'Career success and job placements',
      icon: Award
    }
  };

  const {
    placements,
    years,
    isLoading,
    isUpdating,
    fetchPlacements,
    fetchYears,
    addPlacement,
    deletePlacement
  } = usePlacementStore();

  const [newAchievement, setNewAchievement] = useState({
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    fetchPlacements();
    // fetchYears();
  }, []);

  const currentCategory = categoryData[category];
  if (!currentCategory) {
    console.log('Available categories:', Object.keys(categoryData));
    console.log('Requested category:', category);
    return <div>Category not found: {category}</div>;
  }

  const IconComponent = currentCategory.icon;

  // Placements are already filtered by the store based on filterYear
  const filteredAchievements = placements;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setNewAchievement({...newAchievement, image: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setNewAchievement({...newAchievement, image: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = (url) => {
    setImagePreview(url);
    setNewAchievement({...newAchievement, image: url});
  };

  const handleAddAchievement = async () => {
    if (newAchievement.image && newAchievement.description) {
      await addPlacement({
        description: newAchievement.description,
        imageUrl: newAchievement.image
      });
      setNewAchievement({
        description: '',
        image: ''
      });
      setImagePreview('');
      setShowAddModal(false);
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    await deletePlacement(achievementId);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'International': return 'bg-red-100 text-red-800';
      case 'National': return 'bg-blue-100 text-blue-800';
      case 'State': return 'bg-green-100 text-green-800';
      case 'Regional': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <IconComponent className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{currentCategory.name}</h1>
              <p className="text-gray-600">{currentCategory.description}</p>
            </div>
          </div>
          {canManageAchievements && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Achievement</span>
            </button>
          )}
        </div>

      </div>

      {/* Add Achievement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Add Placement Achievement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the placement achievement..."
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="space-y-3">
                  {/* URL Input */}
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newAchievement.image.startsWith('data:') ? '' : newAchievement.image}
                    onChange={(e) => handleUrlInput(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {/* File Upload and Camera Buttons */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Camera</span>
                    </button>
                  </div>

                  {/* Hidden File Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                  />

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddAchievement}
                disabled={isUpdating}
                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  "Add Achievement"
                )}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading placement achievements...</p>
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No placement achievements found for the selected year.</p>
          </div>
        ) : (
          filteredAchievements.map((achievement) => (
            <div key={achievement._id} className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
              {achievement.image && (
                <img
                  src={achievement.image.url}
                  alt={`Placement Achievement`}
                  className="w-full h-64 object-cover"
                />
              )}
              {/* Description Overlay */}
              {achievement.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-3">
                  <p className="text-sm font-medium">{achievement.description}</p>
                </div>
              )}
              {/* Delete Button */}
              {canManageAchievements && (
                <button
                  onClick={() => handleDeleteAchievement(achievement._id)}
                  disabled={isUpdating}
                  className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No achievements found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}