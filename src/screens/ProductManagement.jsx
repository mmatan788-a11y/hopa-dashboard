import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  Package,
  Grid,
  List,
  MoreVertical,
  Star,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  EyeOff,
  AlertTriangle,
  Clock,
  Zap,
  Crown,
  TrendingUp
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ProductsManagement = () => {
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [productsNeedingRenewal, setProductsNeedingRenewal] = useState([]);
  const [hiddenProducts, setHiddenProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [hiddenLoading, setHiddenLoading] = useState(false);
  const navigate = useNavigate();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("dateUploaded");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  
  // Filter for showing hidden products
  const [showHiddenProducts, setShowHiddenProducts] = useState(true);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Visibility toggle state
  const [visibilityLoading, setVisibilityLoading] = useState({});

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCategories();
      fetchProductsNeedingRenewal();
      fetchHiddenProducts();
      calculateExpiringProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const userResponse = await fetch(
        "https://hope-server-rho1.onrender.com/api/v1/users/me ",
        { headers }
      );
      
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.status}`);
      }

      const userResult = await userResponse.json();
      const userData = userResult.data?.user || userResult.user || userResult;

      const productsResponse = await fetch(
        "https://hope-server-rho1.onrender.com/api/v1/products ",
        { headers }
      );
      
      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products: ${productsResponse.status}`);
      }

      const productsResult = await productsResponse.json();
      const allProducts = productsResult.data?.products || productsResult.products || productsResult || [];

      // Filter to get only visible products owned by the user
      const userVisibleProducts = allProducts.filter(product => {
        const isOwner = product.owner?._id === userData._id || product.owner === userData._id;
        const isNotHidden = !product.promotionPlan?.isHidden;
        return isOwner && isNotHidden;
      });

      setProducts(userVisibleProducts);
    } catch (err) {
      console.error("Products fetch error:", err);
      setError(err.message || "Failed to fetch products");
      toast.error("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsNeedingRenewal = async () => {
    try {
      setRenewalLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(
        "https://hope-server-rho1.onrender.com/api/v1/products/needs-renewal ",
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        setProductsNeedingRenewal(result.data?.products || []);
      }
    } catch (error) {
      console.warn("Failed to fetch products needing renewal:", error);
    } finally {
      setRenewalLoading(false);
    }
  };

  const fetchHiddenProducts = async () => {
    try {
      setHiddenLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(
        "https://hope-server-rho1.onrender.com/api/v1/products/hidden ",
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        const hidden = result.data?.products || [];
        console.log('[fetchHiddenProducts] Hidden products fetched:', hidden.length);
        setHiddenProducts(hidden);
      } else {
        console.error('[fetchHiddenProducts] Failed to fetch:', response.status);
      }
    } catch (error) {
      console.error("Failed to fetch hidden products:", error);
    } finally {
      setHiddenLoading(false);
    }
  };

  const calculateExpiringProducts = () => {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const expiring = [...products, ...hiddenProducts].filter(product => {
      if (!product.promotionPlan?.expiryDate) return false;
      const expiryDate = new Date(product.promotionPlan.expiryDate);
      return expiryDate <= oneDayFromNow && expiryDate > now;
    });
    
    setExpiringProducts(expiring);
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const response = await fetch(
        "https://hope-server-rho1.onrender.com/api/v1/categories ",
        { headers }
      );
      
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || result || []);
      }
    } catch (error) {
      console.warn("Failed to fetch categories:", error);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  const getPromotionType = (product) => {
    if (!product.promotionPlan) return 'standard';
    return product.promotionPlan.type || 'standard';
  };

  const getPromotionTag = (product) => {
    const promotionType = getPromotionType(product);
    
    switch (promotionType) {
      case 'basic':
        return {
          label: 'Basic',
          icon: <Zap className="h-3 w-3" />,
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          iconColor: 'text-purple-500'
        };
      case 'premium':
        return {
          label: 'Premium',
          icon: <Crown className="h-3 w-3" />,
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          iconColor: 'text-yellow-500'
        };
      case 'ultra':
        return {
          label: 'Ultra',
          icon: <TrendingUp className="h-3 w-3" />,
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          iconColor: 'text-blue-500'
        };
      default:
        return {
          label: 'Free',
          icon: <Package className="h-3 w-3" />,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          iconColor: 'text-gray-500'
        };
    }
  };

  const handleToggleVisibility = async (product) => {
    const isCurrentlyHidden = product.promotionPlan?.isHidden;
    const action = isCurrentlyHidden ? 'show' : 'hide';
    
    try {
      setVisibilityLoading(prev => ({ ...prev, [product._id]: true }));
      const token = localStorage.getItem("accessToken");
      
      console.log(`[handleToggleVisibility] Product: ${product.name}, Currently Hidden: ${isCurrentlyHidden}, Action: ${action}`);
      
      // Show loading toast
      const loadingToast = toast.loading(
        isCurrentlyHidden 
          ? `Showing "${product.name}"...` 
          : `Hiding "${product.name}"...`,
        {
          position: "top-right"
        }
      );
      
      const response = await fetch(
        `https://hope-server-rho1.onrender.com/api/v1/products/${product._id}/${action}`,
        {
          method: 'PATCH',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const result = await response.json();

      if (response.ok) {
        const updatedProduct = result.data.product;
        const isNowHidden = updatedProduct.promotionPlan.isHidden;
        
        console.log(`[handleToggleVisibility] Success! Now Hidden: ${isNowHidden}`);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(
          result.message || (isNowHidden 
            ? `✓ "${product.name}" is now hidden from public listings` 
            : `✓ "${product.name}" is now visible in public listings`),
          {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        
        // Refresh all lists to reflect the change
        await Promise.all([
          fetchProducts(),
          fetchHiddenProducts(),
          fetchProductsNeedingRenewal()
        ]);
        
      } else {
        // Dismiss loading toast and show error
        toast.dismiss(loadingToast);
        const errorMessage = result.message || 'Failed to update visibility';
        
        toast.error(
          `✗ ${errorMessage}`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        
        console.error('[handleToggleVisibility] Error:', errorMessage);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error(
        `✗ Failed to ${action} "${product.name}". Please check your connection and try again.`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setVisibilityLoading(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(
        `https://hope-server-rho1.onrender.com/api/v1/products/${productToDelete._id}`,
        {
          method: 'DELETE',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.ok) {
        // Remove from both visible and hidden lists
        setProducts(products.filter(p => p._id !== productToDelete._id));
        setHiddenProducts(hiddenProducts.filter(p => p._id !== productToDelete._id));
        setShowDeleteModal(false);
        setProductToDelete(null);
        
        toast.success(`"${productToDelete.name}" has been successfully deleted!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Refresh renewal list
        fetchProductsNeedingRenewal();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete "${productToDelete?.name}". Please try again.`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Combine visible and hidden products based on filter
  const allUserProducts = showHiddenProducts 
    ? [...products, ...hiddenProducts]
    : products;

  const filteredAndSortedProducts = allUserProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.subcategory === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case "name":
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case "price":
          valueA = a.discountPrice || a.price;
          valueB = b.discountPrice || b.price;
          break;
        case "views":
          valueA = a.views || 0;
          valueB = b.views || 0;
          break;
        case "rating":
          valueA = a.rating || 0;
          valueB = b.rating || 0;
          break;
        case "dateUploaded":
        default:
          valueA = new Date(a.dateUploaded || 0);
          valueB = new Date(b.dateUploaded || 0);
          break;
      }
      
      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, sortOrder, showHiddenProducts]);

  // Miniature Product Card Component
  const MiniProductCard = ({ product }) => {
    const isHidden = product.promotionPlan?.isHidden;
    const promotionTag = getPromotionTag(product);
    
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={() => handleProductClick(product)}
      >
        {/* Product Image */}
        <div className="relative aspect-square">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className={`w-full h-full object-cover ${isHidden ? 'opacity-50' : ''}`}
              onError={(e) => {
                e.target.src = '/api/placeholder/200/200';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          {/* Promotion Type Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs ${promotionTag.color} border rounded-full font-medium flex items-center gap-1`}>
              {promotionTag.icon}
              {promotionTag.label}
            </span>
          </div>
          
          {isHidden && (
            <div className="absolute top-2 right-2">
              <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full font-medium">
                Hidden
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-gray-900">
              GH₵{product.discountPrice || product.price}
            </span>
            {product.rating && (
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
            <Link 
              to={`/vendordashboard/edit-product/${product._id}`}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit Product"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit3 className="h-4 w-4" />
            </Link>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility(product);
              }}
              disabled={visibilityLoading[product._id]}
              className={`p-1.5 rounded transition-colors ${
                isHidden 
                  ? 'text-green-600 hover:bg-green-50' 
                  : 'text-orange-600 hover:bg-orange-50'
              }`}
              title={isHidden ? "Show Product" : "Hide Product"}
            >
              {visibilityLoading[product._id] ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isHidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProductToDelete(product);
                setShowDeleteModal(true);
              }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Product"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
            <p className="text-gray-600 mt-1 text-sm">
              {allUserProducts.length} total products ({products.length} visible, {hiddenProducts.length} hidden)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/vendordashboard/products-renewal">
              <button className="flex items-center bg-orange-600 text-white rounded-lg px-4 py-2 hover:bg-orange-700 transition-colors text-sm mb-2 sm:mb-0">
                <RefreshCw className="h-4 w-4 mr-2" />
                Manage Renewals
              </button>
            </Link>
            <Link to="/vendordashboard/add-products">
              <button className="flex items-center bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Hidden Products Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium mb-1">Hidden Products</p>
                <p className="text-2xl font-bold text-gray-900">{hiddenProducts.length}</p>
                <p className="text-xs text-red-600 mt-1">Not visible to customers</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <EyeOff className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          {/* Expiring Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium mb-1">Expiring Today</p>
                <p className="text-2xl font-bold text-gray-900">{expiringProducts.length}</p>
                <p className="text-xs text-orange-600 mt-1">Renew to maintain visibility</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          {/* Needs Renewal Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Need Renewal</p>
                <p className="text-2xl font-bold text-gray-900">{productsNeedingRenewal.length}</p>
                <p className="text-xs text-blue-600 mt-1">Require immediate attention</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Categories</option>
              {[...new Set(allUserProducts.map(p => p.subcategory).filter(Boolean))].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="dateUploaded">Date Added</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="views">Views</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {paginatedProducts.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
                {paginatedProducts.map((product) => (
                  <MiniProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mb-6">
                {paginatedProducts.map((product) => {
                  const isHidden = product.promotionPlan?.isHidden;
                  const promotionTag = getPromotionTag(product);
                  
                  return (
                    <motion.div
                      key={product._id}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className={`bg-white rounded-lg border p-4 mb-3 ${isHidden ? 'border-red-200 bg-red-50' : 'border-gray-100'} cursor-pointer`}
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 relative">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className={`w-16 h-16 object-cover rounded-lg ${isHidden ? 'opacity-50' : ''}`}
                              onError={(e) => {
                                e.target.src = '/api/placeholder/64/64';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          {isHidden && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                              <EyeOff className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                            <span className={`px-2 py-1 text-xs ${promotionTag.color} border rounded-full flex items-center gap-1`}>
                              {promotionTag.icon}
                              {promotionTag.label}
                            </span>
                            {isHidden && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Hidden</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm truncate">{product.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {product.views || 0} views
                            </span>
                            <span>{product.subcategory || 'Uncategorized'}</span>
                            <span>Added {new Date(product.dateUploaded).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ${product.discountPrice || product.price}
                            </div>
                            {product.discountPrice && (
                              <div className="text-sm text-gray-500 line-through">
                                ${product.price}
                              </div>
                            )}
                            {product.rating && (
                              <div className="flex items-center justify-end mt-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link 
                              to={`/vendordashboard/edit-product/${product._id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="Edit Product"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVisibility(product);
                              }}
                              disabled={visibilityLoading[product._id]}
                              className={`p-2 rounded-full transition-colors ${
                                isHidden 
                                  ? 'text-green-600 hover:bg-green-50' 
                                  : 'text-orange-600 hover:bg-orange-50'
                              }`}
                              title={isHidden ? "Show Product" : "Hide Product"}
                            >
                              {visibilityLoading[product._id] ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : isHidden ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProductToDelete(product);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-3">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + productsPerPage, filteredAndSortedProducts.length)} of{' '}
                  {filteredAndSortedProducts.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/vendordashboard/products-renewal">
                <button className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors mb-2 sm:mb-0">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Manage Renewals
                </button>
              </Link>
              <Link to="/vendordashboard/add-products">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Product
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </motion.div>
    </div>
  );
};

export default ProductsManagement;