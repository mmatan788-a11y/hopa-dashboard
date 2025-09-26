import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  FileText, 
  Image,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

const Approvals = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    // For demo purposes, using mock data from localStorage
    const token = localStorage.getItem('accessToken') || 'demo-token';
    const refreshToken = localStorage.getItem('refreshToken') || 'demo-refresh-token';
    
    if (!token) {
      setError('You must be logged in to view applications.');
      toast.error('You must be logged in to view applications.');
      setLoading(false);
      return;
    }

    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Cookie", `refreshToken=${refreshToken}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const response = await fetch("https://clark-backend.onrender.com/api/v1/users/seller-applications", requestOptions);
      
      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        toast.error('Session expired. Please log in again.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const result = await response.json();
      console.log('API Response:', result); // Debug log
      
      // Fixed: Access the correct nested structure
      const applicationsData = result.data?.applications || [];
      
      // Transform the API data to match your component's expected structure
      const transformedApplications = applicationsData.map(app => ({
        _id: app._id,
        businessName: app.sellerApplication?.storeTitle || 'Unknown Business',
        applicantName: app.username,
        email: app.email,
        phoneNumber: app.phone,
        businessAddress: app.businessAddress || 'Not provided',
        businessType: app.businessType || 'Not specified',
        yearsInBusiness: app.yearsInBusiness || 'Not specified',
        businessDescription: app.sellerApplication?.storeBio || 'No description provided',
        status: app.sellerApplication?.status || 'none',
        createdAt: app.sellerApplication?.appliedAt || app.createdAt,
        businessRegistration: app.sellerApplication?.businessLicense,
        taxCertificate: app.sellerApplication?.taxCertificate,
        idDocument: app.sellerApplication?.idVerification,
        adminNotes: app.sellerApplication?.adminNotes,
        reviewedAt: app.sellerApplication?.reviewedAt,
        reviewedBy: app.sellerApplication?.reviewedBy
      })).filter(app => app.status !== 'none'); // Filter out applications with 'none' status
      
      setApplications(transformedApplications);
      
      // Show success toast only when manually refreshing
      if (applications.length > 0) {
        toast.success('Applications refreshed successfully!');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications. Please try again.');
      toast.error('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (applicationId, action, adminNotes = '') => {
    const token = localStorage.getItem('accessToken') || 'demo-token';
    const refreshToken = localStorage.getItem('refreshToken') || 'demo-refresh-token';
    
    if (!token) {
      setError('You must be logged in to review applications.');
      toast.error('You must be logged in to review applications.');
      return;
    }

    setActionLoading(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Cookie", `refreshToken=${refreshToken}`);

      const raw = JSON.stringify({
        action: action,
        adminNotes: adminNotes
      });

      const requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      const response = await fetch(`https://clark-backend.onrender.com/api/v1/users/seller-applications/${applicationId}/review`, requestOptions);
      
      if (!response.ok) {
        throw new Error('Failed to review application');
      }

      // Show success toast based on action
      if (action === 'approve') {
        toast.success(`Application approved successfully! 🎉`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (action === 'reject') {
        toast.success(`Application rejected successfully.`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      // Refresh applications list
      await fetchApplications();
      
      // Close modal
      setShowModal(false);
      setSelectedApplication(null);
      
    } catch (error) {
      console.error('Error reviewing application:', error);
      setError('Failed to review application. Please try again.');
      toast.error('Failed to review application. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredApplications = Array.isArray(applications) ? applications.filter(app => {
    const matchesSearch = app.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status?.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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
        toastStyle={{
          fontFamily: 'inherit'
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Seller <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Applications</span>
              </h1>
              <p className="text-lg text-gray-600">
                Review and manage seller applications
              </p>
            </div>
            <button
              onClick={() => {
                fetchApplications();
                toast.info('Refreshing applications...');
              }}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by business name, applicant name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'No applications match your current filters.' 
                : 'There are no seller applications to review at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <div key={application._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {application.businessName || 'Unknown Business'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {application.applicantName || 'Unknown Applicant'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      {application.status || 'Pending'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{application.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{application.phoneNumber || 'No phone provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{application.businessAddress || 'No address provided'}</span>
                    </div>
                    {application.createdAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openModal(application)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Application Details</h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Basic Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Business Name</label>
                          <p className="text-gray-800">{selectedApplication.businessName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Applicant Name</label>
                          <p className="text-gray-800">{selectedApplication.applicantName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="text-gray-800">{selectedApplication.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Phone Number</label>
                          <p className="text-gray-800">{selectedApplication.phoneNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Business Address</label>
                          <p className="text-gray-800">{selectedApplication.businessAddress || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Business Type</label>
                          <p className="text-gray-800">{selectedApplication.businessType || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Years in Business</label>
                          <p className="text-gray-800">{selectedApplication.yearsInBusiness || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Business Description
                      </h3>
                      <p className="text-gray-800">
                        {selectedApplication.businessDescription || 'No description provided'}
                      </p>
                    </div>

                    {selectedApplication.adminNotes && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h3 className="font-semibold text-blue-800 mb-3">Admin Notes</h3>
                        <p className="text-blue-700">{selectedApplication.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Documents/Images */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Image className="w-5 h-5" />
                        Documents & Images
                      </h3>
                      
                      {/* Business Registration Document */}
                      {selectedApplication.businessRegistration && (
                        <div className="mb-4">
                          <label className="text-sm font-medium text-gray-600 mb-2 block">Business License</label>
                          <img
                            src={selectedApplication.businessRegistration}
                            alt="Business License"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-48 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center">
                            <div className="text-center">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Document unavailable</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tax Certificate */}
                      {selectedApplication.taxCertificate && (
                        <div className="mb-4">
                          <label className="text-sm font-medium text-gray-600 mb-2 block">Tax Certificate</label>
                          <img
                            src={selectedApplication.taxCertificate}
                            alt="Tax Certificate"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-48 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center">
                            <div className="text-center">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Document unavailable</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ID Document */}
                      {selectedApplication.idDocument && (
                        <div className="mb-4">
                          <label className="text-sm font-medium text-gray-600 mb-2 block">ID Verification</label>
                          <img
                            src={selectedApplication.idDocument}
                            alt="ID Verification"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-48 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center">
                            <div className="text-center">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Document unavailable</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {!selectedApplication.businessRegistration && !selectedApplication.taxCertificate && !selectedApplication.idDocument && (
                        <div className="text-center py-8">
                          <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No documents uploaded</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Status Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Current Status:</span>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(selectedApplication.status)}`}>
                            {getStatusIcon(selectedApplication.status)}
                            {selectedApplication.status || 'Pending'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Applied:</span>
                          <span className="text-sm text-gray-800">
                            {selectedApplication.createdAt ? new Date(selectedApplication.createdAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        {selectedApplication.reviewedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Reviewed:</span>
                            <span className="text-sm text-gray-800">
                              {new Date(selectedApplication.reviewedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedApplication.status?.toLowerCase() === 'pending' && (
                  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleReviewApplication(
                        selectedApplication._id, 
                        'approve', 
                        'Application approved after review'
                      )}
                      disabled={actionLoading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Approve Application
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReviewApplication(
                        selectedApplication._id, 
                        'reject', 
                        'Application rejected after review'
                      )}
                      disabled={actionLoading}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;