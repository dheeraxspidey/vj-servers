import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-100 flex flex-col">
      <div className="w-full max-w-3xl mx-auto mt-10 p-6 text-center">
       
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
          Welcome, {user?.name || 'User'}!
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          You are now logged in. Manage your lost &amp; found items with ease.
        </p>
      </div>

      <div className="w-full max-w-5xl mx-auto mt-8 px-4">
        
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8">
          
          <div className="bg-white shadow-xl rounded-2xl p-6 w-full md:flex-1 min-h-[40rem]">
            <div className="flex flex-col items-center text-center h-full justify-center">
              
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
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
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Found Something?
              </h2>
              <p className="text-gray-600 mb-4 max-w-sm">
                Be a hero! Report items you've found on campus and help fellow
                students recover their belongings.
              </p>
              <button
                onClick={() => navigate('/dashboard/report-item')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 flex items-center"
              >
                Report Found Items
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 w-full md:flex-1 min-h-[40rem]">
            <div className="flex flex-col items-center text-center h-full justify-center">

              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7l1.664 12.136A2 2 0 006.648 21h10.704a2 2 0 001.984-1.864L21 7m-18 0a2 2 0 012-2h14a2 2 0 012 2m-18 0h18"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Lost Something?
              </h2>
              <p className="text-gray-600 mb-4 max-w-sm">
                Don’t worry! Search our collection of reported items and get reunited
                with your belongings quickly.
              </p>
              <button
                onClick={() => navigate('/dashboard/search-item')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 flex items-center"
              >
                Search Lost Items
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
