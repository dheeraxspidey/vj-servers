import React, { useState } from 'react';
import { submitFoundItem } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReportItem = ({ onItemReported }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    foundLocation: '',
    category: '',
    handoverLocation: ''
  });
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setFormData({ itemName: '', description: '', foundLocation: '', category: '' });
    setImage(null);
    setStatus('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setImage(file);
      setStatus('');
    } else {
      setStatus('Image must be less than 5MB');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setStatus('Please upload an image.');
      return;
    }
    setLoading(true);
    try {
      const index = user.email?.indexOf('@');
      const rollNo = user.email.substring(0, index);
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append('reporterRollNo', rollNo);
      if (image) data.append('image', image);
      else console.log("there is no image");

      const response = await submitFoundItem(data);
      if (response.success) {
        resetForm();
        setSuccessMessage('Item successfully reported!');
        setTimeout(() => {
          setSuccessMessage('');
          onItemReported?.(response.item);
          navigate('/');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to report item');
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-100 to-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-lg">
        {status && <p className="text-red-600 mb-3">{status}</p>}
        {successMessage && <p className="text-green-600 mb-3">{successMessage}</p>}
        <h2 className="text-2xl font-semibold text-center mb-4 text-blue-700">
          Report Found Item
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="Item Name"
            className="border rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            rows="3"
            className="border rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
          <input
            type="text"
            name="foundLocation"
            value={formData.foundLocation}
            onChange={handleChange}
            placeholder="Found Location"
            className="border rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            <option value="Stationery">Stationery</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Personal Belongings">Personal Belongings</option>
            <option value="Academic Materials">Academic Materials</option>
            <option value="Accessories">Accessories</option>
            <option value="Sports Equipment">Sports Equipment</option>
            <option value="Food Containers/Water Bottles">Food Containers/Water Bottles</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="file"
            onChange={handleImageChange}
            className="border rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500"
            accept="image/jpeg,image/jpg,image/png"
            required
          />
          <button
            type="submit"
            className={`bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
