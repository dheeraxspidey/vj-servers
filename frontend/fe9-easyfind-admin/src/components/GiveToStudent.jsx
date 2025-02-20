import { useState, useEffect } from "react";
import axios from "axios";
import ClaimedItemDetails from "./ClaimedItemDetails";

function GiveToStudent() {
  const [items, setItems] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);
  const [contact, setContact] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [handoverDate, setHandoverDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("verified");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [backendError, setBackendError] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedItemForVerification, setSelectedItemForVerification] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_EASYFIND_BACKEND_URL}/api/items/found`);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
        setBackendError("Failed to load items. Please try again later.");
      }
    };
    fetchItems();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProofImage(file);
      setProofImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProofs = async () => {
    if (!selectedItem || !proofImage || !contact || !rollNo || !name || !handoverDate) {
      setErrorMessage("Please fill all details and upload a proof image.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setBackendError("");
    setIsSuccess(false);

    const formData = new FormData();
    formData.append("image", proofImage);
    formData.append("contact", contact);
    formData.append("rollNo", rollNo);
    formData.append("name", name);
    formData.append("dateHandovered", new Date(handoverDate).toISOString());

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_EASYFIND_BACKEND_URL}/api/items/admin/${selectedItem._id}/handover`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setItems(items.map(item => 
        item._id === selectedItem._id ? { 
          ...item, 
          status: "claimed", 
          claimerDetails: { 
            contact, 
            rollNo, 
            name, 
            dateHandovered: new Date(handoverDate).toISOString() 
          } 
        } : item
      ));

      // Reset all states
      setSelectedItem(null);
      setProofImage(null);
      setProofImagePreview(null);
      setContact("");
      setRollNo("");
      setName("");
      setHandoverDate("");
      setIsSuccess(true);
    } catch (error) {
      let errorMsg = "An unexpected error occurred. Please try again.";
      
      if (error.response) {
        if (error.response.data.errors) {
          errorMsg = Object.values(error.response.data.errors)
            .map(err => err.message)
            .join(', ');
        } else {
          errorMsg = error.response.data.message || "Server error occurred";
        }
      } else if (error.request) {
        errorMsg = "No response from server. Please check your connection.";
      }
      
      setBackendError(errorMsg);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsSuccess(false);
        setBackendError("");
      }, 5000);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const filteredItems = items
    .filter(item =>
      (searchCode ? item.code.includes(searchCode) : true) &&
      (searchCategory ? item.category.toLowerCase().includes(searchCategory.toLowerCase()) : true) &&
      item.status === filterStatus
    )
    .sort((a, b) => {
      if (a.status === "claimed" && b.status === "claimed") {
        return new Date(b.DateHandovered) - new Date(a.DateHandovered);
      }
      return 0;
    });

  const handleStatusChange = async (itemId, status) => {
    setUpdatingStatus(true);
    try {
      await axios.put(`${import.meta.env.VITE_EASYFIND_BACKEND_URL}/api/items/admin/${itemId}/status`, { status });
      setItems(items.map(item => 
        item._id === itemId ? { ...item, status } : item
      ));
      setShowImageModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h3 className="text-2xl font-bold mb-6">Give Item to Student</h3>

      {/* Status Messages */}
      {isSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4">
          ✅ Handover successful!
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md mb-4">
          ⚠️ {errorMessage}
        </div>
      )}
      
      {backendError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          ❌ Error: {backendError}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Code"
          className="border px-3 py-2 rounded-md flex-1 min-w-[200px]"
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Category"
          className="border px-3 py-2 rounded-md flex-1 min-w-[200px]"
          onChange={(e) => setSearchCategory(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${
            filterStatus === "verified" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setFilterStatus("verified")}
        >
          Show Verified
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            filterStatus === "pending" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setFilterStatus("pending")}
        >
          Show Pending
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            filterStatus === "claimed" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setFilterStatus("claimed")}
        >
          Show Claimed
        </button>
      </div>

      {/* Items List */}
      <ul className="space-y-4">
        {filteredItems.map(item => (
          <li key={item._id} className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {item.itemName} <span className="text-sm text-gray-600">(Code: {item.code})</span>
                </p>
                <p className="text-sm text-gray-600">Category: {item.category}</p>
                <p className={`text-sm font-semibold ${
                  item.status === "verified" ? "text-blue-600" :
                  item.status === "claimed" ? "text-green-600" : "text-yellow-600"
                }`}>
                  Status: {item.status.toUpperCase()}
                </p>
                {item.status === "claimed" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Handover Date: {formatDate(item.claimerDetails.dateHandovered)}
                  </p>
                )}
                {item.status === "claimed" && <ClaimedItemDetails item={item} />}
              </div>
              
              {item.status === "verified" && (
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md ml-4"
                  onClick={() => {
                    // Toggle form visibility and reset states
                    if (selectedItem?._id === item._id) {
                      setSelectedItem(null);
                    } else {
                      setSelectedItem(item);
                      setName("");
                      setRollNo("");
                      setContact("");
                      setHandoverDate("");
                      setProofImage(null);
                      setProofImagePreview(null);
                    }
                    setErrorMessage("");
                    setBackendError("");
                  }}
                >
                  {selectedItem?._id === item._id ? "Close Form" : "Hand Over"}
                </button>
              )}
            </div>

            {/* Handover Form - Rendered under the selected item */}
            {selectedItem?._id === item._id && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-lg font-semibold mb-4">
                  Handover Details for: {item.itemName}
                </h4>
                
                {/* Item Image Preview */}
                {item.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={item.imageUrl}
                      alt={item.itemName}
                      className="w-32 h-32 object-contain rounded-md border"
                    />
                    <p className="text-sm text-gray-500 mt-1">Item Image</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Student Name"
                    className="border px-3 py-2 rounded-md"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Roll Number"
                    className="border px-3 py-2 rounded-md"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Contact Number"
                    className="border px-3 py-2 rounded-md"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                  <input
                    type="date"
                    className="border px-3 py-2 rounded-md"
                    value={handoverDate}
                    onChange={(e) => setHandoverDate(e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <label className="block mb-2 font-medium">Upload Handover Proof:</label>
                  <input
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
                  {proofImagePreview && (
                    <div className="mt-2">
                      <img
                        src={proofImagePreview}
                        alt="Proof Preview"
                        className="w-32 h-32 object-contain rounded-md border"
                      />
                      <p className="text-sm text-gray-500 mt-1">Proof Image Preview</p>
                    </div>
                  )}
                </div>

                <button
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handleSubmitProofs}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
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
                      Processing...
                    </span>
                  ) : (
                    "Confirm Handover"
                  )}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Enhanced Verification Modal */}
      {showImageModal && selectedItemForVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Verify Item Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Image Section */}
              <div className="flex flex-col">
                <img
                  src={selectedItemForVerification.imageUrl}
                  alt={selectedItemForVerification.itemName}
                  className="w-full h-64 object-contain rounded-md mb-2"
                />
                <p className="text-sm text-gray-500 text-center">
                  Item Image
                </p>
              </div>

              {/* Text Details Section */}
              <div className="space-y-2">
                <p className="font-semibold">
                  <span className="text-gray-600">Code:</span>{" "}
                  {selectedItemForVerification.code}
                </p>
                <p>
                  <span className="text-gray-600">Name:</span>{" "}
                  {selectedItemForVerification.itemName}
                </p>
                <p>
                  <span className="text-gray-600">Category:</span>{" "}
                  {selectedItemForVerification.category}
                </p>
                <p>
                  <span className="text-gray-600">Description:</span>{" "}
                  {selectedItemForVerification.description}
                </p>
                <p>
                  <span className="text-gray-600">Found Location:</span>{" "}
                  {selectedItemForVerification.foundLocation}
                </p>
                <p>
                  <span className="text-gray-600">Reported Date:</span>{" "}
                  {new Date(selectedItemForVerification.reportedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 border-t pt-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                onClick={() => setShowImageModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={() => handleStatusChange(selectedItemForVerification._id, "verified")}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                    Verifying...
                  </span>
                ) : (
                  "Confirm Verification"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GiveToStudent;