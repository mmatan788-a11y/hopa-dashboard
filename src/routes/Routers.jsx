import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import CustomerManagementScreen from "../screens/CustomerManagementScreen";
import OrdersScreen from "../screens/OrdersScreen";
import FinancialScreen from "../screens/FinancialScreen";
import OverviewScreen from "../screens/OverviewScreen";
import ProductScreen from "../screens/ProductScreen";
import Layout from "../Layout/Layout";
import CategoriesScreen from "../screens/CategoriesScreen";
import PromoScreen from "../screens/PromoScreen";
import Login from "../screens/Login";
import AddProduct from "../screens/AddProduct";
import AddCategory from "../screens/AddCategory";
import AddPromo from "../screens/AddPromo";
import Approvals from "../screens/Approvals";


// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const Routers = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const checkAuthStatus = () => {
      const sessionToken = sessionStorage.getItem('authToken');
      const localToken = localStorage.getItem('accessToken');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      if (sessionToken || (localToken && isLoggedIn)) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuthStatus();

    // Listen for storage changes (useful for login from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'accessToken' || e.key === 'isLoggedIn') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Store authentication state
    sessionStorage.setItem('authToken', 'authenticated');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Clear all authentication data
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout onLogout={handleLogout} />}>
        {/* Public routes - Login page */}
        <Route 
          index 
          element={
            isAuthenticated ? 
            <Navigate to="/overview" replace /> : 










            <Login onLogin={handleLogin} />
          } 
        />

        {/* Protected routes - require authentication */}
        <Route 
          path="/overview" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OverviewScreen />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/approvals" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Approvals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customermanagement" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CustomerManagementScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/financialreport" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <FinancialScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OrdersScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AnalyticsScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProductScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CategoriesScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/promo" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PromoScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-product" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AddProduct />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-category" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AddCategory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-promo" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AddPromo />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
};


export default Routers;