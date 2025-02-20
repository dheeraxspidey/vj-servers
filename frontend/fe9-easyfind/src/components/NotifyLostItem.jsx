import { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import LostItems from "./LostItems"; // Import LostItems component

function NotifyLostItems() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [itemName, setItemName] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const email = user?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !location || !itemName) {
      setMessage("Please fill in all the fields.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/items/lost",
        { category, location, email, itemName },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setMessage("Item reported successfully! You will be notified via email if a matching item is found.");
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      setMessage("Failed to report the item.");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 p-4">
      <div className="w-full max-w-lg mx-auto p-6 bg-white shadow-xl rounded-2xl">
        <h1 className="text-2xl font-semibold text-center mb-4 text-blue-700">
          Notify Lost Items
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4"
        >
          <div>
            <label
              htmlFor="category"
              className="block mb-1 text-sm font-semibold text-darkgray-600 "
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select category</option>
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

          <div>
            <label
              htmlFor="location"
              className="block mb-1 text-sm font-semibold text-darkgray-600"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter the location where you lost the item"
              className="border rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="itemName"
              className="block mb-1 text-sm font-semibold text-darkgray-600"
            >
              Item Name
            </label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter the item name"
              className="border rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Submit
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 text-center bg-gray-100 text-blue-700 rounded-lg">
            {message}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-100 text-blue-800 rounded-lg text-center">
          <p>
            You will receive an email notification when a matching item is found.
          </p>
        </div>

        <div className="mt-8">
          <LostItems />
        </div>
      </div>
    </div>
  );
}

export default NotifyLostItems;
