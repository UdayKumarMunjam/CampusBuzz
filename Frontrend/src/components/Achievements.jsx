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
      <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campus Achievements</h1>
                <p className="text-gray-600 dark:text-gray-300">Celebrating placement success stories and academic excellence</p>
              </div>
            </div>
          </div>
          {canManageAchievements && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Achievement</span>
            </button>
          )}
          {!canManageAchievements && (
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>View Achievements</span>
            </div>
          )}
        </div>
      </div>

      {/* Placement Achievements Carousel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Placement Achievements</h2>
            <p className="text-gray-600 dark:text-gray-300">Career success and job placements</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-4">
              <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No placement achievements yet</p>
            {canManageAchievements && (
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add the first achievement to get started</p>
            )}
          </div>
        )}
      </div>

      {/* Add Achievement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl mx-auto max-h-[95vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Placement Achievement</h2>
                    <p className="text-gray-600 dark:text-gray-300">Celebrate a new career success story</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition-colors"
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
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <label className="text-xl font-bold text-gray-900 dark:text-white">
                      Achievement Description
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      placeholder="Describe this amazing placement achievement... (e.g., 'John Doe secured a position at Google with a package of 25 LPA')"
                      value={newAchievement.description}
                      onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                      className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm text-sm bg-white dark:bg-gray-700"
                      rows="2"
                      maxLength="500"
                    />
                    <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 shadow-sm">
                      {newAchievement.description.length}/500
                    </div>
                  </div>
                </div>

                {/* Image Upload Section - Enhanced */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <label className="text-xl font-bold text-gray-900 dark:text-white">
                      Achievement Image
                    </label>
                  </div>

                  {/* Upload Options - Enhanced Design */}
                  <div className="grid grid-cols-1 gap-6">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative overflow-hidden bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-500 w-full"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full group-hover:bg-gray-300 dark:group-hover:bg-gray-500 transition-colors">
                          <Upload className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                        </div>
                        <div className="text-left">
                          <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">Upload Images</span>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Choose multiple images from gallery</p>
                        </div>
                      </div>
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
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Images:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 flex items-center space-x-2">
                            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-32">{file.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
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
              <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleAddAchievement}
                  disabled={isUpdating || newAchievement.images.length === 0 || !newAchievement.description}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding Achievement...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-6 h-6" />
                      <span>Add Achievement</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-4 px-8 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
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