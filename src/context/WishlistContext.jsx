import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Import your updated AuthContext

// Create the context
export const WishlistContext = createContext();

// Custom hook for using the wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

// Provider Component
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get auth context
  const { isAuthenticated, token, user } = useAuth();

  // Fetch wishlist when authentication state changes or when user changes
  useEffect(() => {
    if (isAuthenticated && token && user) {
      fetchWishlist();
    } else {
      // Clear wishlist when user is not authenticated
      setWishlist([]);
    }
  }, [isAuthenticated, token, user?._id]);

  // Fetch wishlist from API
  const fetchWishlist = async () => {
    if (!isAuthenticated || !token) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };
      
      const response = await fetch("https://hope-server-rho1.onrender.com/api/v1/users/wishlist", requestOptions);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wishlist: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === "success") {
        setWishlist(result.data?.wishlist || []);
      } else {
        throw new Error(result.message || "Failed to fetch wishlist");
      }
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      setError(error.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Add product to wishlist
  const addToWishlist = async (product) => {
    if (!isAuthenticated || !token) {
      setError("You must be logged in to add items to your wishlist");
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const productId = product._id || product.id;
      
      const raw = JSON.stringify({
        "productId": productId
      });
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
      
      const response = await fetch("https://hope-server-rho1.onrender.com/api/v1/users/wishlist", requestOptions);
      
      if (!response.ok) {
        throw new Error(`Failed to add to wishlist: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === "success") {
        // Refresh wishlist to get updated list
        await fetchWishlist();
        return true;
      } else {
        throw new Error(result.message || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Add to wishlist error:", error);
      setError(error.message || "Failed to add item to wishlist");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated || !token) {
      setError("You must be logged in to remove items from your wishlist");
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        redirect: "follow"
      };
      
      const response = await fetch(`https://hope-server-rho1.onrender.com/api/v1/users/wishlist/${productId}`, requestOptions);
      
      if (!response.ok) {
        throw new Error(`Failed to remove from wishlist: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === "success") {
        // Option 1: Refresh the wishlist entirely
        await fetchWishlist();
        
        // Option 2: Update locally (faster, but could get out of sync)
        // setWishlist(currentWishlist => currentWishlist.filter(item => (item._id || item.id) !== productId));
        
        return true;
      } else {
        throw new Error(result.message || "Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      setError(error.message || "Failed to remove item from wishlist");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle product in wishlist
  const toggleWishlist = async (product) => {
    const productId = product._id || product.id;
    const isInWishlistAlready = wishlist.some(item => (item._id || item.id) === productId);
    
    if (isInWishlistAlready) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(product);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => (item._id || item.id) === productId);
  };

  // Value to be provided
  const value = {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearError: () => setError(null)
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;