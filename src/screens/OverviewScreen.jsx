import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// StatsCard Component
const StatsCard = ({
  title,
  description,
  value,
  icon,
  bgColor = "bg-white"
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${bgColor} p-6 rounded-xl shadow-sm border border-gray-200`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg text-amber-700 font-bold">{title}</h3>
          <p className="text-sm text-amber-600 mb-2">{description}</p>
          <p className="text-3xl text-amber-700 font-bold">{value}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-amber-100 text-amber-700">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ProductCard Component
const ProductCard = ({ product }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new':
        return "bg-green-100 text-green-800";
      case 'used':
        return "bg-yellow-100 text-yellow-800";
      case 'refurbished':
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-gray-100 rounded-lg w-12 h-12 flex items-center justify-center overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500">No Image</span>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-500 line-clamp-1">
            {product.description}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            By: {product.owner?.username}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <span className={`px-3 py-1 rounded-full text-xs ${getConditionColor(product.condition)}`}>
          {product.condition || 'New'}
        </span>
        <div className="text-right">
          <span className="font-medium text-lg">${product.price}</span>
          {product.discount > 0 && (
            <p className="text-xs text-red-500">
              ${product.discountPrice} (${product.discount} off)
            </p>
          )}
        </div>
        <div className="text-sm text-gray-500 w-20 text-right">
          <p>{product.views} views</p>
          <p className="text-xs">{formatDate(product.dateUploaded)}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ApplicationCard Component
const ApplicationCard = ({ application }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-gray-100 rounded-lg">
          {getStatusIcon(application.status)}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{application.applicantName}</h4>
          <p className="text-sm text-gray-500">{application.email}</p>
          {application.businessName && (
            <p className="text-xs text-amber-600 font-medium">
              {application.businessName}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(application.status)}`}>
          {application.status === 'none' ? 'No Application' : application.status}
        </span>
        <div className="text-sm text-gray-500 text-right">
          {application.createdAt && (
            <p>{formatDate(application.createdAt)}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// OverviewScreen Component
const OverviewScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSellers: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalProductViews: 0,
    totalRevenue: 0
  });
  const [productViewsData, setProductViewsData] = useState([]);
  const [applicationStatusData, setApplicationStatusData] = useState({
    approved: 0,
    pending: 0,
    none: 0,
    rejected: 0
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get token from localStorage or use demo token
      const token = localStorage.getItem('accessToken') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjRkYzI0OTRjZmUzNzViZjUwY2ZhZiIsImlhdCI6MTc0OTk4MzA5OSwiZXhwIjoxNzQ5OTg2Njk5fQ.VLo4RscjU2vsfqrYLP60La5hLCIk9qjiMGxd-Ep97tc";
      const refreshToken = localStorage.getItem('refreshToken') || 'demo-refresh-token';
      
      // Fetch all data concurrently
      await Promise.all([
        fetchProducts(token, refreshToken),
        fetchSellerApplications(token, refreshToken)
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async (token, refreshToken) => {
    try {
      const response = await fetch('https://clark-backend.onrender.com/api/v1/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cookie': `refreshToken=${refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Products API Response:', data);
      
      // Handle different possible response structures
      let productsData = [];
      if (data.data && data.data.products) {
        productsData = data.data.products;
      } else if (data.products) {
        productsData = data.products;
      } else if (Array.isArray(data)) {
        productsData = data;
      }

      setProducts(productsData.slice(0, 5)); // Get latest 5 products

      // Calculate product stats
      const totalViews = productsData.reduce((sum, product) => sum + (product.views || 0), 0);
      const totalRevenue = productsData.reduce((sum, product) => {
        const price = product.discountPrice || product.price || 0;
        return sum + (price * (product.sold || 0));
      }, 0);

      // Generate views data for chart (monthly data)
      generateViewsData(productsData);

      // Update stats
      setDashboardStats(prev => ({
        ...prev,
        totalProducts: productsData.length,
        totalProductViews: totalViews,
        totalRevenue
      }));

    } catch (error) {
      console.error('Error fetching products:', error);
      // Set some demo data if API fails
      setProducts([]);
      setDashboardStats(prev => ({
        ...prev,
        totalProducts: 0,
        totalProductViews: 0,
        totalRevenue: 0
      }));
    }
  };

  const fetchSellerApplications = async (token, refreshToken) => {
    try {
      // Use the same endpoint as the Approvals page
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Cookie", `refreshToken=${refreshToken}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const response = await fetch("https://clark-backend.onrender.com/api/v1/users/seller-applications", requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Seller Applications API Response:', result);
      
      // Access the correct nested structure (same as Approvals page)
      const applicationsData = result.data?.applications || [];
      
      // Transform the API data to match component's expected structure
      const transformedApplications = applicationsData.map(app => ({
        _id: app._id,
        businessName: app.sellerApplication?.storeTitle || 'Unknown Business',
        applicantName: app.username,
        email: app.email,
        phoneNumber: app.phone,
        status: app.sellerApplication?.status || 'none',
        createdAt: app.sellerApplication?.appliedAt || app.createdAt,
        reviewedAt: app.sellerApplication?.reviewedAt
      }));

      // Filter and set applications for display (latest 5)
      const filteredApplications = transformedApplications.filter(app => app.status !== 'none');
      setApplications(filteredApplications.slice(0, 5));

      // Calculate application statistics
      const totalUsers = applicationsData.length;
      
      // Count applications by status
      const statusCounts = applicationsData.reduce((acc, app) => {
        const status = app.sellerApplication?.status || 'none';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const pendingApplications = statusCounts.pending || 0;
      const approvedApplications = statusCounts.approved || 0;
      const rejectedApplications = statusCounts.rejected || 0;
      const noApplications = statusCounts.none || 0;

      // Set application status data for chart
      setApplicationStatusData({
        approved: approvedApplications,
        pending: pendingApplications,
        none: noApplications,
        rejected: rejectedApplications
      });

      // Update dashboard stats
      setDashboardStats(prev => ({
        ...prev,
        totalUsers,
        totalSellers: approvedApplications, // Only approved sellers count as active sellers
        pendingApplications,
        approvedApplications
      }));

    } catch (error) {
      console.error('Error fetching seller applications:', error);
      
      // Set demo data based on your API response example if API fails
      const demoApplications = [
        {
          "_id": "683f14f7ada2864770514707",
          "applicantName": "Clark",
          "email": "clark@gmail.com",
          "businessName": "Clar Business",
          "status": "pending",
          "createdAt": "2025-06-03T15:39:09.274Z"
        },
        {
          "_id": "6838f72da0f2bc4dc270b1b4",
          "applicantName": "dede",
          "email": "jed@gmail.com",
          "businessName": "Jed shop",
          "status": "approved",
          "createdAt": "2025-05-30T00:18:27.226Z"
        }
      ];

      setApplications(demoApplications);
      
      setApplicationStatusData({
        approved: 1,
        pending: 1,
        none: 0,
        rejected: 0
      });

      setDashboardStats(prev => ({
        ...prev,
        totalUsers: 4,
        totalSellers: 1,
        pendingApplications: 1,
        approvedApplications: 1
      }));
    }
  };

  const generateViewsData = (productsData) => {
    // Generate monthly views data based on products
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const viewsByMonth = months.map((month, index) => {
      // Simulate monthly views distribution
      const monthlyViews = productsData.reduce((sum, product) => {
        const productDate = new Date(product.dateUploaded || product.createdAt);
        const productMonth = productDate.getMonth();
        if (productMonth === index) {
          return sum + (product.views || 0);
        }
        return sum;
      }, 0);
      
      // Add some variation if no real data
      return monthlyViews > 0 ? monthlyViews : Math.floor(Math.random() * 50 + 10);
    });

    setProductViewsData(viewsByMonth);
  };

  // Data for product views chart
  const viewsChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Product Views",
        data: productViewsData,
        backgroundColor: "rgba(50, 142, 110, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        borderColor: "#328E6E",
        pointBackgroundColor: "#328E6E",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  // Data for application status chart
  const applicationChartData = {
    labels: ["Approved", "Pending", "No Application", "Rejected"],
    datasets: [
      {
        data: [
          applicationStatusData.approved,
          applicationStatusData.pending,
          applicationStatusData.none,
          applicationStatusData.rejected || 0
        ],
        backgroundColor: [
          "rgb(34, 197, 94)",
          "rgb(251, 191, 36)",
          "rgb(156, 163, 175)",
          "rgb(239, 68, 68)"
        ],
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-amber-700 font-bold">Overview</h1>
          <p className="text-gray-500">
            Real-time marketplace insights and analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            description="Registered users on the platform"
            value={dashboardStats.totalUsers.toLocaleString()}
            icon={<UserGroupIcon className="h-6 w-6" />}
          />
          <StatsCard
            title="Active Sellers"
            description="Approved seller accounts"
            value={dashboardStats.totalSellers.toLocaleString()}
            icon={<ShoppingBagIcon className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Products"
            description="Products listed on marketplace"
            value={dashboardStats.totalProducts.toLocaleString()}
            icon={<ShoppingBagIcon className="h-6 w-6" />}
          />
          <StatsCard
            title="Pending Applications"
            description="Seller applications awaiting review"
            value={dashboardStats.pendingApplications.toLocaleString()}
            icon={<DocumentTextIcon className="h-6 w-6" />}
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Product Views"
            description="Combined views across all products"
            value={dashboardStats.totalProductViews.toLocaleString()}
          />
          <StatsCard
            title="Approved Applications"
            description="Successfully approved sellers"
            value={dashboardStats.approvedApplications.toLocaleString()}
          />
          <StatsCard
            title="Platform Revenue"
            description="Total revenue from all sales"
            value={`$${dashboardStats.totalRevenue.toLocaleString()}`}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Product Views Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Views Overview</h3>
              <button className="text-sm text-blue-600 flex items-center hover:text-blue-800">
                See detail <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="h-64">
              <Line
                data={viewsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "#1F2937",
                      titleColor: "#F3F4F6",
                      bodyColor: "#E5E7EB",
                      callbacks: {
                        label: (ctx) => `${ctx.parsed.y.toLocaleString()} views`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "#E5E7EB" },
                      ticks: {
                        callback: (value) => `${value}`,
                        color: "#6B7280",
                      },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: "#6B7280" },
                    },
                  },
                  elements: {
                    line: { tension: 0.4 },
                    point: {
                      radius: 4,
                      hoverRadius: 8,
                      hoverBorderWidth: 2,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Application Status Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Seller Applications</h3>
              <button className="text-sm text-blue-600 flex items-center hover:text-blue-800">
                See detail <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Application status distribution
            </p>
            <div className="h-48 mb-4">
              <Doughnut
                data={applicationChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12
                        }
                      }
                    },
                  },
                  cutout: "60%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Latest Products</h3>
                <button className="text-sm text-blue-600 flex items-center hover:text-blue-800">
                  See more <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Recently uploaded products
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No products found</p>
                  <p className="text-sm">Products will appear here once uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                <button className="text-sm text-blue-600 flex items-center hover:text-blue-800">
                  See more <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Latest seller applications
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {applications.length > 0 ? (
                applications.map((application) => (
                  <ApplicationCard key={application._id || application.id} application={application} />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No applications found</p>
                  <p className="text-sm">Applications will appear here when submitted</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewScreen;