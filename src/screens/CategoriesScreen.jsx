import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { FiEdit2, FiTrash2, FiEye, FiPlus, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { useAuth } from "../context/AuthContext";
import { useNavigate,Link } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const navigate = useNavigate();
  
  // Use AuthContext
  const { 
    token, 
    isAuthenticated, 
    logout,
    refreshToken 
  } = useAuth();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        setError('You are not authenticated. Please login again.');
        return;
      }

      // Prepare headers with auth token
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const response = await fetch("https://clark-backend.onrender.com/api/v1/categories", requestOptions);
      
      // Handle token expiration
      if (response.status === 401) {
        try {
          console.log('Token expired, attempting refresh...');
          // Try to refresh token
          const newToken = await refreshToken();
          if (newToken) {
            // Retry with new token
            const retryHeaders = new Headers();
            retryHeaders.append("Authorization", `Bearer ${newToken}`);
            
            const retryOptions = {
              method: "GET",
              headers: retryHeaders,
              redirect: "follow"
            };
            
            const retryResponse = await fetch("https://clark-backend.onrender.com/api/v1/categories", retryOptions);
            
            if (retryResponse.status === 401) {
              throw new Error('Token refresh failed - authentication required');
            }
            
            const retryResult = await retryResponse.json();
            
            if (retryResponse.ok && retryResult.status === 'success' && retryResult.data && retryResult.data.categories) {
              setCategories(retryResult.data.categories);
              return;
            } else {
              throw new Error(retryResult.message || 'Failed to fetch categories after token refresh');
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
        // Handle other authentication errors
        if (response.status === 403) {
          setError('You do not have permission to access this resource.');
          return;
        }
        throw new Error(result.message || `HTTP ${response.status}: Failed to fetch categories`);
      }

      if (result.status === 'success' && result.data && result.data.categories) {
        setCategories(result.data.categories);
      } else {
        console.error('Invalid response format:', result);
        setError('Invalid response format from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch categories if authenticated
    if (isAuthenticated && token) {
      fetchCategories();
    } else {
      setError('You need to be logged in to view this page.');
      setLoading(false);
    }
  }, [isAuthenticated, token]); // Re-fetch when authentication state changes

  // Filter categories
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'recent' && new Date(cat.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesDate;
  });

  // Chart data for subcategories distribution
  const subcategoryCountData = {
    labels: categories.map(c => c.name),
    datasets: [{
      label: 'Number of Subcategories',
      data: categories.map(c => c.subcategories.length),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC24A', '#F06292', '#7986CB', '#4DB6AC',
        '#FFB74D', '#A1887F', '#90A4AE'
      ]
    }]
  };

  // Chart data for creation trend
  const creationTrendData = {
    labels: [...new Set(categories.map(c => new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })))],
    datasets: [{
      label: 'Categories Added',
      data: Object.values(categories.reduce((acc, c) => {
        const date = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})),
      backgroundColor: '#4BC0C0',
      borderColor: '#4BC0C0',
      tension: 0.1
    }]
  };

  // Stats calculations
  const totalCategories = categories.length;
  const mostSubcategories = categories.length > 0 ? Math.max(...categories.map(c => c.subcategories.length)) : 0;
  const avgSubcategories = categories.length > 0 ? (categories.reduce((sum, c) => sum + c.subcategories.length, 0) / totalCategories).toFixed(1) : 0;
  const newThisMonth = categories.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAddCategory = () => {
    // Navigate to add category page
    navigate('/admin/categories/add');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        if (!isAuthenticated || !token) {
          setError('You are not authenticated. Please login again.');
          return;
        }

        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        
        const requestOptions = {
          method: "DELETE",
          headers: myHeaders,
          redirect: "follow"
        };

        const response = await fetch(`https://clark-backend.onrender.com/api/v1/categories/${id}`, requestOptions);
        
        // Handle token expiration
        if (response.status === 401) {
          try {
            const newToken = await refreshToken();
            if (newToken) {
              const retryHeaders = new Headers();
              retryHeaders.append("Authorization", `Bearer ${newToken}`);
              
              const retryOptions = {
                method: "DELETE",
                headers: retryHeaders,
                redirect: "follow"
              };
              
              const retryResponse = await fetch(`https://clark-backend.onrender.com/api/v1/categories/${id}`, retryOptions);
              
              if (retryResponse.ok) {
                setCategories(categories.filter(cat => cat._id !== id));
                return;
              } else {
                const retryResult = await retryResponse.json();
                throw new Error(retryResult.message || 'Failed to delete category after token refresh');
              }
            }
          } catch (refreshError) {
            setError('Your session has expired. Please login again.');
            logout();
            return;
          }
        }
        
        if (response.ok) {
          setCategories(categories.filter(cat => cat._id !== id));
        } else {
          const result = await response.json();
          throw new Error(result.message || 'Failed to delete category');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleSave = async (updatedCategory) => {
    try {
      setModalLoading(true);
      
      if (!isAuthenticated || !token) {
        setError('You are not authenticated. Please login again.');
        return;
      }

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const formdata = new FormData();
      formdata.append("name", updatedCategory.name);
      
      // Handle image - if it's a file, append it, if it's a URL string, append as is
      if (updatedCategory.image instanceof File) {
        formdata.append("image", updatedCategory.image);
      } else if (typeof updatedCategory.image === 'string') {
        formdata.append("image", updatedCategory.image);
      }
      
      updatedCategory.subcategories.forEach(sub => formdata.append("subcategories", sub));

      const requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: formdata,
        redirect: "follow"
      };
      
      const url = `https://clark-backend.onrender.com/api/v1/categories/${updatedCategory._id}`;

      const response = await fetch(url, requestOptions);
      
      // Handle token expiration
      if (response.status === 401) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            const retryHeaders = new Headers();
            retryHeaders.append("Authorization", `Bearer ${newToken}`);
            
            const retryOptions = {
              method: "PATCH",
              headers: retryHeaders,
              body: formdata,
              redirect: "follow"
            };
            
            const retryResponse = await fetch(url, retryOptions);
            
            if (retryResponse.ok) {
              fetchCategories(); // Refresh the list
              closeModal();
              return;
            } else {
              const retryResult = await retryResponse.json();
              throw new Error(retryResult.message || 'Failed to update category after token refresh');
            }
          }
        } catch (refreshError) {
          setError('Your session has expired. Please login again.');
          logout();
          return;
        }
      }
      
      if (response.ok) {
        fetchCategories(); // Refresh the list
        closeModal();
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update category');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving category:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Show authentication error screen if not authenticated
  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-300 shadow-lg p-8 rounded-xl text-center">
          <div className="text-red-500 mb-4">
            <FiEye size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Authentication Required</h2>
            <p className="text-gray-600">You need to be logged in to access this page.</p>
          </div>
          <button
            onClick={() => navigate('/login')}
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="text-lg">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={fetchCategories}
            className="ml-4 text-red-500 hover:text-red-700 underline"
          >
            Retry
          </button>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Categories Management</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Categories" value={totalCategories} icon="📂" />
        <StatCard title="Most Subcategories" value={mostSubcategories} icon="🗂️" />
        <StatCard title="Avg Subcategories" value={avgSubcategories} icon="📊" />
        <StatCard title="New This Month" value={newThisMonth} icon="🆕" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-800">Subcategories Distribution</h3>
          <Pie data={subcategoryCountData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-800">Creation Trend</h3>
          <Bar data={creationTrendData} />
        </div>
      </div>

   {/* Search and Filter */}
<div className="flex flex-col md:flex-row gap-4 mb-6">
  <div className="relative flex-grow">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <FiSearch className="text-gray-400" />
    </div>
    <input
      type="text"
      placeholder="Search categories..."
      className="pl-10 p-2 border rounded-lg w-full focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <FiFilter className="text-gray-400" />
    </div>
    <select 
      className="pl-10 p-2 border rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
      onChange={(e) => setDateFilter(e.target.value)}
    >
      <option value="all">All Time</option>
      <option value="recent">Last 7 Days</option>
    </select>
  </div>
  <Link 
    to="/add-category" 
    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-300"
  >
    <FiPlus /> Add Category
  </Link>
</div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Subcategories</TableHeader>
              <TableHeader>Image</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCategories.map(category => (
              <tr key={category._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{category.subcategories.length}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(category.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => openEditModal(category)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3 transition duration-300"
                  >
                    <FiEdit2 className="inline mr-1" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(category._id)}
                    className="text-red-600 hover:text-red-900 transition duration-300"
                  >
                    <FiTrash2 className="inline mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No categories found matching your criteria.
          </div>
        )}
      </div>

      {/* Category Edit Modal */}
      {isModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CategoryModal 
            category={selectedCategory} 
            onClose={closeModal} 
            onSave={handleSave}
            loading={modalLoading}
          />
        </div>
      )}
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{title}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold mt-2 text-gray-800">{value}</div>
  </div>
);

const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const CategoryModal = ({ category, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState(category);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(category.image);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFormData({ ...formData, image: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategory.trim() && !formData.subcategories.includes(newSubcategory.trim())) {
      setFormData({
        ...formData,
        subcategories: [...formData.subcategories, newSubcategory.trim()]
      });
      setNewSubcategory('');
    }
  };

  const handleRemoveSubcategory = (subcat) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter(s => s !== subcat)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Edit Category</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition duration-300"
        >
          <FiX size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Category Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Category Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded"
              />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Subcategories</label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              className="flex-grow p-2 border rounded-l focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="Add new subcategory"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubcategory())}
            />
            <button
              type="button"
              onClick={handleAddSubcategory}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 rounded-r transition duration-300"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.subcategories.map(subcat => (
              <div 
                key={subcat} 
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
              >
                <span className="text-sm text-gray-700">{subcat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubcategory(subcat)}
                  className="ml-2 text-red-500 hover:text-red-700 transition duration-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition duration-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:from-purple-600 hover:to-pink-600 transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoriesScreen;