import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Search, AlertCircle, Home, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-blue-600">EasyFind</h1>
      {user && (
        <div className="relative">
          {isMobile ? (
            <button 
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={24} />
            </button>
          ) : (
            <nav className="flex gap-4">
              <button 
                onClick={() => navigate('/dashboard/home')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <Home size={18} /> Home
              </button>

              <button 
                onClick={() => navigate('/dashboard/report-item')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <AlertCircle size={18} /> Report Item
              </button>

              <button 
                onClick={() => navigate('/dashboard/lost-item')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <Bell size={18} /> Lost Item?
              </button>

              <button 
                onClick={() => navigate('/dashboard/search-item')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <Search size={18} /> Search Item
              </button>

              <button 
                onClick={() => navigate('/dashboard/user-profile')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <User size={18} /> User Profile
              </button>

              <button 
                onClick={logout} 
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </nav>
          )}
          {menuOpen && isMobile && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-2">
              <button 
                onClick={() => navigate('/dashboard/home')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <Home size={18} /> Home
              </button>
              <button 
                onClick={() => navigate('/dashboard/report-item')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <AlertCircle size={18} /> Report Item
              </button>

              <button 
                onClick={() => navigate('/dashboard/lost-item')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <Bell size={18} /> Lost Item?
              </button>

              <button 
                onClick={() => navigate('/dashboard/search-item')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <Search size={18} /> Search Item
              </button>
              <button 
                onClick={() => navigate('/dashboard/user-profile')} 
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
              >
                <User size={18} /> User Profile
              </button>
              <button 
                onClick={logout} 
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
