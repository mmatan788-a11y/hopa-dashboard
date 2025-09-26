import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Users,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChartNoAxesCombined,
  House,
  Tag,
  Landmark,
  ShoppingBasket,
  Boxes,
  Gem,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ onToggle, onLogout }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeHover, setActiveHover] = useState(null);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    // Communicate state change to parent component
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Initial state communication on mount
  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, []);

  const sidebarVariants = {
    open: {
      width: "16rem",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      width: "5rem",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      initial="open"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="h-screen bg-white shadow-lg flex flex-col p-5 relative"
    >
      {/* Toggle Button */}
      <motion.div
        className="absolute -right-3 top-12 bg-[#DD761C] rounded-full p-1 cursor-pointer shadow-md z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <ChevronLeft className="text-white h-5 w-5" />
        ) : (
          <ChevronRight className="text-white h-5 w-5" />
        )}
      </motion.div>

      {/* Logo with animation */}
      <motion.div
        className="flex justify-center items-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      ></motion.div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2">
        <SidebarItem
          to="/overview"
          icon={House}
          text="Overview"
          isOpen={isOpen}
          setActiveHover={setActiveHover}
          activeHover={activeHover}
          id="overview"
        />
        <SidebarItem
          to="/analytics"
          icon={ChartNoAxesCombined}
          text="Analytics"
          isOpen={isOpen}
          setActiveHover={setActiveHover}
          activeHover={activeHover}
          id="analytics"
        />
        <SidebarItem
          to="/orders"
          icon={Tag}
          text="Orders"
          isOpen={isOpen}
          setActiveHover={setActiveHover}
          activeHover={activeHover}
          id="orders"
        />
        <SidebarItem
          to="/customermanagement"
          icon={User}
          text="Customer "
          isOpen={isOpen}
          setActiveHover={setActiveHover}
          activeHover={activeHover}
          id="customers"
        />
          <SidebarItem
          to="/approvals"
          icon={User}
          text="Approvals "
          isOpen={isOpen}
          setActiveHover={setActiveHover}
          activeHover={activeHover}
          id="approvals"
        />
        <SidebarItem
          to="/products"
          icon={ShoppingBasket}
          text="Products "
          isOpen={isOpen}
          setActiveHover={setActiveHover}
          activeHover={activeHover}
          id="products"
        />
        <SidebarItem
          to="/categories"
          icon={Boxes}
          text="Categories "
          isOpen={isOpen}
          setActiveHover={setActiveHover}
          activeHover={activeHover}
          id="categories"
        />
        <SidebarItem
          to="/promo"
          icon={Gem}
          text="Promotions "
          isOpen={isOpen}
          setActiveHover={setActiveHover}
          activeHover={activeHover}
          id="promo"
        />
        {/* <SidebarItem
          to="/financialreport"
          icon={Landmark}
          text="Financial Report"
          isOpen={isOpen}
          setActiveHover={setActiveHover}
          activeHover={activeHover}
          id="settings"
        /> */}
      </nav>

      {/* Divider with animation */}
      <motion.div
        className="mt-auto mb-4 border-t border-gray-200"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Footer with version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 text-center text-xs text-gray-400"
      >
        {isOpen && "v1.0.2"}
      </motion.div>

      {/* Logout - Modified to use button instead of NavLink */}
      <LogoutButton
        icon={LogOut}
        text="Logout"
        isOpen={isOpen}
        onLogout={handleLogout}
        setActiveHover={setActiveHover}
        activeHover={activeHover}
        id="logout"
      />
    </motion.div>
  );
};

// Regular SidebarItem component for navigation links
const SidebarItem = ({
  to,
  icon: Icon,
  text,
  isOpen,
  setActiveHover,
  activeHover,
  id,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const itemVariants = {
    active: {
      backgroundColor: "rgba(221, 118, 28, 0.2)",
      color: "rgb(221, 118, 28)", 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
    inactive: {
      backgroundColor: "transparent",
      color: "rgba(75, 85, 99, 1)",
      x: 0,
    },
    hover: {
      backgroundColor: "rgba(254, 185, 65, 0.2)",
      color: "rgb(254, 185, 65)",
      x: 4,
      transition: {},
    },
  };

  return (
    <div className="relative">
      <NavLink
        to={to}
        className="block"
        onMouseEnter={() => {
          setActiveHover(id);
          if (!isOpen) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setActiveHover(null);
          setShowTooltip(false);
        }}
      >
        {({ isActive }) => (
          <motion.div
            variants={itemVariants}
            initial="inactive"
            animate={
              isActive ? "active" : activeHover === id ? "hover" : "inactive"
            }
            className="flex items-center rounded-lg p-3 transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              whileHover={{ rotate: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Icon size={22} className="min-w-5" />
            </motion.div>

            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 font-medium"
                >
                  {text}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </NavLink>

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 50 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full top-1/2 transform -translate-y-1/2 z-20 px-2 py-1 rounded text-white text-xs whitespace-nowrap bg-indigo-600"
          >
            {text}
            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 rotate-45 bg-indigo-600"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Separate LogoutButton component that handles logout action
const LogoutButton = ({
  icon: Icon,
  text,
  isOpen,
  onLogout,
  setActiveHover,
  activeHover,
  id,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const itemVariants = {
    inactive: {
      backgroundColor: "transparent",
      color: "rgba(220, 38, 38, 0.7)",
      x: 0,
    },
    hover: {
      backgroundColor: "rgba(254, 226, 226, 0.7)",
      color: "rgba(220, 38, 38, 0.9)",
      x: 4,
      transition: {},
    },
  };

  const handleClick = () => {
    onLogout();
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="block w-full text-left"
        onMouseEnter={() => {
          setActiveHover(id);
          if (!isOpen) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setActiveHover(null);
          setShowTooltip(false);
        }}
      >
        <motion.div
          variants={itemVariants}
          initial="inactive"
          animate={activeHover === id ? "hover" : "inactive"}
          className="flex items-center rounded-lg p-3 transition-all duration-200 text-red-500"
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Icon size={22} className="min-w-5" />
          </motion.div>

          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-3 font-medium"
              >
                {text}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </button>

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 50 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full top-1/2 transform -translate-y-1/2 z-20 px-2 py-1 rounded text-white text-xs whitespace-nowrap bg-red-500"
          >
            {text}
            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 rotate-45 bg-red-500"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;