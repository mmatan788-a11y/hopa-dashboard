import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, Tag, FolderPlus, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AddCategory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [subcategories, setSubcategories] = useState(['']);
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image should be less than 10MB', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    setCategoryImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setCategoryImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
    
    toast.info('Image removed', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const addSubcategory = () => {
    setSubcategories([...subcategories, '']);
  };

  const removeSubcategory = (index) => {
    if (subcategories.length > 1) {
      setSubcategories(subcategories.filter((_, i) => i !== index));
    }
  };

  const updateSubcategory = (index, value) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!categoryName.trim()) {
      toast.error('Category name is required', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!categoryImage) {
      toast.error('Please upload a category image', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Filter out empty subcategories
    const validSubcategories = subcategories
      .map(sub => sub.trim())
      .filter(sub => sub !== '');

    if (validSubcategories.length === 0) {
      toast.error('Please add at least one subcategory', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('name', categoryName.trim());
      formData.append('image', categoryImage);
      
      // Append subcategories
      validSubcategories.forEach(subcategory => {
        formData.append('subcategories[]', subcategory);
      });

      const response = await axios.post(
        'https://clark-backend.onrender.com/api/v1/categories',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Cookie': `refreshToken=${localStorage.getItem('refreshToken')}`
          }
        }
      );

      toast.success('Category added successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset form
      resetForm();

      // Navigate to categories page after a short delay
      setTimeout(() => {
        navigate('/categories');
      }, 1500);

    } catch (err) {
      console.error('Error submitting category:', err);
      toast.error(err.response?.data?.message || 'Failed to add category. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCategoryName('');
    setSubcategories(['']);
    setCategoryImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <FolderPlus className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-bold">Add New Category</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Category Details Section */}
        <section className="mb-8">
          <div className="flex items-center mb-4">
            <Tag className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold">Category Details</h2>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name*
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="e.g., Automobiles, Electronics, Fashion"
            />
          </div>
        </section>

        {/* Category Image Section */}
        <section className="mb-8">
          <div className="flex items-center mb-4">
            <Image className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold">Category Image*</h2>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 hover:border-indigo-400 transition-colors">
            {!imagePreview ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-2">Drag and drop an image here or click to browse</p>
                <p className="text-xs text-gray-500 mb-4">Maximum file size: 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition-colors flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="w-full max-w-md mx-auto h-48 object-cover rounded-md"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  onClick={removeImage}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Subcategories Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Tag className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold">Subcategories*</h2>
            </div>
            <button
              type="button"
              onClick={addSubcategory}
              className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Subcategory
            </button>
          </div>
          
          <div className="space-y-3">
            {subcategories.map((subcategory, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => updateSubcategory(index, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder={`Subcategory ${index + 1}`}
                  />
                </div>
                {subcategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubcategory(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Add subcategories to help organize products within this category
          </p>
        </section>

        {/* Preview Section */}
        {categoryName && subcategories.filter(sub => sub.trim()).length > 0 && (
          <section className="mb-8 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-3">Category Preview</h3>
            <div className="flex items-start space-x-4">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
              )}
              <div>
                <h4 className="font-medium text-lg">{categoryName}</h4>
                <p className="text-sm text-gray-600">
                  Subcategories: {subcategories.filter(sub => sub.trim()).join(', ')}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Form Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            onClick={resetForm}
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Category...
              </span>
            ) : (
              <span className="flex items-center">
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Category
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AddCategory;