import React, { useState, useEffect, useCallback } from "react";
import { fetchFoundItems } from "../services/api";

const SearchItem = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("verified"); // or "claimed"

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchFoundItems();
      setItems(response || []);
      setError("");
    } catch (error) {
      setError("Error fetching items. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());

  const getStatusBadgeClass = (status) => {
    return {
      verified: "bg-green-500",
      claimed: "bg-blue-500",
    }[status] || "bg-gray-500";
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = [item.title, item.description, item.foundLocation]
      .filter(Boolean)
      .some((text) => text.toLowerCase().includes(searchQuery));

    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    const matchesStatus = item.status === activeTab;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-gray-100 flex flex-col items-center justify-start p-4 relative overflow-hidden">

      {error && <p className="text-red-600 text-center mb-3">{error}</p>}

      <h1 className="mt-8 text-3xl font-semibold text-blue-700">
        Search Lost Items
      </h1>
      <p className="text-gray-700 mt-2 mb-8">
        Find items that have been reported as found on campus
      </p>

      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-4 px-4">
        <div className="flex-1 bg-white backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white border-opacity-20 flex flex-col md:flex-row gap-4">
    
          <div className="relative w-full md:w-2/3">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Search by title, description, or keyword..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

        
          <div className="relative w-full md:w-1/3">
            <select
              className="w-full appearance-none pl-4 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
             
              <option value="Stationery">Stationery</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Personal belongings">Personal belongings</option>
              <option value="Academic materials">Academic materials</option>
              <option value="Accessories">Accessories</option>
              <option value="Sports equipment">Sports equipment</option>
              <option value="Food containers/Water bottles">Food containers/Water bottles</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button
          className={`px-5 py-2 rounded-full font-semibold focus:outline-none transition-colors duration-300 ${
            activeTab === "verified"
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
              : "bg-white bg-opacity-70 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("verified")}
        >
          Verified Items
        </button>
        <button
          className={`px-5 py-2 rounded-full font-semibold focus:outline-none transition-colors duration-300 ${
            activeTab === "claimed"
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
              : "bg-white bg-opacity-70 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("claimed")}
        >
          Claimed Items
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={item.image?.url || "/placeholder.jpg"}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h5 className="text-lg font-bold text-gray-900">{item.itemName}</h5>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-sm font-semibold text-blue-700">
                    Category: {item.category}
                  </p>
                  <span
                    className={`px-3 py-1 text-white rounded text-xs mt-2 inline-block ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No {activeTab} items found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchItem;
