import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Upload, ArrowLeft } from 'lucide-react';
import { usePlacementStore } from '../stores/placementStore';
import BackButton from './common/BackButton';

export default function AddAchievement({ user }) {
  const navigate = useNavigate();
  const { addPlacement, isUpdating } = usePlacementStore();

  const [newAchievement, setNewAchievement] = useState({
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

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



  const handleAddAchievement = async () => {
    if (newAchievement.image && newAchievement.description) {
      const success = await addPlacement({
        description: newAchievement.description,
        imageUrl: newAchievement.image
      });
      if (success) {
        setNewAchievement({
          description: '',
          image: ''
        });
        setImagePreview('');
        navigate('/achievements/placements');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-8">
      <BackButton className="mb-6 self-start" />

      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg w-full max-w-md">
        <div className="flex items-center space-x-4">
          <Trophy className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Add Placement Achievement</h1>
            <p className="text-lg opacity-90"> a new career success story</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="Describe the placement achievement..."
              value={newAchievement.description}
              onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="space-y-3">
              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors text-base"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Image</span>
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg border border-gray-300 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleAddAchievement}
            disabled={isUpdating || !newAchievement.image || !newAchievement.description}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
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
            onClick={() => navigate('/achievements')}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium shadow-md text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}