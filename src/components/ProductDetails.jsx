import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaWhatsapp,
  FaStar,
  FaRegStar,
  FaEye,
  FaTag,
  FaComment,
  FaCrown,
  FaGem,
  FaMedal,
  FaAward,
  FaPhone,
} from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import {
  ChevronRight,
  Shield,
  Truck,
  BadgeCheck,
  MessageCircle,
} from "lucide-react";

const ProductDetails = () => {
  // Custom scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // Add ref to track if view has been tracked
  const viewTracked = useRef(false);

  // Review form state
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Promotion plan badge configuration
  const promotionBadges = {
    free: {
      icon: null,
      text: "Free Listing",
      color: "bg-gray-100 text-gray-800",
    },
    basic: {
      icon: <FaMedal className="mr-1" />,
      text: "Basic Plan",
      color: "bg-blue-100 text-blue-800",
    },
    premium: {
      icon: <FaGem className="mr-1" />,
      text: "Premium Plan",
      color: "bg-purple-100 text-purple-800",
    },
    ultra: {
      icon: <FaCrown className="mr-1" />,
      text: "Ultra Plan",
      color: "bg-yellow-100 text-yellow-800",
    },
  };

  // Fetch product data with optional authentication
  const fetchProductData = async () => {
    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (isAuthenticated) {
        const token = localStorage.getItem("accessToken");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const response = await fetch(
        `https://hope-server-rho1.onrender.com/api/v1/products/${id}`,
        {
          method: "GET",
          headers: headers,
          redirect: "follow",
        }
      );

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const result = await response.json();
      setProduct(result.data.product);

      if (result.data.product.images && result.data.product.images.length > 0) {
        setSelectedImage(result.data.product.images[0]);
      }

      if (result.data.product.reviews) {
        setReviews(result.data.product.reviews);
      } else {
        await fetchReviews(id);
      }

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Track product view
  const trackProductView = async () => {
    if (viewTracked.current) return;

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (isAuthenticated) {
        const token = localStorage.getItem("accessToken");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        } else {
          viewTracked.current = true;
          return;
        }
      }

      const response = await fetch(
        `https://hope-server-rho1.onrender.com/api/v1/products/${id}/view`,
        {
          method: "POST",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to track view");
      }

      viewTracked.current = true;
    } catch (error) {
      console.error("Error tracking product view:", error);
      viewTracked.current = true;
    }
  };

  useEffect(() => {
    const loadProductData = async () => {
      viewTracked.current = false;

      try {
        const productLoaded = await fetchProductData();
        if (productLoaded) {
          await trackProductView();
        }
      } catch (error) {
        console.error("Error loading product:", error);
      }
    };

    if (id) {
      loadProductData();
    }
  }, [id]);

  const fetchReviews = async (productId) => {
    try {
      const response = await fetch(
        `https://hope-server-rho1.onrender.com/api/v1/products/${productId}/reviews`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const result = await response.json();
      setReviews(result.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && reviews.length > 0) {
      const userHasReviewed = reviews.some(
        (review) => review.user && review.user._id === user.id
      );
      setHasUserReviewed(userHasReviewed);
    } else {
      setHasUserReviewed(false);
    }
  }, [reviews, user, isAuthenticated]);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setReviewError("Please login to post a review");
      return;
    }

    if (hasUserReviewed) {
      setReviewError("You have already reviewed this product");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(reviewFormData),
        redirect: "follow",
      };

      const response = await fetch(
        `https://hope-server-rho1.onrender.com/api/v1/products/${id}/reviews`,
        requestOptions
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit review");
      }

      setReviewFormData({
        rating: 5,
        comment: "",
      });

      await fetchProductData();
      setReviewSuccess("Your review has been posted successfully!");
      setHasUserReviewed(true);

      setTimeout(() => {
        setReviewSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Review submission error:", error);
      setReviewError(error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const navigateToSellerProfile = () => {
    if (product && product.owner) {
      navigate(`/seller/${product.owner._id}`);
    }
  };

  const navigateToMessages = () => {
    if (product && product.owner) {
      navigate(`/messages/${product.owner._id}`);
    }
  };

  const toggleContactVisibility = () => {
    setShowContact(!showContact);
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < Math.round(rating || 0) ? (
          <FaStar key={i} className="text-yellow-400 inline" />
        ) : (
          <FaRegStar key={i} className="text-yellow-400 inline" />
        )
      );
  };

  const renderClickableStars = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <label key={i} className="cursor-pointer">
          <input
            type="radio"
            name="rating"
            value={i + 1}
            checked={reviewFormData.rating === i + 1}
            onChange={handleReviewChange}
            className="hidden"
          />
          {i < reviewFormData.rating ? (
            <FaStar className="text-yellow-400 text-xl mx-1" />
          ) : (
            <FaRegStar className="text-yellow-400 text-xl mx-1" />
          )}
        </label>
      ));
  };

  // Custom Back Button Component
  const BackButton = () => (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
    >
      ← Back
    </button>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Error Loading Product
          </h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="bg-gray-50 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const isInWishlist = wishlist.some((item) => item.id === product.id);
  const hasImages = product.images && product.images.length > 0;
  const discountPrice =
    product.discountPrice !== undefined
      ? product.discountPrice.toLocaleString()
      : (product.price * (1 - product.discount / 100)).toLocaleString();

  const promotionPlan = product.promotionPlan?.type || "free";
  const promotionBadge = promotionBadges[promotionPlan];
  const isFreeListing = promotionPlan === "free";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img
              src={hasImages ? selectedImage : "https://via.placeholder.com/800"}
              alt={product.name}
              className="w-full h-96 object-contain p-4"
            />
          </div>

          {hasImages && (
            <div className="flex gap-3 overflow-x-auto py-2 px-1">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  aria-pressed={selectedImage === image}
                  title={`View image ${index + 1}`}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === image
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {product.name}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                <span>SKU: {product._id.slice(-6).toUpperCase()}</span>
                <span>•</span>
                <span>{product.views || 0} views</span>
                <span>•</span>
                <span>{reviews.length || 0} reviews</span>
              </div>
            </div>
            <button
              onClick={() => toggleWishlist(product)}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <FaHeart
                className={`text-lg ${
                  isInWishlist ? "text-red-500" : "text-gray-400"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex">{renderStars(product.rating || 0)}</div>
            <span className="text-sm text-gray-600">
              ({reviews.length || 0})
            </span>
          </div>

          <div className="space-y-3">
            {product.discount > 0 && (
              <div className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm font-medium">
                {product.discount}% OFF
              </div>
            )}

            <div className="flex items-baseline space-x-3">
              {product.discount > 0 && (
                <span className="text-2xl text-gray-400 line-through">
                  GH₵{product.price.toLocaleString()}
                </span>
              )}
              <span className="text-3xl font-bold text-gray-900">
                GH₵{discountPrice}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center text-sm bg-gray-100 px-3 py-1 rounded-full">
                <FaTag className="mr-1 text-gray-500" />
                <span className="text-gray-700">
                  {product.subcategory || "No category"}
                </span>
              </div>
              <div className="flex items-center text-sm bg-gray-100 px-3 py-1 rounded-full">
                <FaEye className="mr-1 text-gray-500" />
                <span className="text-gray-700">
                  {product.condition || "New"}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-2">
              Seller Information
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={navigateToSellerProfile}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors"
              >
                {product.owner?.username?.charAt(0).toUpperCase() || "U"}
              </button>
              <div>
                <button
                  onClick={navigateToSellerProfile}
                  className="font-medium hover:text-blue-600 transition-colors"
                >
                  {product.owner?.username || "Unknown seller"}
                </button>
                <p className="text-sm text-gray-500">
                  Member since {new Date(product.dateUploaded).getFullYear()}
                </p>
              </div>
              <div className="ml-auto flex space-x-2">
                {isAuthenticated && (
                  <>
                    {!isFreeListing && (
                      <button
                        onClick={navigateToMessages}
                        className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <MessageCircle size={16} />
                        <span>Message</span>
                      </button>
                    )}
                    {isFreeListing && (
                      <button
                        onClick={toggleContactVisibility}
                        className="flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <FaPhone size={14} />
                        <span>{showContact ? "Hide Contact" : "Show Contact"}</span>
                      </button>
                    )}
                  </>
                )}

                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    <FaPhone size={14} />
                    <span>Login to View Contact</span>
                  </Link>
                )}

                {!isFreeListing && (
                  <span className="flex items-center text-blue-600 text-sm bg-blue-50 px-3 py-2 rounded-lg">
                    <BadgeCheck size={16} className="mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {isAuthenticated && isFreeListing && showContact && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Seller Contact</h4>
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span> {product.owner?.phone || "Not available"}
                </p>
                {product.owner?.whatsapp && (
                  <a
                    href={`https://wa.me/${product.owner.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    <FaWhatsapp size={16} className="mr-2" />
                    Chat on WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("description")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "description"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("specifications")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "specifications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reviews ({reviews.length || 0})
            </button>
          </nav>
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Product Details
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {product.description || "No description available."}
              </p>

              {product.tags && product.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">General</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Category</span>
                      <span>{product.subcategory || "N/A"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Condition</span>
                      <span>{product.condition || "New"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Date Listed</span>
                      <span>
                        {new Date(product.dateUploaded).toLocaleDateString()}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Pricing</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Original Price</span>
                      <span>GH₵{product.price}</span>
                    </li>
                    {product.discount > 0 && (
                      <>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Discount</span>
                          <span className="text-red-600">
                            {product.discount}% OFF
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Discounted Price</span>
                          <span className="font-medium">GH₵{discountPrice}</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Customer Reviews
                </h3>
                <div className="flex items-center">
                  {renderStars(product.rating || 0)}
                  <span className="ml-2 text-sm text-gray-600">
                    ({reviews.length} reviews)
                  </span>
                </div>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Login to Review{" "}
                    <ChevronRight size={14} className="inline" />
                  </Link>
                )}
              </div>

              {isAuthenticated && !hasUserReviewed && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Write a Review
                  </h4>

                  {reviewError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                      {reviewError}
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                      {reviewSuccess}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <div className="flex">{renderClickableStars()}</div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="comment"
                        name="comment"
                        value={reviewFormData.comment}
                        onChange={handleReviewChange}
                        rows="4"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Share your experience with this product..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors ${
                        submittingReview ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {submittingReview ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-6 last:border-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                            {review.user?.username?.charAt(0).toUpperCase() ||
                              "U"}
                          </div>
                          <div>
                            <p className="font-medium">
                              {review.user?.username || "Anonymous"}
                            </p>
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <FaComment className="text-3xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No reviews yet. Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

   
    </div>
  );
};

export default ProductDetails;