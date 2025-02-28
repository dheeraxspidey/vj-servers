import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale } from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminAnalysis.css"; // Import the CSS file
import { useAuth } from "../../Context/AuthContext";

ChartJS.register(BarElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const AdminAnalysis = () => {
  const baseUrl = process.env.REACT_APP_COMPLAINTS_APP_BE_URL;
  // State to store fetched complaint counts
  const [complaintsData, setComplaintsData] = useState({
    resolved: 0,
    pending: 0,
    ongoing: 0,
  });

  const { adminData } = useAuth(); 
  console.log(adminData)

  // Fetch complaint counts from the backend
  useEffect(() => {
    const fetchComplaintCounts = async () => {
      if (adminData) {
        try {
            console.log(adminData) 
          const category = adminData.category; // Assuming admin data has 'category'
          const response = await axios.get(`${baseUrl}/admin-api/complaints-count/${category}`);
          setComplaintsData(response.data);
        } catch (error) {
          console.error("Error fetching complaint counts:", error);
        }
      }
    };

    if (adminData) {
      fetchComplaintCounts();
    }
  }, [adminData]);

  // Bar Chart Data
  const barData = {
    labels: ["Resolved", "Pending", "Ongoing"],
    datasets: [
      {
        label: "Number of Complaints",
        data: [complaintsData.resolved, complaintsData.pending, complaintsData.ongoing],
        backgroundColor: ["#28a745", "#ffc107", "#17a2b8"],
        borderRadius: 5,
      },
    ],
  };

  // Pie Chart Data
  const pieData = {
    labels: ["Resolved", "Pending", "Ongoing"],
    datasets: [
      {
        data: [complaintsData.resolved, complaintsData.pending, complaintsData.ongoing],
        backgroundColor: ["#28a745", "#ffc107", "#17a2b8"],
      },
    ],
  };

  // Chart Options (For Consistent Sizing)
  const chartOptions = {
    maintainAspectRatio: false, // Ensure the chart does not maintain aspect ratio
    responsive: true, // Ensure the chart is responsive
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className="statistics-page">
      <h2 className="text-center mb-4 fw-bold">Admin Complaint Statistics 📊</h2>

      <div className="row">
        {/* Bar Chart */}
        <div className="col-md-6 mb-4">
          <div className="chart-card">
            <h5 className="chart-title">Complaints Overview</h5>
            <div className="chart-container">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-md-6 mb-4">
          <div className="chart-card">
            <h5 className="chart-title">Complaint Distribution</h5>
            <div className="chart-container">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h4 className="summary-title">📌 Total Complaints: {complaintsData.resolved + complaintsData.pending + complaintsData.ongoing}</h4>
        <div>✅ Resolved: {complaintsData.resolved}</div>
        <div>⚠ Pending: {complaintsData.pending}</div>
        <div>🔄 Ongoing: {complaintsData.ongoing}</div>
      </div>
    </div>
  );
};

export default AdminAnalysis;
