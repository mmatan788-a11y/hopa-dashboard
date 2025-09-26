import { createContext, useState, useContext, useEffect } from "react";

// Create the context
export const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);

  // Clear all auth data
  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("isLoggedIn");
    
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem("userData");
        const storedToken = localStorage.getItem("accessToken");
        
        if (userData && storedToken) {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
          setToken(storedToken);
          setIsAuthenticated(true);
          
          // Try to fetch updated user profile
          try {
            await fetchUserProfile(storedToken);
          } catch (profileError) {
            console.error("Failed to fetch profile during auth check:", profileError);
            // If profile fetch fails due to auth issues, clear everything
            if (profileError.message.includes("Authentication failed") || 
                profileError.message.includes("Invalid refresh token")) {
              console.log("Clearing expired auth data");
              clearAuthData();
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear potentially corrupted data
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Function to refresh token
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
        redirect: "follow",
      };
      
      const response = await fetch("https://clark-backend.onrender.com/api/v1/auth/refresh-token", requestOptions);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Invalid refresh token");
      }
      
      // Update tokens in localStorage
      localStorage.setItem("accessToken", result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem("refreshToken", result.refreshToken);
      }
      
      // Update token in state
      setToken(result.accessToken);
      
      return result.accessToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      // Don't immediately logout here, let the calling function decide
      throw error;
    }
  };

  // Fetch user profile function
  const fetchUserProfile = async (authToken) => {
    const tokenToUse = authToken || token;
    if (!tokenToUse) return null;
    
    try {
      setProfileLoading(true);
      setError(null);
      
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${tokenToUse}`);
      
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };
      
      const response = await fetch("https://clark-backend.onrender.com/api/v1/users/me", requestOptions);
      
      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          try {
            // Try to refresh token
            const newToken = await refreshToken();
            if (newToken) {
              // Retry with new token
              return fetchUserProfile(newToken);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            throw new Error("Authentication failed");
          }
        }
        throw new Error("Failed to fetch user profile");
      }
      
      const result = await response.json();
      
      if (result.status === "success") {
        // Update user data with latest profile information
        setUser(result.data.user);
        localStorage.setItem("userData", JSON.stringify(result.data.user));
        setIsAuthenticated(true);
        return result.data.user;
      } else {
        throw new Error(result.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError(error.message || "Failed to fetch user profile");
      throw error; // Re-throw so calling code can handle it
    } finally {
      setProfileLoading(false);
    }
  };

  // Login function with email/password
  const loginWithCredentials = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      
      const raw = JSON.stringify({
        email,
        password
      });
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
      
      const response = await fetch("https://clark-backend.onrender.com/api/v1/auth/login", requestOptions);
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        // Save tokens
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem("isLoggedIn", "true");
        
        // Set token in state
        setToken(result.accessToken);
        
        // Set minimal user data
        const initialUserData = result.data?.user || {};
        setUser(initialUserData);
        localStorage.setItem("userData", JSON.stringify(initialUserData));
        setIsAuthenticated(true);
        
        // Fetch complete profile
        try {
          await fetchUserProfile(result.accessToken);
        } catch (profileError) {
          console.warn("Failed to fetch complete profile after login:", profileError);
          // Don't fail the login if profile fetch fails
        }
        
        return result.data?.user;
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function (receiving user data from elsewhere)
  const login = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Fetch complete profile after login
    const currentToken = localStorage.getItem("accessToken");
    if (currentToken) {
      setToken(currentToken);
      try {
        await fetchUserProfile(currentToken);
      } catch (profileError) {
        console.warn("Failed to fetch profile after login:", profileError);
      }
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      
      const raw = JSON.stringify(userData);
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
      
      const response = await fetch("https://clark-backend.onrender.com/api/v1/auth/register", requestOptions);
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        return result.data;
      } else {
        throw new Error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearAuthData();
  };

  // Get user initials for profile placeholder
  const getUserInitials = () => {
    if (!user || !user.username) return "";
    return user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Generate random background color based on username
  const getUserColor = () => {
    if (!user || !user.username) return "#000000";
    let hash = 0;
    for (let i = 0; i < user.username.length; i++) {
      hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    if (!token) {
      setError("You must be logged in to update your profile");
      return null;
    }
    
    try {
      setProfileLoading(true);
      setError(null);
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: JSON.stringify(profileData),
        redirect: "follow"
      };
      
      const response = await fetch("https://clark-backend.onrender.com/api/v1/users/me", requestOptions);
      
      if (response.status === 401) {
        // Try to refresh token
        try {
          const newToken = await refreshToken();
          if (newToken) {
            // Retry with new token
            myHeaders.set("Authorization", `Bearer ${newToken}`);
            const retryOptions = { ...requestOptions, headers: myHeaders };
            const retryResponse = await fetch("https://clark-backend.onrender.com/api/v1/users/me", retryOptions);
            const retryResult = await retryResponse.json();
            
            if (retryResponse.ok && retryResult.status === "success") {
              setUser(retryResult.data.user);
              localStorage.setItem("userData", JSON.stringify(retryResult.data.user));
              return retryResult.data.user;
            }
          }
        } catch (refreshError) {
          console.error("Token refresh failed during profile update:", refreshError);
          logout();
          throw new Error("Authentication failed");
        }
      }
      
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        // Update user data
        setUser(result.data.user);
        localStorage.setItem("userData", JSON.stringify(result.data.user));
        return result.data.user;
      } else {
        throw new Error(result.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setError(error.message || "Failed to update profile");
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  // Value to be provided
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    profileLoading,
    login,
    loginWithCredentials,
    register,
    logout,
    getUserInitials,
    getUserColor,
    refreshToken,
    fetchUserProfile,
    updateProfile,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;