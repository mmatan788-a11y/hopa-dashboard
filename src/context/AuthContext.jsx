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
          
          // Fetch updated user profile after setting initial data
          await fetchUserProfile(storedToken);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError("Failed to restore authentication state");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

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
      
      const response = await fetch("https://hope-server-rho1.onrender.com/api/v1/users/me", requestOptions);
      
      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          // Try to refresh token
          const newToken = await refreshToken();
          if (newToken) {
            // Retry with new token
            return fetchUserProfile(newToken);
          }
          throw new Error("Authentication failed");
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
      return null;
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
      
      const response = await fetch("https://hope-server-rho1.onrender.com/api/v1/auth/login", requestOptions);
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
        await fetchUserProfile(result.accessToken);
        
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

  // Login function (receiving user data from elsewhere) - FIXED VERSION
  const login = (userData) => {
    // Force synchronous state updates
    setUser(userData);
    setIsAuthenticated(true);
    setLoading(false); // Make sure loading is false
    
    // Get current token
    const currentToken = localStorage.getItem("accessToken");
    if (currentToken) {
      setToken(currentToken);
      // Fetch complete profile but don't wait for it
      // The state is already updated, so UI will reflect logged-in status
      fetchUserProfile(currentToken).catch(err => {
        console.error("Failed to fetch full profile:", err);
      });
    }
    
    // Force a small delay to ensure React has time to update
    return new Promise(resolve => {
      setTimeout(() => resolve(userData), 50);
    });
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
      
      const response = await fetch("https://hope-server-rho1.onrender.com/api/v1/auth/register", requestOptions);
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
    // Clear all auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("isLoggedIn");
    
    // Reset state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Function to refresh token
  const refreshToken = async () => {
  try {
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedRefreshToken) {
      console.warn("No refresh token found — cannot refresh session.");
      return null;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
      redirect: "follow",
    };

    console.log("Refreshing token...");

    const response = await fetch("https://hope-server-rho1.onrender.com/api/v1/auth/refresh-token", requestOptions);
    const result = await response.json();

    // 🧠 Handle failed responses gracefully
    if (!response.ok || result.status !== "success") {
      console.error("Refresh token failed:", result);
      // Only logout if the refresh token is invalid or expired
      if (
        result.message?.toLowerCase().includes("invalid") ||
        result.message?.toLowerCase().includes("expired")
      ) {
        logout();
      }
      return null;
    }

    // ✅ Update access token
    if (result.accessToken) {
      localStorage.setItem("accessToken", result.accessToken);
      setToken(result.accessToken);
    }

    // ✅ Only update refresh token if backend returns a new one
    if (result.refreshToken) {
      localStorage.setItem("refreshToken", result.refreshToken);
    }

    console.log("Token refreshed successfully ✅");
    return result.accessToken || null;
  } catch (error) {
    console.error("Token refresh error:", error);

    // Only logout on true auth errors, not network issues
    if (
      error.message?.toLowerCase().includes("invalid") ||
      error.message?.toLowerCase().includes("expired")
    ) {
      logout();
    }

    // Don’t throw — just return null so fetchUserProfile can handle gracefully
    return null;
  }
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
      
      const response = await fetch("https://hope-server-rho1.onrender.com/api/v1/users/me", requestOptions);
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