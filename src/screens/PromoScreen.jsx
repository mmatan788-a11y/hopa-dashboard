import React, { useState, useEffect } from 'react';
import { Zap, Clock, DollarSign, CheckCircle, XCircle, Star, TrendingUp, Eye, BarChart, Award, Shield, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

const PromoScreen = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingPlan, setDeletingPlan] = useState(null);

  // Use AuthContext
  const { 
    token, 
    isAuthenticated, 
    logout,
    refreshToken 
  } = useAuth();

  // Fetch promotions from API with authentication
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated || !token) {
        setError('You are not authenticated. Please login again.');
        return;
      }

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };
      
      const response = await fetch("https://clark-backend.onrender.com/api/v1/promotions", requestOptions);
      
      if (response.status === 401) {
        try {
          console.log('Token expired, attempting refresh...');
          const newToken = await refreshToken();
          if (newToken) {
            const retryHeaders = new Headers();
            retryHeaders.append("Authorization", `Bearer ${newToken}`);
            
            const retryOptions = {
              method: "GET",
              headers: retryHeaders,
              redirect: "follow"
            };
            
            const retryResponse = await fetch("https://clark-backend.onrender.com/api/v1/promotions", retryOptions);
            
            if (retryResponse.status === 401) {
              throw new Error('Token refresh failed - authentication required');
            }
            
            const retryResult = await retryResponse.json();
            
            if (retryResponse.ok && retryResult.status === 'success' && retryResult.data && retryResult.data.promotionPlans) {
              setPlans(retryResult.data.promotionPlans);
              return;
            } else {
              throw new Error(retryResult.message || 'Failed to fetch promotions after token refresh');
            }
          } else {
            throw new Error('Token refresh returned null');
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          setError('Your session has expired. Please login again.');
          logout();
          return;
        }
      }
      
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError('You do not have permission to access this resource.');
          return;
        }
        throw new Error(result.message || `HTTP ${response.status}: Failed to fetch promotions`);
      }
      
      if (result.status === 'success' && result.data && result.data.promotionPlans && Array.isArray(result.data.promotionPlans)) {
        setPlans(result.data.promotionPlans);
      } else {
        console.error('Unexpected API response structure:', result);
        setError('Invalid API response structure. Expected promotionPlans array not found.');
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError(error.message || 'Failed to fetch promotions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Edit promotion function
  const handleEditPromo = async (planId, updatedData) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const raw = JSON.stringify(updatedData);
      
      const requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      const response = await fetch(`https://clark-backend.onrender.com/api/v1/promotions/${planId}`, requestOptions);
      
      if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          myHeaders.set("Authorization", `Bearer ${newToken}`);
          const retryResponse = await fetch(`https://clark-backend.onrender.com/api/v1/promotions/${planId}`, {
            ...requestOptions,
            headers: myHeaders
          });
          
          if (!retryResponse.ok) {
            throw new Error('Failed to update promotion after token refresh');
          }
        } else {
          throw new Error('Authentication failed');
        }
      } else if (!response.ok) {
        throw new Error('Failed to update promotion');
      }

      // Refresh the promotions list
      await fetchPromotions();
      setEditingPlan(null);
      setEditForm({});
      
    } catch (error) {
      console.error('Error updating promotion:', error);
      setError('Failed to update promotion. Please try again.');
    }
  };

  // Delete promotion function
  const handleDeletePromo = async (planId) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        redirect: "follow"
      };

      const response = await fetch(`https://clark-backend.onrender.com/api/v1/promotions/${planId}`, requestOptions);
      
      if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          myHeaders.set("Authorization", `Bearer ${newToken}`);
          const retryResponse = await fetch(`https://clark-backend.onrender.com/api/v1/promotions/${planId}`, {
            ...requestOptions,
            headers: myHeaders
          });
          
          if (!retryResponse.ok) {
            throw new Error('Failed to delete promotion after token refresh');
          }
        } else {
          throw new Error('Authentication failed');
        }
      } else if (!response.ok) {
        throw new Error('Failed to delete promotion');
      }

      // Refresh the promotions list
      await fetchPromotions();
      setDeletingPlan(null);
      
    } catch (error) {
      console.error('Error deleting promotion:', error);
      setError('Failed to delete promotion. Please try again.');
    }
  };

  // Start editing a plan
  const startEditing = (plan) => {
    setEditingPlan(plan.id);
    setEditForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      type: plan.type,
      isActive: plan.isActive,
      features: { ...plan.features }
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingPlan(null);
    setEditForm({});
  };

  // Save edited plan
  const saveEditedPlan = () => {
    handleEditPromo(editingPlan, editForm);
  };

  // Navigate to add promo page
  const handleAddPromo = () => {
    window.location.href = '/add-promo';
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPromotions();
    } else {
      setError('You need to be logged in to view this page.');
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const getFeatureIcon = (featureKey) => {
    const iconMap = {
      priorityListing: <TrendingUp className="w-4 h-4" />,
      featuredProduct: <Star className="w-4 h-4" />,
      enhancedVisibility: <Eye className="w-4 h-4" />,
      analyticsAccess: <BarChart className="w-4 h-4" />,
      customBadge: <Award className="w-4 h-4" />
    };
    return iconMap[featureKey] || <CheckCircle className="w-4 h-4" />;
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

  const getPlanTypeColor = (type) => {
    const colorMap = {
      premium: 'from-purple-500 to-pink-500',
      basic: 'from-blue-500 to-cyan-500',
      standard: 'from-green-500 to-teal-500',
      enterprise: 'from-orange-500 to-red-500'
    };
    return colorMap[type] || 'from-gray-500 to-gray-600';
  };

  // Show authentication error screen if not authenticated
  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 p-8 rounded-xl text-center">
          <div className="text-red-400 mb-4">
            <Shield size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-300">You need to be logged in to access this page.</p>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading promotion plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Plans</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={fetchPromotions} 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
            {error.includes('login') && (
              <button 
                onClick={() => window.location.href = '/login'} 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md mb-6">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-800">Promotion Plans</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Boost Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Visibility</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the perfect promotion plan to maximize your reach and grow your business
          </p>
          
          {/* Add Promo Button */}
          <button
            onClick={handleAddPromo}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add New Promotion
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={plan.id} 
              className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={`h-32 bg-gradient-to-r ${getPlanTypeColor(plan.type)} relative`}>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                      {editingPlan === plan.id ? (
                        <input
                          type="text"
                          value={editForm.type}
                          onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                          className="bg-white bg-opacity-20 rounded px-2 py-1 text-white placeholder-white"
                        />
                      ) : (
                        plan.type
                      )}
                    </span>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      (editingPlan === plan.id ? editForm.isActive : plan.isActive)
                        ? 'bg-green-500 bg-opacity-20 text-green-100' 
                        : 'bg-red-500 bg-opacity-20 text-red-100'
                    }`}>
                      {editingPlan === plan.id ? (
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                            className="w-3 h-3"
                          />
                          {editForm.isActive ? 'Active' : 'Inactive'}
                        </label>
                      ) : (
                        plan.isActive ? 'Active' : 'Inactive'
                      )}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold">
                    {editingPlan === plan.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="bg-white bg-opacity-20 rounded px-2 py-1 text-white placeholder-white w-full"
                      />
                    ) : (
                      plan.name
                    )}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-gray-600 mb-6 leading-relaxed">
                  {editingPlan === plan.id ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                      rows="3"
                    />
                  ) : (
                    <p>{plan.description}</p>
                  )}
                </div>

                {/* Plan Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      {editingPlan === plan.id ? (
                        <input
                          type="number"
                          value={editForm.duration}
                          onChange={(e) => setEditForm({...editForm, duration: parseInt(e.target.value)})}
                          className="font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1 w-20"
                        />
                      ) : (
                        <p className="font-semibold text-gray-800">{plan.duration} days</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      {editingPlan === plan.id ? (
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                          className="font-bold text-2xl text-gray-800 border border-gray-300 rounded px-2 py-1 w-32"
                        />
                      ) : (
                        <p className="font-bold text-2xl text-gray-800">
                          GHS {plan.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Features
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(editingPlan === plan.id ? editForm.features : plan.features).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {getFeatureIcon(key)}
                        </div>
                        <span className={`text-sm font-medium flex-1 ${
                          value ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                          {getFeatureLabel(key)}
                        </span>
                        <div className="ml-auto">
                          {editingPlan === plan.id ? (
                            <input
                              type="checkbox"
                              checked={editForm.features[key]}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                features: {
                                  ...editForm.features,
                                  [key]: e.target.checked
                                }
                              })}
                              className="w-5 h-5 text-green-600"
                            />
                          ) : (
                            value ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300" />
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {editingPlan === plan.id ? (
                    <>
                      <button 
                        onClick={saveEditedPlan}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => startEditing(plan)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Plan
                      </button>
                      <button 
                        onClick={() => setDeletingPlan(plan.id)}
                        className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-white bg-opacity-10 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white bg-opacity-5 rounded-full blur-lg"></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {plans.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Promotion Plans Found</h3>
            <p className="text-gray-500 mb-6">Create your first promotion plan to get started</p>
            <button
              onClick={handleAddPromo}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Your First Promotion
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Promotion Plan</h3>
              <p className="text-gray-600">Are you sure you want to delete this promotion plan? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingPlan(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePromo(deletingPlan)}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoScreen;