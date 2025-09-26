import React, { useState } from 'react';
import { Plus, ArrowLeft, Save, Zap, Star, TrendingUp, Eye, BarChart, Award, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

const AddPromoScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    type: 'basic',
    isActive: true,
    features: {
      priorityListing: false,
      featuredProduct: false,
      enhancedVisibility: false,
      analyticsAccess: false,
      customBadge: false
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { token, isAuthenticated, refreshToken } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (featureKey, checked) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      setError('You must be logged in to create a promotion plan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      };

      const raw = JSON.stringify(submitData);
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      const response = await fetch("https://clark-backend.onrender.com/api/v1/promotions", requestOptions);
      
      if (response.status === 401) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            myHeaders.set("Authorization", `Bearer ${newToken}`);
            const retryResponse = await fetch("https://clark-backend.onrender.com/api/v1/promotions", {
              ...requestOptions,
              headers: myHeaders
            });
            
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json();
              throw new Error(errorData.message || 'Failed to create promotion after token refresh');
            }
            
            setSuccess(true);
            setTimeout(() => {
              window.location.href = '/promos';
            }, 2000);
          } else {
            throw new Error('Authentication failed');
          }
        } catch (refreshError) {
          throw new Error('Session expired. Please log in again.');
        }
      } else if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create promotion plan');
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/promo';
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error creating promotion:', error);
      setError(error.message || 'Failed to create promotion plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.location.href = '/promos';
  };

  const getFeatureIcon = (featureKey) => {
    const iconMap = {
      priorityListing: <TrendingUp className="w-5 h-5" />,
      featuredProduct: <Star className="w-5 h-5" />,
      enhancedVisibility: <Eye className="w-5 h-5" />,
      analyticsAccess: <BarChart className="w-5 h-5" />,
      customBadge: <Award className="w-5 h-5" />
    };
    return iconMap[featureKey] || <CheckCircle className="w-5 h-5" />;
  };

  const getFeatureLabel = (featureKey) => {
    const labelMap = {
      priorityListing: 'Priority Listing',
      featuredProduct: 'Featured Product',
      enhancedVisibility: 'Enhanced Visibility',
      analyticsAccess: 'Analytics Access',
      customBadge: 'Custom Badge'
    };
    return labelMap[featureKey] || featureKey;
  };

  const getFeatureDescription = (featureKey) => {
    const descriptionMap = {
      priorityListing: 'Your products appear at the top of search results',
      featuredProduct: 'Highlight your best products with special badges',
      enhancedVisibility: 'Increased exposure across the platform',
      analyticsAccess: 'Access detailed performance metrics',
      customBadge: 'Create custom badges for your products'
    };
    return descriptionMap[featureKey] || '';
  };

  const getPlanTypeColor = (type) => {
    const colorMap = {
      premium: 'from-purple-500 to-pink-500',
      basic: 'from-blue-500 to-cyan-500',
      standard: 'from-green-500 to-teal-500',
      enterprise: 'from-orange-500 to-red-500'
    };
    return colorMap[type] || 'from-gray-500 to-gray-600';
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Promotion Plan Created!</h2>
          <p className="text-gray-600 mb-4">Your new promotion plan has been created successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to promotions page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Promotions
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md mb-6">
            <Plus className="w-6 h-6 text-green-500" />
            <span className="text-lg font-semibold text-gray-800">Create New Promotion</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Add New <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Promotion Plan</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create a new promotion plan to help businesses boost their visibility and reach
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan Details</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter plan name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe what this plan offers"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (GHS) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="basic">Basic</option>
                                        <option value="standard">Standard</option>

                    <option value="premium">Premium</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Make this plan active immediately
                  </label>
                </div>
              </div>

              {/* Features Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Plan Features
                </h3>
                <div className="space-y-4">
                  {Object.entries(formData.features).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          id={key}
                          checked={value}
                          onChange={(e) => handleFeatureChange(key, e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getFeatureIcon(key)}
                          <label htmlFor={key} className="font-medium text-gray-800 cursor-pointer">
                            {getFeatureLabel(key)}
                          </label>
                        </div>
                        <p className="text-sm text-gray-600">
                          {getFeatureDescription(key)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Plan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Create Promotion Plan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Preview</h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Preview Header */}
                <div className={`h-24 bg-gradient-to-r ${getPlanTypeColor(formData.type)} relative`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="relative p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                        {formData.type}
                      </span>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        formData.isActive 
                          ? 'bg-green-500 bg-opacity-20 text-green-100' 
                          : 'bg-red-500 bg-opacity-20 text-red-100'
                      }`}>
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold truncate">
                      {formData.name || 'Plan Name'}
                    </h3>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {formData.description || 'Plan description will appear here...'}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600">
                        {formData.duration || '0'} days
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold text-xs">GHS</span>
                      </div>
                      <span className="font-bold text-gray-800">
                        {formData.price ? parseFloat(formData.price).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 text-sm">Features:</h4>
                    {Object.entries(formData.features).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${
                          value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {value ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                        </div>
                        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
                          {getFeatureLabel(key)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Preview Note</h4>
                  <p className="text-sm text-blue-700">
                    This is how your promotion plan will appear to users. Make sure all information is accurate before creating the plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPromoScreen;