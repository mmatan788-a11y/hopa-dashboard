import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  RefreshCw,
  AlertTriangle,
  Clock,
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  X,
  TrendingUp,
  CreditCard,
  ExternalLink,
  Zap,
  Crown,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductsRenewal = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewalLoading, setRenewalLoading] = useState({});
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const navigate = useNavigate();

  // Payment states
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'awaiting_payment', 'payment_success'
  const [paymentReference, setPaymentReference] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  useEffect(() => {
    fetchProductsNeedingRenewal();
  }, []);

  // Poll payment status when in 'awaiting_payment'
  useEffect(() => {
    let intervalId;
    if (paymentStep === 'awaiting_payment' && paymentReference) {
      const verifyPayment = async () => {
        try {
          setIsVerifying(true);
          const token = localStorage.getItem("accessToken");
          
          console.log('Checking payment status for:', paymentReference);
          
          const response = await fetch(
            `https://hope-server-rho1.onrender.com/api/v1/payments/check-status/${paymentReference}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          
          if (response.ok) {
            const result = await response.json();
            console.log('Payment status result:', result);
            const status = result.status;
            
            if (status === 'success' || status === 'completed') {
              setPaymentStep('payment_success');
              toast.success('✅ Payment confirmed! Your product promotion has been renewed.');
              setTimeout(() => {
                setShowRenewalModal(false);
                setPaymentStep('form');
                setPaymentReference(null);
                setPaymentUrl(null);
                fetchProductsNeedingRenewal();
              }, 3000);
            }
          }
        } catch (err) {
          console.error('Verification error:', err);
        } finally {
          setIsVerifying(false);
        }
      };
      
      verifyPayment();
      intervalId = setInterval(verifyPayment, 4000); // check every 4s
    }
    return () => clearInterval(intervalId);
  }, [paymentStep, paymentReference]);

  const fetchProductsNeedingRenewal = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(
        "https://hope-server-rho1.onrender.com/api/v1/products/needs-renewal",
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        const visibleProducts = (result.data?.products || []).filter(
          product => !product.promotionPlan?.isHidden
        );
        setProducts(visibleProducts);
      } else {
        toast.error("Failed to fetch products needing renewal");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("An error occurred while fetching products");
    } finally {
      setLoading(false);
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

  const handleRenewProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setRenewalLoading(prev => ({ ...prev, [`renew_${selectedProduct._id}`]: true }));
      const token = localStorage.getItem("accessToken");
      
      console.log('Renewing product:', {
        productId: selectedProduct._id,
        planType: selectedPlan,
        duration: selectedDuration
      });

      const response = await fetch(
        `https://hope-server-rho1.onrender.com/api/v1/payments/renew-promotion/${selectedProduct._id}`,
        {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            planType: selectedPlan,
            duration: selectedDuration
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Renewal response:', result);
        
        // Free plan - immediate success
        if (selectedPlan === 'free') {
          toast.success(`"${selectedProduct.name}" renewed with free plan for 3 months!`);
          setShowRenewalModal(false);
          setSelectedProduct(null);
          fetchProductsNeedingRenewal();
        } 
        // Paid plan - handle payment
        else {
          const { paymentUrl, reference, externalRef } = result.data;
          
          console.log('Payment details:', {
            paymentUrl,
            reference, 
            externalRef,
            productId: selectedProduct._id
          });

          setPaymentUrl(paymentUrl);
          setPaymentReference(externalRef); // Use externalRef for status checking
          setPaymentStep('awaiting_payment');
          toast.info('✅ Payment link generated. Please complete payment in the new tab.');
          
          // Open payment in new tab
          if (paymentUrl) {
            window.open(paymentUrl, '_blank', 'noopener,noreferrer');
          }
        }
      } else {
        const error = await response.json();
        console.error('Renewal failed:', error);
        throw new Error(error.message || 'Failed to renew product');
      }
    } catch (error) {
      console.error('Error renewing product:', error);
      toast.error(error.message || 'Failed to renew product. Please try again.');
    } finally {
      setRenewalLoading(prev => ({ ...prev, [`renew_${selectedProduct._id}`]: false }));
    }
  };

  const debugPendingRenewal = async (externalRef) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `https://hope-server-rho1.onrender.com/api/v1/payments/debug/${externalRef}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log('DEBUG - Pending Renewal:', result.data);
      }
    } catch (error) {
      console.error('Debug failed:', error);
    }
  };

  const getProductStatus = (product) => {
    const now = new Date();
    const expiryDate = product.promotionPlan?.expiryDate ? new Date(product.promotionPlan.expiryDate) : null;
    
    if (expiryDate) {
      const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining <= 0) {
        return {
          label: 'Expired',
          color: 'red',
          icon: XCircle,
          description: 'Promotion has expired',
          daysRemaining: 0
        };
      } else if (daysRemaining <= 2) {
        return {
          label: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`,
          color: 'red',
          icon: AlertTriangle,
          description: 'Expiring very soon',
          daysRemaining
        };
      } else if (daysRemaining <= 7) {
        return {
          label: `${daysRemaining} days left`,
          color: 'orange',
          icon: Clock,
          description: 'Expiring soon',
          daysRemaining
        };
      }
    }
    
    return null;
  };

  const getCriticalProducts = () => {
    return products.filter(p => {
      const status = getProductStatus(p);
      return status && status.daysRemaining <= 2;
    });
  };

  const promotionPlans = {
    free: { 
      name: 'Free Plan', 
      duration: '3 months',
      price: 0,
      features: ['Basic listing visibility', '3 months duration']
    },
    basic: { 
      name: 'Basic Promotion', 
      durations: [
        { days: 7, price: 25 },
        { days: 14, price: 40 },
        { days: 30, price: 60 }
      ],
      features: ['Priority listing', 'Enhanced visibility']
    },
    premium: { 
      name: 'Premium Promotion', 
      durations: [
        { days: 7, price: 40 },
        { days: 14, price: 50 },
        { days: 30, price: 80 }
      ],
      features: ['Priority listing', 'Featured product badge', 'Top search results']
    },
    ultra: { 
      name: 'Ultra Promotion', 
      durations: [
        { days: 7, price: 50 },
        { days: 14, price: 70 },
        { days: 30, price: 120 }
      ],
      features: ['Highest priority listing', 'Premium featured badge', 'Advanced analytics', 'Custom badge']
    }
  };

  const getCurrentPrice = () => {
    if (selectedPlan === 'free') return 0;
    const plan = promotionPlans[selectedPlan];
    const duration = plan.durations.find(d => d.days === selectedDuration);
    return duration?.price || 0;
  };

  const handleManualVerify = async () => {
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `https://hope-server-rho1.onrender.com/api/v1/payments/check-status/${paymentReference}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' || result.status === 'completed') {
          setPaymentStep('payment_success');
          toast.success('Payment confirmed! Your promotion has been renewed.');
          setTimeout(() => {
            setShowRenewalModal(false);
            setPaymentStep('form');
            setPaymentReference(null);
            setPaymentUrl(null);
            fetchProductsNeedingRenewal();
          }, 2000);
        } else {
          toast.info('Payment not yet completed. Please finish in the payment tab.');
        }
      }
    } catch (err) {
      toast.error('Failed to verify payment. Please try again.');
    } finally {
      setIsVerifying(false);
    }
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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2 text-sm sm:text-base transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Products Renewal</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and renew promotions
              </p>
            </div>
            <button
              onClick={fetchProductsNeedingRenewal}
              className="flex items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Critical (≤2 days)</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {getCriticalProducts().length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Immediate attention</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Expiring Soon</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {products.filter(p => {
                    const status = getProductStatus(p);
                    return status && (status.color === 'red' || status.color === 'orange');
                  }).length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Within 7 days</p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {products.map((product) => {
              const status = getProductStatus(product);
              const StatusIcon = status?.icon;
              const promotionTag = getPromotionTag(product);
              
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow flex flex-col cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Product Image */}
                  <div className="relative">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-32 sm:h-36 md:h-40 object-cover rounded-t-lg"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/300';
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 sm:h-36 md:h-40 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <Package className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Promotion Type Badge */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                      <span className={`px-1.5 py-0.5 text-[10px] sm:text-xs ${promotionTag.color} border rounded-full font-medium flex items-center gap-1`}>
                        {promotionTag.icon}
                        {promotionTag.label}
                      </span>
                    </div>
                    
                    {/* Status Badge Overlay */}
                    {status && (
                      <div className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${
                        status.color === 'red' 
                          ? 'bg-red-500 text-white'
                          : status.color === 'orange'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span className="text-[10px] sm:text-xs">{status.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-2 sm:p-3 flex-1 flex flex-col">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                      {product.description}
                    </p>

                    <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3 mt-auto">
                      {/* Promotion Type */}
                      <div className="flex items-center text-[10px] sm:text-xs text-gray-600">
                        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{product.promotionPlan?.type || 'free'}</span>
                      </div>

                      {/* Expiry Date */}
                      {product.promotionPlan?.expiryDate && (
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-600">
                          <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(product.promotionPlan.expiryDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center text-xs sm:text-sm font-bold text-gray-900">
                        GH₵{product.discountPrice || product.price}
                      </div>

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-600">
                          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-yellow-400 fill-current" />
                          <span>{product.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Renew Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setShowRenewalModal(true);
                        setSelectedPlan('free');
                        setSelectedDuration(30);
                        setPaymentStep('form');
                      }}
                      className="w-full flex items-center justify-center bg-blue-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-[10px] sm:text-xs font-medium"
                    >
                      <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      Renew
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              All Products Up to Date!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You don't have any products that need renewal at this time.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              View All Products
            </button>
          </div>
        )}

        {/* Renewal Modal */}
        {showRenewalModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* AWAITING PAYMENT VIEW */}
              {paymentStep === 'awaiting_payment' && (
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
                  <p className="text-gray-600 mb-6">
                    Please complete payment to renew your product promotion
                  </p>

                  {paymentUrl && (
                    <button
                      onClick={() => window.open(paymentUrl, '_blank', 'noopener,noreferrer')}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md transition-colors mb-6"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Payment Page 
                    </button>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      ⏳ We're automatically checking your payment status every few seconds.
                      Once confirmed, your product promotion will be renewed immediately.
                    </p>
                  </div>

                  <button
                    onClick={handleManualVerify}
                    disabled={isVerifying}
                    className={`px-5 py-2.5 rounded-md mb-4 ${
                      isVerifying
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isVerifying ? 'Verifying...' : '✅ I Completed Payment – Verify Now'}
                  </button>

                  {/* Debug button */}
                  <button
                    onClick={() => debugPendingRenewal(paymentReference)}
                    className="px-4 py-2 text-xs bg-gray-200 text-gray-700 rounded mb-2"
                  >
                    🐛 Debug Payment
                  </button>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setPaymentStep('form');
                        setPaymentReference(null);
                        setPaymentUrl(null);
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ← Back to Form
                    </button>
                  </div>
                </div>
              )}

              {/* PAYMENT SUCCESS VIEW */}
              {paymentStep === 'payment_success' && (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your product promotion has been renewed successfully.
                  </p>
                  <p className="text-sm text-gray-500">Closing automatically...</p>
                </div>
              )}

              {/* FORM VIEW */}
              {paymentStep === 'form' && (
                <>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Renew Promotion</h3>
                    <button
                      onClick={() => {
                        setShowRenewalModal(false);
                        setSelectedProduct(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {selectedProduct.images && selectedProduct.images[0] && (
                        <img
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{selectedProduct.name}</h4>
                        <p className="text-sm text-gray-600">${selectedProduct.discountPrice || selectedProduct.price}</p>
                        {/* Current Promotion Type */}
                        <div className="mt-1">
                          <span className={`px-2 py-1 text-xs ${getPromotionTag(selectedProduct).color} border rounded-full font-medium flex items-center gap-1 w-fit`}>
                            {getPromotionTag(selectedProduct).icon}
                            Current: {getPromotionTag(selectedProduct).label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Promotion Plan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(promotionPlans).map(([key, plan]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedPlan(key);
                            if (key !== 'free') {
                              setSelectedDuration(plan.durations[0].days);
                            }
                          }}
                          className={`text-left p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                            selectedPlan === key
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-gray-900 text-sm sm:text-base">{plan.name}</h5>
                            {key === 'free' ? (
                              <span className="text-green-600 font-bold text-xs sm:text-sm">FREE</span>
                            ) : (
                              <span className="text-xs text-gray-600">Paid</span>
                            )}
                          </div>
                          <ul className="space-y-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="text-xs sm:text-sm text-gray-600 flex items-start">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Selection (for paid plans) */}
                  {selectedPlan !== 'free' && (
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Duration
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {promotionPlans[selectedPlan].durations.map((duration) => (
                          <button
                            key={duration.days}
                            onClick={() => setSelectedDuration(duration.days)}
                            className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                              selectedDuration === duration.days
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-sm sm:text-lg font-bold text-gray-900">{duration.days}d</div>
                              <div className="text-lg sm:text-xl font-bold text-blue-600 mt-1">${duration.price}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-gray-700">Plan:</span>
                      <span className="font-semibold text-gray-900">
                        {promotionPlans[selectedPlan].name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-gray-700">Duration:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedPlan === 'free' ? '3 months' : `${selectedDuration} days`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                      <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">
                        GH₵{getCurrentPrice()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                      onClick={() => {
                        setShowRenewalModal(false);
                        setSelectedProduct(null);
                      }}
                      className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm order-2 sm:order-1"
                      disabled={renewalLoading[`renew_${selectedProduct._id}`]}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRenewProduct}
                      disabled={renewalLoading[`renew_${selectedProduct._id}`]}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm order-1 sm:order-2"
                    >
                      {renewalLoading[`renew_${selectedProduct._id}`] ? (
                        <span className="flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </span>
                      ) : selectedPlan === 'free' ? (
                        'Confirm Renewal'
                      ) : (
                        <span className="flex items-center justify-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Renew & Pay (GH₵{getCurrentPrice()})
                        </span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

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

export default ProductsRenewal;