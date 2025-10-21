import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, CreditCard, CheckCircle, AlertCircle, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

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
  const { user } = useAuth();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const [productImages, setProductImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotionPlans, setPromotionPlans] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState('free');
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment states
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'awaiting_payment', 'payment_success'
  const [paymentReference, setPaymentReference] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  // Fetch categories & plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const [catRes, promoRes] = await Promise.all([
          axios.get('https://hope-server-rho1.onrender.com/api/v1/categories', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://hope-server-rho1.onrender.com/api/v1/payments/promotion-plans', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setCategories(catRes.data.data.categories);
        setPromotionPlans(promoRes.data.data.promotionPlans);
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, []);

  // Poll payment status when in 'awaiting_payment' - FIXED VERSION
  useEffect(() => {
    let intervalId;
    
    const verifyPayment = async () => {
      if (paymentStep !== 'awaiting_payment' || !paymentReference) return;
      
      try {
        setIsVerifying(true);
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(
          `https://hope-server-rho1.onrender.com/api/v1/payments/check-status/${paymentReference}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Payment status response:', res.data);
        
        const status = res.data.status;
        if (status === 'success' || status === 'completed') {
          // Clear interval immediately when success is detected
          clearInterval(intervalId);
          setPaymentStep('payment_success');
          toast.success('✅ Payment confirmed! Your product is now live.');
          setTimeout(() => navigate('/vendordashboard/productsmanagement'), 3000);
        }
      } catch (err) {
        console.error('Verification error:', err);
        // Don't stop polling on errors, just log them
      } finally {
        setIsVerifying(false);
      }
    };

    if (paymentStep === 'awaiting_payment' && paymentReference) {
      // Verify immediately and then set up interval
      verifyPayment();
      intervalId = setInterval(verifyPayment, 4000); // check every 4s
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentStep, paymentReference, navigate]);

  const onSubmit = async (data) => {
    // Validation
    if (productImages.length === 0) {
      toast.error('Upload at least one image');
      return;
    }
    if (productImages.length > 5) {
      toast.error('Max 5 images');
      return;
    }
    for (const img of productImages) {
      if (img.size > 10 * 1024 * 1024) {
        toast.error('Image too large (>10MB)');
        return;
      }
    }
    if (!data.region || !data.town || !data.specificAddress) {
      toast.error('Complete all location fields');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('name', data.productName);
      formData.append('price', data.price);
      formData.append('description', data.businessDescription);
      formData.append('categoryId', data.categoryId);
      formData.append('subcategory', data.subcategory);
      formData.append('condition', data.condition || 'new');
      formData.append('region', data.region);
      formData.append('town', data.town);
      formData.append('specificAddress', data.specificAddress);
      if (data.discount?.trim()) formData.append('discount', data.discount);
      if (data.tags?.trim()) formData.append('tags', data.tags);
      productImages.forEach(img => formData.append('images', img));

      if (selectedPromotion === 'free') {
        await axios.post('https://hope-server-rho1.onrender.com/api/v1/products', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product added!');
        setTimeout(() => navigate('/vendordashboard/productsmanagement'), 1500);
      } else {
        formData.append('promotionPlan[type]', selectedPromotion);
        formData.append('promotionPlan[duration]', selectedDuration.toString());

        const res = await axios.post(
          'https://hope-server-rho1.onrender.com/api/v1/payments/create-premium-payment',
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`, 
              'Content-Type': 'multipart/form-data' 
            },
            timeout: 30000 // 30 second timeout
          }
        );

        const { paymentUrl, reference, externalRef } = res.data.data;
        setPaymentUrl(paymentUrl);
        setPaymentReference(reference);
        setPaymentStep('awaiting_payment');
        
        // Store externalRef in localStorage for recovery
        localStorage.setItem('lastPaymentRef', externalRef);
        
        toast.info('✅ Payment link generated. Please complete payment in the new tab.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || 'Failed to submit product';
      setError(msg);
      toast.error(msg);
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
    setValue('condition', '');
    setValue('region', '');
    setValue('town', '');
    setValue('specificAddress', '');
    setValue('discount', '');
    setValue('tags', '');
    setSelectedPromotion('free');
    setSelectedDuration(7);
    setPaymentStep('form');
    setPaymentReference(null);
    setPaymentUrl(null);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (productImages.length + files.length > 5) {
      toast.error('Max 5 images');
      return;
    }
    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) {
        toast.error('Each image < 10MB');
        return;
      }
    }
    setProductImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRegionChange = (e) => {
    const region = e.target.value;
    setValue('region', region);
    setValue('town', '');
  };

  const selectedCategoryId = watch('categoryId');
  const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories || [];
  const selectedRegion = watch('region');
  const locationData = GHANA_LOCATIONS.find(loc => loc.region === selectedRegion);
  const availableTowns = locationData?.towns || [];

  const getPlanPrice = (type, duration) => {
    const map = {
      basic: { 7: 25, 14: 40, 30: 60 },
      premium: { 7: 40, 14: 50, 30: 80 },
      ultra: { 7: 50, 14: 70, 30: 120 }
    };
    return map[type]?.[duration] || 0;
  };

  // === AWAITING PAYMENT SCREEN ===
  if (paymentStep === 'awaiting_payment') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <CreditCard className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
          <p className="text-gray-600 mb-6">
            Please click on the button to complete payment
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
              Once confirmed, your product will be listed immediately.
            </p>
          </div>

          <button
            onClick={async () => {
              setIsVerifying(true);
              try {
                const token = localStorage.getItem('accessToken');
                const res = await axios.get(
                  `https://hope-server-rho1.onrender.com/api/v1/payments/check-status/${paymentReference}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.status === 'success' || res.data.status === 'completed') {
                  setPaymentStep('payment_success');
                  toast.success('Payment confirmed! Redirecting...');
                  setTimeout(() => navigate('/vendordashboard/productsmanagement'), 1500);
                } else {
                  toast.info('Payment not yet completed. Please finish in the other tab.');
                }
              } catch (err) {
                toast.error('Failed to verify payment. Please try again.');
              } finally {
                setIsVerifying(false);
              }
            }}
            disabled={isVerifying}
            className={`px-5 py-2.5 rounded-md ${
              isVerifying
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isVerifying ? 'Verifying...' : '✅ I Completed Payment – Verify Now'}
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
        <ToastContainer />
      </div>
    );
  }

  if (paymentStep === 'payment_success') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your product is now live with premium promotion.
          </p>
          <button
            onClick={() => navigate('/vendordashboard/productsmanagement')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md"
          >
            View My Products
          </button>
          <p className="text-sm text-gray-500 mt-4">Redirecting automatically...</p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // === MAIN FORM ===
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Description*</label>
            <textarea
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.businessDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="This is a reliable product for all users"
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

        {/* Location Section */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (GH₵)</label>
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
            <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                className="text-indigo-600 focus:ring-indigo-500"
                checked={selectedPromotion === 'free'}
                onChange={() => setSelectedPromotion('free')}
              />
              <span className="flex-1">
                <span className="block font-medium">Free Plan</span>
                <span className="block text-sm text-gray-500">Standard visibility</span>
              </span>
            </label>
            {promotionPlans.map(plan => (
              <div key={plan.type} className="border rounded-lg p-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    className="text-indigo-600 focus:ring-indigo-500"
                    checked={selectedPromotion === plan.type}
                    onChange={() => {
                      setSelectedPromotion(plan.type);
                      setSelectedDuration(7);
                    }}
                  />
                  <span className="flex-1">
                    <span className="block font-medium">{plan.name}</span>
                    <span className="block text-sm text-gray-500">{plan.description}</span>
                  </span>
                </label>
                {selectedPromotion === plan.type && (
                  <div className="mt-3 ml-8 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Select Duration:</p>
                    <div className="flex flex-wrap gap-2">
                      {[7, 14, 30].map(duration => {
                        const price = getPlanPrice(plan.type, duration);
                        const label = duration === 7 ? '1 week' : duration === 14 ? '2 weeks' : '1 month';
                        return (
                          <button
                            key={duration}
                            type="button"
                            className={`px-3 py-1 text-sm rounded-md border ${
                              selectedDuration === duration
                                ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedDuration(duration)}
                          >
                            {label} (GH₵{price})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => navigate('/vendordashboard/productsmanagement')}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
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
                Create & Pay (GH₵{getPlanPrice(selectedPromotion, selectedDuration)})
              </span>
            )}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddProducts;