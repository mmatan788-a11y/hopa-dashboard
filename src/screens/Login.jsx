import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logingif from "../assets/images/logingif.png";

const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "phone"
  const [credentials, setCredentials] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "email" ? "phone" : "email");
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    // Create payload based on login method
    const payload = {
      password: credentials.password,
    };

    if (loginMethod === "email") {
      payload.email = credentials.email;
    } else {
      payload.phone = credentials.phone;
    }

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    };

    const response = await fetch(
      "https://clark-backend.onrender.com/api/v1/auth/login",
      requestOptions
    );
    const result = await response.json();
    
    console.log('Login response:', result); // Debug log

    if (!response.ok) {
      throw new Error(result.message || "Login failed");
    }

    // Check what token field the API actually returns
    const accessToken = result.token || result.accessToken;
    const refreshToken = result.refreshToken;
    
    if (!accessToken) {
      throw new Error("No access token received from login");
    }

    // Store tokens and user data in both localStorage and sessionStorage
    localStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("authToken", accessToken); // For router authentication check
    
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem("userData", JSON.stringify(result.data?.user || result.user));
    localStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("isLoggedIn", "true");
    
    // Update auth context
    login(result.data?.user || result.user);
    
    // Force a page reload to ensure router picks up the authentication state
    // or trigger a state update in your router component
    window.location.href = "/overview";
    
  } catch (error) {
    setError(error.message || "Invalid credentials. Please try again.");
    console.error("Login error:", error);
  } finally {
    setLoading(false);
  }
};

  // Get user initials for profile placeholder
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Generate random background color based on username
  const getRandomColor = (name) => {
    if (!name) return "#000000";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <div className="w-[200%] h-[200%] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 blur-3xl opacity-20 animate-bg-motion"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-xl shadow-xl hover:shadow-neon transition duration-300">
        {/* GIF Image */}
        <div className="w-full flex justify-center mb-6">
          <img
            src={logingif}
            alt="Login Animation"
            className="w-24 h-24 object-cover rounded-full border-4 border-purple-500 animate-pulse"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl text-center text-neon-blue font-bold mb-8">
          Welcome Back
        </h1>

        {/* Toggle Between Email and Phone */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 rounded-full p-1 flex">
            <button
              onClick={() => setLoginMethod("email")}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                loginMethod === "email"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setLoginMethod("phone")}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                loginMethod === "phone"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400"
              }`}
            >
              Phone
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {loginMethod === "email" ? (
            <div className="relative group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={credentials.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-transparent border border-gray-700 rounded-lg outline-none text-white focus:border-neon-pink transition duration-300"
                required
              />
            </div>
          ) : (
            <div className="relative group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={credentials.phone}
                onChange={handleInputChange}
                className="w-full p-3 bg-transparent border border-gray-700 rounded-lg outline-none text-white focus:border-neon-pink transition duration-300"
                required
              />
            </div>
          )}
          
          <div className="relative group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleInputChange}
              className="w-full p-3 bg-transparent border border-gray-700 rounded-lg outline-none text-white focus:border-neon-pink transition duration-300"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:scale-105 transform transition duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="ml-2">Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-gray-400 text-center mt-6 text-sm">
          Don't have an account?{" "}
          <span 
            onClick={() => navigate("/signup")}
            className="text-neon-pink cursor-pointer hover:text-neon-blue transition duration-300"
          >
            Sign Up
          </span>
          <span 
            onClick={() => navigate("/adminlogin")}
            className="text-neon-pink cursor-pointer hover:text-neon-blue ml-4 transition duration-300"
          >
            Admin
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;