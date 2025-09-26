import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, Trash2, Upload, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Ghana regions and towns data
const GHANA_LOCATIONS = [
  {
    region: "Greater Accra",
    capital: "Accra",
    towns: [
      "Accra Metropolitan", "Achimota", "Adabraka", "Aderita", "Tema Metropolitan", 
      "Abelemixpe", "Bahana Im", "Ablekuma", "Bubuashie", "Ashalman Municipal", 
      "Ashaley Bowe", "Ashomang Estate", "Asylum Down", "Averor Area", "Awoshe", 
      "Banana Im", "Ga East Municipal", "Ga South Municipal", "Ga West Municipal", 
      "Gbowe", "Haatso", "James Town", "Kaneshie", "Kasoa", "Abbdobi", 
      "Abossey Okai", "Accra New Town", "Adjiriganor", "Agbogba", "Agbogbloshie", 
      "Agbogloshie", "Airport Residential Area", "Akweteyman", "Alajo", "Aryaa", 
      "Darfia", "Dansoman", "Darkuman", "Dodowa", "Dome", "Dworwulu", "Dzorwulu", 
      "Fast Lenon", "Labone", "Lapaz", "Lartelokorshie", "Lartelokoshie", 
      "Ledzokuku-Krowor", "Little Legon", "Madina", "Mamobi", "Cantonments", 
      "Chorkor", "Circle", "Control", "Danfa", "Korie Gonno", "Kotobabi", 
      "Kwashieman", "Labadi", "Korle Gomo", "Kokomleme"
    ]
  },
  {
    region: "Eastern",
    capital: "Koforidua",
    towns: [
      "Akuapim South", "Asuogyaman", "East Akim Municipal", "New-Juaben Municipal", 
      "Akuapim North", "Akyemansa", "Atiwa", "Ayensuano", "Birim Central Municipal", 
      "Birim North", "Birim South", "Denkyembour", "Fanteakwa", "Kwaebibirem", 
      "Kwahu Afram Plains North", "Kwahu Afram Plains South", "Kwahu East", 
      "Kwahu South", "Kwahu West", "Lower Manya Krobo", "Suhum/Kraboa/Coaltar", 
      "Upper Manya Krobo", "Upper West Akim", "West Akim Municipal", "Yilo Krobo"
    ]
  },
  {
    region: "Ashanti",
    capital: "Kumasi",
    towns: [
      "Kumasi Metropolitan", "Atwima Kwanwoma", "Atwima Nwablagna", 
      "Ejisu-Juaben Municipal", "Kwabre", "Adansi North", "Adansi South", 
      "Afiqya-Kwabre", "Ahafo Ano North", "Ahafo Ano South", "Amansie Central", 
      "Amansie West", "Asante Akim Central Municipal", "Asante Akim North", 
      "Asante Akim South", "Asokore Mampong Municipal", "Atwima Mponua", 
      "Bekwal Municipal", "Bosome Freho", "Bosomwe", "Ejura/Sekyedumase", 
      "Mampong Municipal", "Obussi Municipal", "OffInso Municipal", "OffInso North", 
      "Sekyere Afram Plains", "Sekyere Central", "Sekyere East", "Sekyere Kumawu", 
      "Sekyere South"
    ]
  },
  {
    region: "Western",
    capital: "Sekondi-Takoradi",
    towns: [
      "Takoradi", "Ahanta West", "Shama Ahanta East Metropolitan", "Wassa West", 
      "Jomoro", "Mpohor/Wassa East", "Nzema East Prestea-Huni Valley", 
      "Tarkwa Nsuaem", "Wasa Amenfi East", "Wasa Amenfi West"
    ]
  },
  {
    region: "Western North",
    capital: "Sefwi Wiawso",
    towns: [
      "Aowin/Suaman Bia", "Bibiani/Anhwiaso/Bekwai", "Juabeso", "Sefwi-Wiawso"
    ]
  },
  {
    region: "Central",
    capital: "Cape Coast",
    towns: [
      "Awutu Senya East Municipal", "Cape Coast Metropolitan", "Effutu Municipal", 
      "Gomoa East", "Abura/Asebu/Kwamankese", "Agona East", "Agona West Municipal", 
      "Alumako/Enyan/Essiam", "Asikuma/Odoben/Brakwa", "Assin North Municipal", 
      "Assin South", "Awutu Senya West", "Ekumfi", "Gomoa West", 
      "Komenda/Edina/Eguafo/Abitem Municipal", "Mfantsiman Municipal", "Potsin", 
      "Twifo-Ati Morkwa", "Twifo/Heman/Lower Denkyira", "Upper Denkyira East", 
      "Upper Denkyira West"
    ]
  },
  {
    region: "Volta",
    capital: "Ho",
    towns: [
      "Ho Municipal", "Hohoe Municipal", "Keta Municipal", "Ketu South Municipal", 
      "Kpando Municipal", "Adaklu", "Afadjato South", "Agotime Ziope", 
      "Akatsi North", "Akatsi South", "Blakoye", "Central Tongu", "Ho West", 
      "Jasikan", "Kadjebi", "Ketu North Municipal", "North Dayi", "North Tongu", 
      "South Dayi", "South Tongu"
    ]
  },
  {
    region: "Oti",
    capital: "Dambai",
    towns: [
      "Krachi East", "Krachi Nchumuru", "Krachi West", "Nkwanta North", 
      "Nkwanta South"
    ]
  },
  {
    region: "Bono",
    capital: "Sunyani",
    towns: [
      "Sunyani Municipal", "Berekum Municipal", "Dormaa East", "Dormaa Municipal", 
      "Dormaa West", "Jaman North", "Jaman South", "Sunyani West", "Tain", 
      "Tano North", "Tano South", "Wenchi Municipal"
    ]
  },
  {
    region: "Bono East",
    capital: "Techiman",
    towns: [
      "Atebubu-Amantin", "Techiman Municipal", "Kintampo North Municipal", 
      "Kintampo South", "Nkoranza North", "Nkoranza South", "Pru", "Sene East", 
      "Sene West", "Techiman South"
    ]
  },
  {
    region: "Ahafo",
    capital: "Goaso",
    towns: [
      "Asunafo North Municipal", "Asunafo South", "Asutifi North", "Asutifi South"
    ]
  },
  {
    region: "Northern",
    capital: "Tamale",
    towns: [
      "Tamale Municipal", "Gushegu", "Karaga", "Kpandai", "Nanumba North", 
      "Nanumba South", "Saboba", "Savelugu-Nanton", "Tolon/Kumbungu", 
      "Yendi", "Zabzugu/Tatale", "Bunkpurugu-Yunyoo", "Chereponi", 
      "East Mamprusi"
    ]
  },
  {
    region: "Savannah",
    capital: "Damongo",
    towns: [
      "Sawla-Tuna-Kalba", "West Gonja", "Bole", "Central Gonja", "East Gonja"
    ]
  },
  {
    region: "North East",
    capital: "Nalerigu",
    towns: [
      "West Mamprusi"
    ]
  },
  {
    region: "Upper East",
    capital: "Bolgatanga",
    towns: [
      "Bawku Municipal", "Bolgatanga Municipal", "Bawku West", "Bongo District", 
      "Bulsa", "Garu-Tempane", "Kassena Nankana East", "Kassena Nankana West", 
      "Talensi-Nabdam"
    ]
  },
  {
    region: "Upper West",
    capital: "Wa",
    towns: [
      "Wa Municipal District", "Jirapa/Lambussie District", "Lawra District", 
      "Nadowli District", "Sissala East District", "Wa East District", 
      "Wa West District"
    ]
  }
];

const AddProducts = () => {
  const { user, fetchUserProfile } = useAuth();
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [productImages, setProductImages] = useState([]);
  const [selectedSellingType, setSelectedSellingType] = useState('both');
  const [categories, setCategories] = useState([]);
  const [promotionPlans, setPromotionPlans] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment flow states
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'payment_processing', 'payment_success'
  const [paymentData, setPaymentData] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Fetch categories and promotion plans on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Fetch categories
        const categoriesResponse = await axios.get(
          'https://clark-backend.onrender.com/api/v1/categories',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setCategories(categoriesResponse.data.data.categories);

        // Fetch promotion plans
        const promotionsResponse = await axios.get(
          'https://clark-backend.onrender.com/api/v1/payments/promotion-plans',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setPromotionPlans(promotionsResponse.data.data.promotionPlans);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load categories and promotion plans', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    fetchData();
  }, []);

  // Check payment status periodically when payment is processing
  useEffect(() => {
    let intervalId;
    
    if (paymentReference && paymentStep === 'payment_processing') {
      const checkPaymentStatus = async () => {
        try {
          setIsCheckingPayment(true);
          const token = localStorage.getItem('accessToken');
          
          const response = await axios.get(
            `https://clark-backend.onrender.com/api/v1/payments/check-status/${paymentReference}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          const status = response.data.status;
          
          if (status === 'success' || status === 'completed') {
            setPaymentStep('payment_success');
            toast.success('Payment successful! Your product is now live with premium promotion.', {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            clearInterval(intervalId);
            
            // Navigate to products page after success
            setTimeout(() => {
              navigate('/vendordashboard/productsmanagement');
            }, 3000);
          } else if (status === 'failed' || status === 'cancelled') {
            setPaymentStep('form');
            setPaymentReference(null);
            setPaymentData(null);
            toast.error('Payment failed or was cancelled. Please try again.', {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        } finally {
          setIsCheckingPayment(false);
        }
      };
      
      // Check immediately, then every 3 seconds
      checkPaymentStatus();
      intervalId = setInterval(checkPaymentStatus, 3000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentReference, paymentStep, navigate]);

  const onSubmit = async (data) => {
    // Validate images
    if (productImages.length === 0) {
      toast.error('Please upload at least one product image', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (productImages.length > 5) {
      toast.error('Maximum 5 images allowed', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Check each image size
    for (const image of productImages) {
      if (image.size > 10 * 1024 * 1024) { // 10MB
        toast.error('Each image should be less than 10MB', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    }

    // Validate location fields
    if (!data.region) {
      toast.error('Please select a region', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!data.town) {
      toast.error('Please select a town', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!data.specificAddress) {
      toast.error('Please enter a specific address', {
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
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      
      // Append basic product data
      formData.append('name', data.productName);
      formData.append('price', data.price);
      formData.append('description', data.businessDescription);
      formData.append('categoryId', data.categoryId);
      formData.append('subcategory', data.subcategory);
      formData.append('condition', data.condition || 'new');
      
      // Append location data (simple format)
      formData.append('region', data.region);
      formData.append('town', data.town);
      formData.append('specificAddress', data.specificAddress);
      
      // Append optional discount (only if provided and not empty)
      if (data.discount && data.discount.trim() !== '') {
        formData.append('discount', data.discount);
      }
      
      // Append optional tags (only if provided and not empty)
      if (data.tags && data.tags.trim() !== '') {
        formData.append('tags', data.tags);
      }
      
      // Append images
      productImages.forEach((image, index) => {
        formData.append('images', image);
      });

      if (selectedPromotion === 'free') {
        // For free plans, use the original endpoint
        const response = await axios.post(
          'https://clark-backend.onrender.com/api/v1/products',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            }
          }
        );

        toast.success('Product added successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reset form
        resetForm();

        // Navigate to products page after a short delay
        setTimeout(() => {
          navigate('/vendordashboard/productsmanagement');
        }, 1500);
      } else {
        // For premium plans, use the premium payment endpoint
        const selectedPlan = promotionPlans.find(plan => plan.type === selectedPromotion);
        if (!selectedPlan) {
          throw new Error('Selected promotion plan not found');
        }

        // CRITICAL FIX: Append promotion plan with correct field name (matching Postman example)
        formData.append('promotionPlan[type]', selectedPromotion);

        console.log('Submitting premium product with promotion:', selectedPromotion);
        console.log('FormData contents:');
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await axios.post(
          'https://clark-backend.onrender.com/api/v1/payments/create-premium-payment',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            }
          }
        );

        const responseData = response.data.data;
        setPaymentData(responseData);
        setPaymentReference(responseData.reference);
        setPaymentStep('payment_processing');

        toast.info('Product created! Proceeding to payment...', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Open payment URL in new window/tab
        window.open(responseData.paymentUrl, '_blank');
      }

    } catch (err) {
      console.error('Error submitting product:', err);
      console.error('Response data:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to add product. Please try again.';
      toast.error(errorMessage, {
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
    setProductImages([]);
    setValue('productName', '');
    setValue('price', '');
    setValue('businessDescription', '');
    setValue('categoryId', '');
    setValue('subcategory', '');
    setValue('quantity', '');
    setValue('discount', '');
    setValue('tags', '');
    setValue('region', '');
    setValue('town', '');
    setValue('specificAddress', '');
    setSelectedPromotion('free');
    setPaymentStep('form');
    setPaymentData(null);
    setPaymentReference(null);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total number of images
    if (productImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    // Check each file size
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('Each image should be less than 10MB', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    }
    
    setProductImages([...productImages, ...files]);
    setError('');
  };

  const removeImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
    toast.info('Image removed', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Handle region change and reset town
  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setValue('region', selectedRegion);
    setValue('town', ''); // Reset town when region changes
  };

  // Get subcategories for selected category
  const selectedCategoryId = watch('categoryId');
  const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories || [];

  // Get towns for selected region
  const selectedRegion = watch('region');
  const selectedLocationData = GHANA_LOCATIONS.find(loc => loc.region === selectedRegion);
  const availableTowns = selectedLocationData?.towns || [];

  // Render different steps based on payment flow
  if (paymentStep === 'payment_processing') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Payment Processing</h2>
          <p className="text-gray-600 mb-6">
            Your product has been created and is waiting for payment confirmation.
          </p>
          
          {paymentData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <h3 className="font-semibold mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">${paymentData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-medium text-xs">{paymentData.reference}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            {isCheckingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Checking payment status...</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-600">Waiting for payment confirmation</span>
              </>
            )}
          </div>
          
          {paymentData && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Complete your payment in the new window/tab that opened.
              </p>
              <button
                onClick={() => window.open(paymentData.paymentUrl, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Open Payment Page Again
              </button>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setPaymentStep('form');
                setPaymentReference(null);
                setPaymentData(null);
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back to Form
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (paymentStep === 'payment_success') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your product is now live with premium promotion features.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/vendordashboard/productsmanagement')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              View My Products
            </button>
            <p className="text-sm text-gray-500">Redirecting automatically in a few seconds...</p>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      
      {/* Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Description Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
            <input
              type="text"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.productName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Full Spectrum CBD Tincture - Pet Tincture"
              {...register('productName', { required: 'Product name is required' })}
            />
            {errors.productName && (
              <span className="text-red-500 text-sm">{errors.productName.message}</span>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Description*</label>
            <textarea
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.businessDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="We've partnered with Coastal Green Wellness based out of Myrtle Beach South Carolina"
              {...register('businessDescription', { required: 'Description is required' })}
            ></textarea>
            {errors.businessDescription && (
              <span className="text-red-500 text-sm">{errors.businessDescription.message}</span>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition*</label>
            <select
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.condition ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('condition', { required: 'Condition is required' })}
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
            {errors.condition && (
              <span className="text-red-500 text-sm">{errors.condition.message}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Fast, Turbo Engine, Affordable (comma-separated)"
              {...register('tags')}
            />
            <p className="text-xs text-gray-500 mt-1">Add relevant tags separated by commas to help customers find your product</p>
          </div>
        </section>

        {/* Location Section - Enhanced */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Location*</h2>
          <p className="text-sm text-gray-600 mb-4">Please specify your product location to help customers find items near them.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.region ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('region', { required: 'Region is required' })}
                onChange={handleRegionChange}
              >
                <option value="">Select a region</option>
                {GHANA_LOCATIONS.map(location => (
                  <option key={location.region} value={location.region}>
                    {location.region}
                  </option>
                ))}
              </select>
              {errors.region && (
                <span className="text-red-500 text-sm">{errors.region.message}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Town <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.town ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('town', { required: 'Town is required' })}
                disabled={!selectedRegion}
              >
                <option value="">{selectedRegion ? 'Select a town' : 'Select region first'}</option>
                {availableTowns.map((town, index) => (
                  <option key={index} value={town}>
                    {town}
                  </option>
                ))}
              </select>
              {errors.town && (
                <span className="text-red-500 text-sm">{errors.town.message}</span>
              )}
              {!selectedRegion && (
                <p className="text-xs text-gray-500 mt-1">Please select a region first</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specific Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.specificAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123 Independence Avenue, Osu"
              {...register('specificAddress', { required: 'Specific address is required' })}
            />
            {errors.specificAddress && (
              <span className="text-red-500 text-sm">{errors.specificAddress.message}</span>
            )}
            <p className="text-xs text-gray-500 mt-1">Enter your detailed address (street, building, landmark, etc.)</p>
          </div>
        </section>

        {/* Category Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Category*</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
              <select
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('categoryId', { required: 'Category is required' })}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="text-red-500 text-sm">{errors.categoryId.message}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.subcategory ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('subcategory', { required: 'Subcategory is required' })}
                disabled={!selectedCategoryId}
              >
                <option value="">Select a subcategory</option>
                {subcategories.map((subcategory, index) => (
                  <option key={index} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
              {errors.subcategory && (
                <span className="text-red-500 text-sm">{errors.subcategory.message}</span>
              )}
            </div>
          </div>
        </section>

        {/* Product Images Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Product Images* (Max 5, 10MB each)</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-indigo-400 transition-colors">
            <div className="flex flex-col items-center justify-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Drag and drop images here or click to browse</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Upload Images
              </label>
            </div>
            
            {productImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {productImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pricing*</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="180.00"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
              />
              {errors.price && (
                <span className="text-red-500 text-sm">{errors.price.message}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%) - Optional</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.discount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="30"
                {...register('discount', {
                  min: { value: 0, message: 'Discount cannot be negative' },
                  max: { value: 100, message: 'Discount cannot exceed 100%' }
                })}
              />
              {errors.discount && (
                <span className="text-red-500 text-sm">{errors.discount.message}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">Leave empty for no discount</p>
            </div>
          </div>
        </section>

        {/* Promotion Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Promotion Plan</h2>
          
          <div className="space-y-3">
            <label key="free-plan" className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                className="text-indigo-600 focus:ring-indigo-500"
                checked={selectedPromotion === 'free'}
                onChange={() => setSelectedPromotion('free')}
              />
              <span className="flex-1">
                <span className="block font-medium">Free Plan</span>
                <span className="block text-sm text-gray-500">Standard visibility for your product</span>
              </span>
            </label>
            
            {promotionPlans.map(plan => (
              <label key={plan._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  className="text-indigo-600 focus:ring-indigo-500"
                  checked={selectedPromotion === plan.type}
                  onChange={() => setSelectedPromotion(plan.type)}
                />
                <span className="flex-1">
                  <span className="block font-medium">{plan.name} (GH₵{plan.price})</span>
                  <span className="block text-sm text-gray-500">{plan.description}</span>
                  {selectedPromotion === plan.type && (
                    <span className="block text-xs text-blue-600 mt-1">
                      Product will be created first, then payment will activate promotion
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/vendordashboard/productsmanagement')}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : selectedPromotion === 'free' ? (
              'Add Product'
            ) : (
              <span className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Create Product & Pay
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

export default AddProducts;