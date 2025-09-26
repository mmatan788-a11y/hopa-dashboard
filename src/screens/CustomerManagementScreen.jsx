import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Download, Search, Filter, ChevronLeft, ChevronRight, Users, Shield, Store, CheckCircle } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CustomerManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sellerFilter, setSellerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [error, setError] = useState('');

  // Use AuthContext
  const { 
    token, 
    isAuthenticated, 
    logout,
    refreshToken 
  } = useAuth();

  // Fetch users from API
// Updated fetchUsers function for CustomerManagementScreen
const fetchUsers = async () => {
  try {
    setUserLoading(true);
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

    const response = await fetch("https://clark-backend.onrender.com/api/v1/users", requestOptions);
    
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
          
          const retryResponse = await fetch("https://clark-backend.onrender.com/api/v1/users", retryOptions);
          
          if (retryResponse.status === 401) {
            throw new Error('Token refresh failed - authentication required');
          }
          
          const retryResult = await retryResponse.json();
          
          if (retryResponse.ok && retryResult.status === 'success' && retryResult.data && retryResult.data.users) {
            setUsers(retryResult.data.users);
            return;
          } else {
            throw new Error(retryResult.message || 'Failed to fetch users after token refresh');
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
      throw new Error(result.message || `HTTP ${response.status}: Failed to fetch users`);
    }

    if (result.status === 'success' && result.data && result.data.users) {
      setUsers(result.data.users);
    } else {
      console.error('Invalid response format:', result);
      setError('Invalid response format from server');
    }
  } catch (error) {
    setError(error.message || 'Failed to fetch users');
    console.error("Fetch users error:", error);
  } finally {
    setUserLoading(false);
  }
};

  useEffect(() => {
    // Only fetch users if authenticated
    if (isAuthenticated && token) {
      fetchUsers();
    } else {
      setError('You need to be logged in to view this page.');
      setUserLoading(false);
    }
  }, [isAuthenticated, token]); // Re-fetch when authentication state changes

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSeller = sellerFilter === 'all' || 
                         (sellerFilter === 'seller' && user.isSeller) ||
                         (sellerFilter === 'non-seller' && !user.isSeller);
    return matchesSearch && matchesRole && matchesSeller;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // User stats
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalSellers = users.filter(u => u.isSeller).length;
  const totalVerified = users.filter(u => u.isVerified).length;

  // Chart data
  const roleData = {
    labels: ['Admins', 'Users'],
    datasets: [{
      data: [totalAdmins, totalUsers - totalAdmins],
      backgroundColor: ['#8B5CF6', '#06B6D4'],
      borderWidth: 0
    }]
  };

  const sellerData = {
    labels: ['Sellers', 'Regular Users'],
    datasets: [{
      data: [totalSellers, totalUsers - totalSellers],
      backgroundColor: ['#10B981', '#F59E0B'],
      borderWidth: 0
    }]
  };

  // Generate PDF report
  const generatePDFReport = () => {
    const reportData = {
      title: 'Customer Management Report',
      generatedAt: new Date().toLocaleString(),
      stats: {
        totalUsers,
        totalAdmins,
        totalSellers,
        totalVerified
      },
      users: filteredUsers.map(user => ({
        username: user.username || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        role: user.role || 'user',
        isSeller: user.isSeller || false,
        isVerified: user.isVerified || false,
        joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
      }))
    };

    // Create downloadable content
    const content = `
CUSTOMER MANAGEMENT REPORT
Generated: ${reportData.generatedAt}

SUMMARY STATISTICS:
- Total Users: ${totalUsers}
- Admins: ${totalAdmins}
- Sellers: ${totalSellers}
- Verified Users: ${totalVerified}

DETAILED USER LIST:
${reportData.users.map((user, index) => 
  `${index + 1}. ${user.username}
     Email: ${user.email}
     Phone: ${user.phone}
     Role: ${user.role}
     Seller: ${user.isSeller ? 'Yes' : 'No'}
     Verified: ${user.isVerified ? 'Yes' : 'No'}
     Joined: ${user.joinedDate}
`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customer-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Show authentication error screen if not authenticated
  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white border border-gray-300 shadow-lg p-8 rounded-xl text-center">
          <div className="text-red-500 mb-4">
            <Shield size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Authentication Required</h2>
            <p className="text-gray-600">You need to be logged in to access this page.</p>
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

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="text-lg">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
          <button
            onClick={generatePDFReport}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-300"
          >
            <Download size={20} />
            <span>Export Report</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
            <button 
              onClick={fetchUsers}
              className="ml-4 text-red-500 hover:text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={totalUsers} icon={Users} color="blue" />
          <StatCard title="Admins" value={totalAdmins} icon={Shield} color="purple" />
          <StatCard title="Sellers" value={totalSellers} icon={Store} color="green" />
          <StatCard title="Verified" value={totalVerified} icon={CheckCircle} color="yellow" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 shadow-lg p-6 rounded-xl">
            <h3 className="text-gray-800 font-semibold mb-4">User Roles Distribution</h3>
            <div className="h-64">
              <Pie data={roleData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white border border-gray-200 shadow-lg p-6 rounded-xl">
            <h3 className="text-gray-800 font-semibold mb-4">Seller vs Regular Users</h3>
            <div className="h-64">
              <Pie data={sellerData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 shadow-lg p-6 rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <select 
              className="p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>

            <select 
              className="p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              value={sellerFilter}
              onChange={(e) => {
                setSellerFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Users</option>
              <option value="seller">Sellers Only</option>
              <option value="non-seller">Non-Sellers Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Store</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentUsers.map(user => (
                  <UserTableRow key={user._id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-gray-500 text-sm">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition duration-300"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-2 rounded-lg transition duration-300 ${
                      currentPage === index + 1
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition duration-300"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500'
  };

  return (
    <div className="bg-white border border-gray-200 shadow-lg p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
};

const UserTableRow = ({ user }) => (
  <tr className="hover:bg-gray-50 transition duration-300">
    <td className="px-6 py-4">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          {user.profilePicture ? (
            <img className="h-10 w-10 rounded-full object-cover" src={user.profilePicture} alt="" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-800">{user.username || 'Unknown User'}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="text-sm text-gray-600">{user.email || 'N/A'}</div>
      <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
        user.role === 'admin' 
          ? 'bg-purple-100 text-purple-700 border border-purple-200' 
          : 'bg-blue-100 text-blue-700 border border-blue-200'
      }`}>
        {user.role || 'user'}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-col space-y-1">
        {user.isSeller && (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">
            Seller
          </span>
        )}
        {user.isVerified && (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
            Verified
          </span>
        )}
        {!user.isSeller && !user.isVerified && (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            Regular
          </span>
        )}
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-gray-600">
      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
    </td>
    <td className="px-6 py-4">
      {user.storeTitle ? (
        <div className="text-sm">
          <div className="text-gray-800 font-medium">{user.storeTitle}</div>
          <div className="text-gray-500 text-xs">{user.location || 'No location'}</div>
        </div>
      ) : (
        <span className="text-gray-500 text-sm">No store</span>
      )}
    </td>
  </tr>
);

export default CustomerManagementScreen;