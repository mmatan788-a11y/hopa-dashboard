import { useState } from "react";
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
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
  FunnelIcon as FilterIcon,
  CalendarIcon,
  ArrowDownTrayIcon as DownloadIcon,
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

// AnalyticsCard Component
const AnalyticsCard = ({ title, value, change, isIncreasing, children }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg text-gray-700 font-semibold">{title}</h3>
          <div className="flex items-end mt-2">
            <p className="text-2xl font-bold text-gray-900 mr-2">{value}</p>
            <div
              className={`flex items-center text-sm ${
                isIncreasing ? "text-[#328E6E]" : "text-[#D04848]"
              }`}
            >
              {isIncreasing ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>{change}</span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <DownloadIcon className="h-5 w-5" />
        </button>
      </div>
      {children}
    </motion.div>
  );
};

// DateRangePicker Component
const DateRangePicker = () => {
  return (
    <div className="flex items-center bg-white rounded-lg border border-gray-200 px-3 py-2">
      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
      <span className="text-sm text-gray-600">Last 30 days</span>
      <ChevronRightIcon className="h-4 w-4 text-gray-400 ml-2" />
    </div>
  );
};

// FilterButton Component
const FilterButton = ({ active, children }) => {
  return (
    <button
      className={`px-3 py-1 rounded-md text-sm ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
};

// AnalyticsScreen Component
const AnalyticsScreen = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [timeRange, setTimeRange] = useState("30d");

  // Sales Analytics Data
  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Revenue",
        data: [12000, 19000, 30000, 50000, 20000, 30000, 45000],
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "#3B82F6",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Orders",
        data: [120, 190, 300, 500, 200, 300, 450],
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "#10B981",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Customer Behavior Data
  const customerBehaviorData = {
    labels: ["New", "Returning", "Inactive", "Churned"],
    datasets: [
      {
        data: [25, 40, 20, 15],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(249, 115, 22, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Vendor Performance Data
  const vendorPerformanceData = {
    labels: ["Vendor A", "Vendor B", "Vendor C", "Vendor D", "Vendor E"],
    datasets: [
      {
        label: "Sales",
        data: [12000, 19000, 8000, 15000, 25000],
        backgroundColor: "rgba(79, 70, 229, 0.7)",
      },
      {
        label: "Returns",
        data: [1200, 1900, 800, 1500, 2500],
        backgroundColor: "rgba(239, 68, 68, 0.7)",
      },
    ],
  };

  // Product Performance Data
  const productPerformanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Product A",
        data: [120, 190, 300, 500, 200, 300, 450],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Product B",
        data: [80, 120, 250, 400, 150, 250, 350],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
          <div className="flex items-center space-x-4">
            <DateRangePicker />
            <button className="flex items-center bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <FilterIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          {["sales", "customer", "vendor", "product", "custom"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "sales" && "Sales Analytics"}
              {tab === "customer" && "Customer Behavior"}
              {tab === "vendor" && "Vendor Performance"}
              {tab === "product" && "Product Performance"}
              {tab === "custom" && "Custom Reports"}
            </button>
          ))}
        </div>

        {/* Time Range Filters */}
        <div className="flex space-x-2 mb-6">
          {["7d", "30d", "90d", "12m", "custom"].map((range) => (
            <FilterButton
              key={range}
              active={timeRange === range}
              onClick={() => setTimeRange(range)}
            >
              {range === "7d" && "Last 7 days"}
              {range === "30d" && "Last 30 days"}
              {range === "90d" && "Last 90 days"}
              {range === "12m" && "Last 12 months"}
              {range === "custom" && "Custom range"}
            </FilterButton>
          ))}
        </div>

        {/* Sales Analytics */}
        {activeTab === "sales" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AnalyticsCard
              title="Total Revenue"
              value="$124,568"
              change="12.5%"
              isIncreasing={true}
            >
              <div className="h-64 mt-4">
                <Line
                  data={salesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        grid: {
                          drawBorder: false,
                        },
                        ticks: {
                          callback: (value) => `$${(value / 1000).toFixed(0)}k`,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </AnalyticsCard>

            <AnalyticsCard
              title="Conversion Rate"
              value="3.2%"
              change="0.5%"
              isIncreasing={true}
            >
              <div className="h-64 mt-4">
                <Bar
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                    datasets: [
                      {
                        label: "Conversion Rate",
                        data: [2.8, 3.1, 3.0, 3.2, 3.5, 3.1, 3.4],
                        backgroundColor: "rgba(124, 58, 237, 0.7)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `${value}%`,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </AnalyticsCard>
          </div>
        )}

        {/* Customer Behavior */}
        {activeTab === "customer" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <AnalyticsCard
              title="Customer Segments"
              value="4,568"
              change="8.2%"
              isIncreasing={true}
            >
              <div className="h-48 mt-4">
                <Doughnut
                  data={customerBehaviorData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                    cutout: "70%",
                  }}
                />
              </div>
            </AnalyticsCard>

            <AnalyticsCard
              title="Retention Rate"
              value="72%"
              change="3.1%"
              isIncreasing={true}
            >
              <div className="h-48 mt-4">
                <Line
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                    datasets: [
                      {
                        label: "Retention Rate",
                        data: [68, 70, 71, 72, 73, 72, 74],
                        borderColor: "#10B981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 60,
                        max: 80,
                        ticks: {
                          callback: (value) => `${value}%`,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </AnalyticsCard>

            <AnalyticsCard
              title="Avg. Order Value"
              value="$89.42"
              change="2.5%"
              isIncreasing={true}
            >
              <div className="h-48 mt-4">
                <Bar
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                    datasets: [
                      {
                        label: "AOV",
                        data: [85, 87, 88, 89, 90, 89, 91],
                        backgroundColor: "rgba(245, 158, 11, 0.7)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        ticks: {
                          callback: (value) => `$${value}`,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </AnalyticsCard>
          </div>
        )}

        {/* Vendor Performance */}
        {activeTab === "vendor" && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            <AnalyticsCard
              title="Top Vendors by Sales"
              value="12 Vendors"
              change="2 New"
              isIncreasing={true}
            >
              <div className="h-96 mt-4">
                <Bar
                  data={vendorPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `$${(value / 1000).toFixed(0)}k`,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </AnalyticsCard>
          </div>
        )}

        {/* Product Performance */}
        {activeTab === "product" && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            <AnalyticsCard
              title="Top Products"
              value="24 Products"
              change="5 New"
              isIncreasing={true}
            >
              <div className="h-96 mt-4">
                <Line
                  data={productPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        ticks: {
                          callback: (value) => `${value} units`,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </AnalyticsCard>
          </div>
        )}

        {/* Custom Report Generator */}
        {activeTab === "custom" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Custom Report Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Metrics</h3>
                <div className="space-y-2">
                  {["Revenue", "Orders", "Customers", "AOV", "Conversion"].map(
                    (metric) => (
                      <div key={metric} className="flex items-center">
                        <input
                          type="checkbox"
                          id={metric}
                          className="mr-2 rounded text-blue-600"
                        />
                        <label htmlFor={metric} className="text-gray-600">
                          {metric}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Dimensions</h3>
                <div className="space-y-2">
                  {["Date", "Product", "Category", "Region", "Channel"].map(
                    (dimension) => (
                      <div key={dimension} className="flex items-center">
                        <input
                          type="checkbox"
                          id={dimension}
                          className="mr-2 rounded text-blue-600"
                        />
                        <label htmlFor={dimension} className="text-gray-600">
                          {dimension}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Filters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Date Range
                    </label>
                    <DateRangePicker />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Product Category
                    </label>
                    <select className="w-full p-2 border rounded-md">
                      <option>All Categories</option>
                      <option>Electronics</option>
                      <option>Apparel</option>
                      <option>Home Goods</option>
                    </select>
                  </div>
                </div>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsScreen;