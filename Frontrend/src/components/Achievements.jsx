import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, Target, ChevronRight, Plus, Upload, X, Trash2 } from 'lucide-react';
import BackButton from './common/BackButton';
import MediaCarousel from './MediaCarousel';
import { usePlacementStore } from '../stores/placementStore';

export default function Achievements({ user }) {
   const navigate = useNavigate();
   const { placements, fetchPlacements, isLoading, addPlacement, isUpdating, deletePlacement } = usePlacementStore();
   const [placementAchievements, setPlacementAchievements] = useState([]);
   const [showAddModal, setShowAddModal] = useState(false);
   const [newAchievement, setNewAchievement] = useState({
     description: '',
     images: [],
     fileNames: []
   });
   const [selectedFiles, setSelectedFiles] = useState([]);
   const fileInputRef = useRef(null);

   useEffect(() => {
     fetchPlacements();
   }, [fetchPlacements]);

  useEffect(() => {
    if (placements.length > 0) {
      setPlacementAchievements(placements.map(placement => ({
        title: placement.year ? `Placement Achievement ${placement.year}` : 'Placement Achievement',
        winner: placement.uploadedBy?.name || 'Unknown',
        date: placement.createdAt,
        images: placement.images?.map(img => img.url) || ['https://via.placeholder.com/400x300?text=No+Image']
      })));
    }
  }, [placements]);

  const canManageAchievements = user.role === 'admin' || user.role === 'teacher';

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const newImages = [];
      const newFileNames = [];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target.result);
          if (newImages.length === files.length) {
            setSelectedFiles(prev => [...prev, ...files]);
            setNewAchievement(prev => ({
              ...prev,
              images: [...prev.images, ...newImages],
              fileNames: [...prev.fileNames, ...files.map(f => f.name)]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };



  const handleAddAchievement = async () => {
    if (newAchievement.images.length > 0 && newAchievement.description) {
      await addPlacement({
        description: newAchievement.description,
        imageUrls: newAchievement.images
      });
      setNewAchievement({
        description: '',
        images: [],
        fileNames: []
      });
      setSelectedFiles([]);
      setShowAddModal(false);
    }
  };

  return (
    <div className={`p-8 ${showAddModal ? 'overflow-hidden' : ''}`}>
      {/* <BackButton className="mb-6" /> */}

      {/* Banner Section */}
      <div className="mb-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">🏆 Campus Achievements</h1>
            <p className="text-lg opacity-90">Celebrating placement success stories and academic excellence</p>
          </div>
          {canManageAchievements && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all flex items-center space-x-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Achievement</span>
            </button>
          )}
          {!canManageAchievements && (
            <div className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 backdrop-blur-sm">
              <Trophy className="w-5 h-5" />
              <span>View Achievements</span>
            </div>
          )}
        </div>
      </div>

      {/* Placement Achievements Carousel */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-6">
          <Target className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Placement Achievements</h2>
            <p className="text-gray-600">Career success and job placements</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : placementAchievements.length > 0 ? (
          <div className="w-full mb-6 relative">
            {canManageAchievements && (
              <button
                onClick={() => {
                  if (placements.length > 0) {
                    deletePlacement(placements[0]._id);
                  }
                }}
                className="absolute top-4 right-4 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Delete Achievement"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <MediaCarousel
              media={placementAchievements.flatMap(achievement =>
                achievement.images.map(img => ({
                  url: img,
                  type: 'image'
                }))
              )}
              onClick={() => navigate('/achievements/placements')}
              autoPlay={true}
              interval={4000}
              maxHeight="70vh"
              fullWidth={true}
              disableScroll={true}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No placement achievements yet</p>
            {canManageAchievements && (
              <p className="text-gray-400 text-sm mt-2">Add the first achievement to get started</p>
            )}
          </div>
        )}
      </div>

      {/* Add Achievement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Add Placement Achievement</h2>
                    <p className="text-blue-100">Celebrate a new career success story</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Description Field - Enhanced */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <label className="text-xl font-bold text-gray-800">
                      Achievement Description
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      placeholder="Describe this amazing placement achievement... (e.g., 'John Doe secured a position at Google with a package of 25 LPA')"
                      value={newAchievement.description}
                      onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-gray-700 placeholder-gray-400 shadow-sm text-sm"
                      rows="2"
                      maxLength="500"
                    />
                    <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-500 shadow-sm">
                      {newAchievement.description.length}/500
                    </div>
                  </div>
                </div>

                {/* Image Upload Section - Enhanced */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <label className="text-xl font-bold text-gray-800">
                      Achievement Image
                    </label>
                  </div>

                  {/* Upload Options - Enhanced Design */}
                  <div className="grid grid-cols-1 gap-6">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 border-dashed rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-indigo-300 w-full"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                          <Upload className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" />
                        </div>
                        <div className="text-left">
                          <span className="text-indigo-800 font-semibold text-sm">Upload Images</span>
                          <p className="text-indigo-600 text-xs">Choose multiple images from gallery</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  </div>

                  {/* Hidden File Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Selected Files List */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Selected Images:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 flex items-center space-x-2">
                            <Upload className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-800 truncate max-w-32">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            <button
                              onClick={() => {
                                const newFiles = selectedFiles.filter((_, i) => i !== index);
                                const newImages = newAchievement.images.filter((_, i) => i !== index);
                                const newFileNames = newAchievement.fileNames.filter((_, i) => i !== index);
                                setSelectedFiles(newFiles);
                                setNewAchievement({...newAchievement, images: newImages, fileNames: newFileNames});
                              }}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer - Enhanced */}
              <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleAddAchievement}
                  disabled={isUpdating || newAchievement.images.length === 0 || !newAchievement.description}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-500 disabled:hover:to-teal-600 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding Achievement...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-6 h-6" />
                      <span>Add </span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-8 rounded-2xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}