import { useState, useEffect } from "react";
import axios from "axios";

function UploadItem() {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("All");
  const [foundLocation, setFoundLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSuccess(false);

    // Validation
    const missingFields = [];
    if (!itemName) missingFields.push("Item Name");
    if (category === "All") missingFields.push("Category");
    if (!foundLocation) missingFields.push("Found Location");
    if (!description) missingFields.push("Description");
    if (!image) missingFields.push("Image");

    if (missingFields.length > 0) {
      setErrorMessage(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("itemName", itemName);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("foundLocation", foundLocation);
    formData.append("image", image);

    try {
      await axios.post(`${import.meta.env.VITE_EASYFIND_BACKEND_URL}/api/items/admin/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsSuccess(true);
      setItemName("");
      setCategory("All");
      setFoundLocation("");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      setFileInputKey(Date.now());
    } catch (error) {
      let errorMsg = "Failed to upload item. Please try again.";
      if (error.response) {
        if (error.response.data.errors) {
          errorMsg = Object.values(error.response.data.errors)
            .map(err => err.message)
            .join(', ');
        } else {
          errorMsg = error.response.data.message || errorMsg;
        }
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Upload Found Item</h3>
      
      {/* Status Messages */}
      {isSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4">
          ✅ Item uploaded successfully!
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          ❌ Error: {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Item Name"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>

        <div>
          <textarea
            placeholder="Description"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">Select Category</option>
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
          <input
            type="text"
            placeholder="Found Location"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={foundLocation}
            onChange={(e) => setFoundLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Upload Image
          </label>
          <input 
            key={fileInputKey}
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-32 w-32 object-contain rounded-md border"
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition relative"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Uploading...
            </div>
          ) : (
            "Upload Item"
          )}
        </button>
      </form>
    </div>
  );
}

export default UploadItem;