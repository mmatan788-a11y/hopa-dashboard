import React, { useState, useEffect } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Shield } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import StatCard from '../components/statCard/StatCard';
import TableHeader from '../components/tableHeader/TableHeader';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const ProductScreen = () => {
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  const [deletingProduct, setDeletingProduct] = useState(null);
  const navigate = useNavigate();

  // Use AuthContext
  const { 
    token, 
    isAuthenticated, 
    logout,
    refreshToken 
  } = useAuth();

  // Fetch products from API with authentication
  const fetchProducts = async () => {
    try {
      setProductLoading(true);
      setError(null);
      
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
      
      const response = await fetch("https://clark-backend.onrender.com/api/v1/products", requestOptions);
      
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
            
            const retryResponse = await fetch("https://clark-backend.onrender.com/api/v1/products", retryOptions);
            
            if (retryResponse.status === 401) {
              throw new Error('Token refresh failed - authentication required');
            }
            
            const retryResult = await retryResponse.json();
            
            if (retryResponse.ok && retryResult.status === 'success' && retryResult.data && retryResult.data.products) {
              setProducts(retryResult.data.products);
              return;
            } else {
              throw new Error(retryResult.message || 'Failed to fetch products after token refresh');
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
        throw new Error(result.message || `HTTP ${response.status}: Failed to fetch products`);
      }
      
      // Handle the specific API response structure: { status: 'success', results: number, data: { products: [...] } }
      if (result.status === 'success' && result.data && result.data.products && Array.isArray(result.data.products)) {
        setProducts(result.data.products);
      } else {
        console.error('Unexpected API response structure:', result);
        setError('Invalid API response structure. Expected products array not found.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to fetch products. Please try again later.');
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch products if authenticated
    if (isAuthenticated && token) {
      fetchProducts();
    } else {
      setError('You need to be logged in to view this page.');
      setProductLoading(false);
    }
  }, [isAuthenticated, token]); // Re-fetch when authentication state changes

  // Delete product function with authentication
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setDeletingProduct(productId);
      
      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        toast.error('You are not authenticated. Please login again.');
        return;
      }

      // Prepare headers with auth token
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        redirect: "follow"
      };
      
      const response = await fetch(`https://clark-backend.onrender.com/api/v1/products/${productId}`, requestOptions);
      
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
              method: "DELETE",
              headers: retryHeaders,
              redirect: "follow"
            };
            
            const retryResponse = await fetch(`https://clark-backend.onrender.com/api/v1/products/${productId}`, retryOptions);
            
            if (retryResponse.status === 401) {
              throw new Error('Token refresh failed - authentication required');
            }
            
            if (retryResponse.ok) {
              // Remove product from local state
              setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
              
              toast.success('Product deleted successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              return;
            } else {
              const retryResult = await retryResponse.json();
              throw new Error(retryResult.message || 'Failed to delete product after token refresh');
            }
          } else {
            throw new Error('Token refresh returned null');
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          toast.error('Your session has expired. Please login again.');
          logout();
          return;
        }
      }
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      
      // Remove product from local state
      setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
      
      toast.success('Product deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setDeletingProduct(null);
    }
  };

  // Navigate to add product page
  const handleAddProduct = () => {
    navigate('/add-product');
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    // Name search filter
    const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Price range filter
    let priceMatch = true;
    if (priceRangeFilter === 'under100') priceMatch = product.price < 100;
    else if (priceRangeFilter === '100to500') priceMatch = product.price >= 100 && product.price <= 500;
    else if (priceRangeFilter === 'over500') priceMatch = product.price > 500;
    
    return nameMatch && priceMatch;
  });

  // Enhanced Product Analytics
  const totalProducts = products.length;
  const discountedProducts = products.filter(p => p.discount && p.discount > 0).length;
  const avgProductPrice = totalProducts > 0 ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;
  const totalProductViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalReviews = products.reduce((sum, p) => sum + (p.numReviews || 0), 0);
  const avgRating = products.length > 0 ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length : 0;
  const premiumProducts = products.filter(p => p.promotionPlan?.type === 'premium').length;
  const usedProducts = products.filter(p => p.condition === 'used').length;
  const newProducts = products.filter(p => p.condition === 'new').length;

  // Product chart data
  const subcategories = products.map(p => p.subcategory).filter(Boolean);
  const uniqueSubcategories = [...new Set(subcategories)];
  
  const productCategoryData = {
    labels: uniqueSubcategories,
    datasets: [{
      data: uniqueSubcategories.map(cat => 
        products.filter(p => p.subcategory === cat).length
      ),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF']
    }]
  };

  const priceRanges = {
    'Under $100': products.filter(p => p.price < 100).length,
    '$100-$500': products.filter(p => p.price >= 100 && p.price <= 500).length,
    'Over $500': products.filter(p => p.price > 500).length
  };

  const priceDistributionData = {
    labels: Object.keys(priceRanges),
    datasets: [{
      label: 'Products by Price Range',
      data: Object.values(priceRanges),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }]
  };

  // Condition distribution data
  const conditionData = {
    labels: ['New', 'Used'],
    datasets: [{
      label: 'Products by Condition',
      data: [newProducts, usedProducts],
      backgroundColor: ['#4BC0C0', '#FF9F40']
    }]
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

  if (productLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchProducts} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 mr-2"
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
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={handleAddProduct}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <span>+</span>
          Add Product
        </button>
      </div>

      {/* Enhanced Product Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Products" value={totalProducts} icon="📦" />
        <StatCard title="Total Views" value={totalProductViews} icon="👀" />
        <StatCard title="Avg. Price" value={`$${avgProductPrice.toFixed(2)}`} icon="💰" />
        <StatCard title="Avg. Rating" value={avgRating.toFixed(1)} icon="⭐" />
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Discounted" value={discountedProducts} icon="🏷️" />
        <StatCard title="Total Reviews" value={totalReviews} icon="💬" />
        <StatCard title="Premium Products" value={premiumProducts} icon="⭐" />
        <StatCard title="Used Products" value={usedProducts} icon="♻️" />
      </div>

      {/* Enhanced Product Charts */}
      {totalProducts > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Categories Distribution</h3>
            {uniqueSubcategories.length > 0 ? (
              <Pie data={productCategoryData} />
            ) : (
              <p className="text-gray-500 text-center py-8">No category data available</p>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Price Distribution</h3>
            <Bar data={priceDistributionData} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Product Condition</h3>
            <Pie data={conditionData} />
          </div>
        </div>
      )}

      {/* Product Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products by name..."
          className="p-2 border rounded-lg flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="p-2 border rounded-lg"
          value={priceRangeFilter}
          onChange={(e) => setPriceRangeFilter(e.target.value)}
        >
          <option value="all">All Prices</option>
          <option value="under100">Under $100</option>
          <option value="100to500">$100 - $500</option>
          <option value="over500">Over $500</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredProducts.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <TableHeader>Product</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Discount</TableHeader>
                <TableHeader>Views</TableHeader>
                <TableHeader>Rating</TableHeader>
                <TableHeader>Condition</TableHeader>
                <TableHeader>Seller</TableHeader>
                <TableHeader>Plan</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <ProductTableRow 
                  key={product._id || product.id} 
                  product={product} 
                  onDelete={handleDeleteProduct}
                  isDeleting={deletingProduct === product._id}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              {totalProducts === 0 ? 'No products available' : 'No products match your search criteria'}
            </p>
          </div>
        )}
      </div>
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

const ProductTableRow = ({ product, onDelete, isDeleting }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-10 h-10 rounded-md object-cover mr-3"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="w-10 h-10 rounded-md bg-gray-200 mr-3 flex items-center justify-center" 
             style={{display: product.images && product.images.length > 0 ? 'none' : 'flex'}}>
          <span className="text-xs text-gray-500">No Image</span>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{product.name}</div>
          <div className="text-xs text-gray-500">{product.subcategory || 'No category'}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      ${product.price.toFixed(2)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {product.discount && product.discount > 0 ? (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          {product.discount}%
        </span>
      ) : (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
          None
        </span>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {product.views || 0}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {product.rating && product.rating > 0 ? (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          {product.rating.toFixed(1)} ★
        </span>
      ) : (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
          No ratings
        </span>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 py-1 text-xs rounded-full ${
        product.condition === 'new' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-orange-100 text-orange-800'
      }`}>
        {product.condition || 'Unknown'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {product.owner?.username || 'Unknown'}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 py-1 text-xs rounded-full ${
        product.promotionPlan?.type === 'premium' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {product.promotionPlan?.type || 'Basic'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <button 
        onClick={() => onDelete(product._id)}
        disabled={isDeleting}
        className={`text-red-600 hover:text-red-900 ${
          isDeleting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </td>
  </tr>
);

export default ProductScreen;