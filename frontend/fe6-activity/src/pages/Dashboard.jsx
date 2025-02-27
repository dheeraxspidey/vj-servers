import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Grid,
  Card,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  MenuItem,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import AddActivity from '../components/AddActivity';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import GitHubIcon from '@mui/icons-material/GitHub';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ResponsiveCalendar } from '@nivo/calendar';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import Profile from '../components/Profile';
import './Dashboard.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactTypingEffect from 'react-typing-effect';

const base_url = import.meta.env.VITE_API_BASE_URL;

const LEETCODE_CACHE_KEY = 'leetcode_data_cache';
const LEETCODE_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Custom tooltip for the line chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ 
        p: 2, 
        backgroundColor: 'background.paper',
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle2" color="primary">
          {data.contest_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(label).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Typography>
        <Typography variant="body2">
          Rating: <strong>{data.rating}</strong>
        </Typography>
        <Typography variant="body2">
          Rank: <strong>#{data.ranking}</strong>
        </Typography>
      </Paper>
    );
  }
  return null;
};

const Dashboard = ({ logout }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return JSON.parse(storedUser) || {};
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  });
  const username = userData?.username;
  const [leetcodeStatus, setLeetcodeStatus] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [isSetUsernameModalOpen, setIsSetUsernameModalOpen] = useState(false);
  const [newLeetcodeUsername, setNewLeetcodeUsername] = useState('');
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCertifications: 0,
    githubContributions: 0,
    leetcodeSolved: 0
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const [editingActivity, setEditingActivity] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    status: 'ongoing',
    leetcode_rating: 0,
    skills: []
  });
  const [dailyActivities, setDailyActivities] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loadingDailyActivities, setLoadingDailyActivities] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Validate username
      if (!username) {
        console.error('No username found in user data');
        setError('User data is incomplete. Please try logging in again.');
        return;
      }

      console.log('Fetching data for username:', username);
      await fetchActivities();
      await checkLeetCodeStatus();
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${base_url}/api/activities`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setActivities(response.data);

      // Calculate stats from activities
      const projectCount = response.data.filter(activity => 
        activity.activity_type?.toLowerCase() === 'project' 
      ).length;

      const certificationCount = response.data.filter(activity => 
        activity.activity_type?.toLowerCase() === 'certification' 
      ).length;

      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalProjects: projectCount,
        totalCertifications: certificationCount,
        // Keep other stats if they exist
        githubContributions: prevStats.githubContributions || 0,
        leetcodeSolved: prevStats.leetcodeSolved || 0
      }));

    } catch (error) {
      console.error("Error fetching activities:", error);
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const getLeetCodeFromCache = () => {
    const cachedData = localStorage.getItem(LEETCODE_CACHE_KEY);
    if (!cachedData) return null;

    try {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
      
      // Check if cache has expired (24 hours)
      if (now - timestamp > LEETCODE_CACHE_EXPIRY) {
        localStorage.removeItem(LEETCODE_CACHE_KEY);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error parsing cached LeetCode data:', error);
      localStorage.removeItem(LEETCODE_CACHE_KEY);
      return null;
    }
  };

  const saveLeetCodeToCache = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(LEETCODE_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching LeetCode data:', error);
    }
  };

  const checkLeetCodeStatus = async () => {
    if (!username) {
      console.error('Cannot check LeetCode status: No username provided');
      return;
    }
    
    try {
      // First check cache
      const cachedData = getLeetCodeFromCache();
      if (cachedData) {
        console.log('Using cached LeetCode data');
        setLeetcodeStatus(cachedData.status);
        setLeetcodeData(cachedData.data);
        return;
      }

      const token = localStorage.getItem('token');
      console.log('Checking LeetCode status for user:', username);
      const response = await axios.get(
        `${base_url}/api/user/leetcode_status/${username}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      
      console.log('LeetCode status response:', response.data);
      setLeetcodeStatus(response.data);
      
      if (response.data.has_leetcode) {
        const leetcodeData = await fetchLeetcodeData();
        // Cache both status and data
        saveLeetCodeToCache({
          status: response.data,
          data: leetcodeData
        });
      } else {
        console.log('User does not have LeetCode username set');
      }
    } catch (error) {
      console.error('Error checking LeetCode status:', error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.response?.data?.error || 'Error checking LeetCode status');
        setLeetcodeStatus({ has_leetcode: false });
      }
    }
  };

  const fetchLeetcodeData = async () => {
    if (!username) {
      console.error('Cannot fetch LeetCode data: No username provided');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Fetching LeetCode data for user:', username);
      const response = await axios.get(
        `${base_url}/api/user/${username}/leetcode_history`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      console.log('LeetCode data response:', response.data);
      setLeetcodeData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching LeetCode data:', error.response?.data || error.message);
      handleLeetCodeError(error);
      return null;
    }
  };

  const handleLeetCodeError = (error) => {
    if (error.code === 'ERR_NETWORK') {
      setError('Network error. Please check your connection.');
    } else if (error.response?.status === 400 && error.response?.data?.needs_setup) {
      setLeetcodeStatus(prev => ({ ...prev, has_leetcode: false }));
    } else {
      setError(error.response?.data?.error || 'Error fetching LeetCode data');
    }
  };

  const handleSetLeetcodeUsername = async () => {
    setIsSetUsernameModalOpen(true);
  };

  const handleCloseSetUsernameModal = () => {
    setIsSetUsernameModalOpen(false);
    setNewLeetcodeUsername('');
    setError('');
  };

  const handleSaveLeetcodeUsername = async () => {
    if (!username || !newLeetcodeUsername.trim()) {
      setError('Please enter a valid LeetCode username');
      return;
    }

    setIsSettingUsername(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${base_url}/api/user/${username}/set_leetcode_username`,
        { leetcode_username: newLeetcodeUsername },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      handleCloseSetUsernameModal();
      await checkLeetCodeStatus();
    } catch (error) {
      console.error('Error setting LeetCode username:', error);
      if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.response?.data?.error || 'Error setting LeetCode username');
      }
    } finally {
      setIsSettingUsername(false);
    }
  };

  const handleUpdateLeetCodeData = async () => {
    if (!username) return;

    setLoading(true);
    setError(null);
    try {
      // Force refresh by removing cache
      localStorage.removeItem(LEETCODE_CACHE_KEY);
      await checkLeetCodeStatus();
      setSnackbarMessage('LeetCode data updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating LeetCode data:', error);
      setError('Error updating LeetCode data');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLeetCodeStats = () => {
    navigate(`/user/${username}/leetcode`);
  };

  const renderActivity = (activity, index) => {
    const date = activity.date ? new Date(activity.date) : new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <div className="activity-card" key={activity._id || index}>
        <div className="activity-header" style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <h3>{activity.title}</h3>
            <span className={`status-badge ${activity.status}`}>
              {activity.status}
            </span>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEditActivity(activity.activity_id);
              }}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  color: 'primary.main'
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteActivity(activity.activity_id);
              }}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  color: 'error.main'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </div>
        <div className="activity-content">
          <p>{activity.description}</p>
          <div className="activity-meta">
            <span className="activity-date">{formattedDate}</span>
            {activity.leetcode_rating && (
              <span className="activity-rating">
                Rating: {activity.leetcode_rating}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleAddActivity = async (newActivity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${base_url}/api/add_activity`,
        newActivity,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivities(prev => [response.data.activity, ...prev]);
    } catch (error) {
      console.error('Error adding activity:', error);
      setError('Failed to add activity');
    }
  };

  const handleEditActivity = (activityId) => {
    const activity = activities.find(a => a.activity_id === activityId);
    if (!activity) {
      setError('Activity not found');
      return;
    }
    
    setEditingActivity(activity);
    setEditFormData({
      title: activity.title,
      description: activity.description,
      status: activity.status,
      leetcode_rating: activity.leetcode_rating || 0,
      skills: activity.skills || []
    });
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${base_url}/api/activities/${activityId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivities(prev => prev.filter(activity => activity.activity_id !== activityId));
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity');
    }
  };

  const fetchDailyActivities = async () => {
    setLoadingDailyActivities(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${base_url}/api/daily_activities`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setDailyActivities(response.data);
    } catch (error) {
      console.error("Error fetching daily activities:", error);
      setError('Failed to fetch daily activities');
    } finally {
      setLoadingDailyActivities(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchUserData();
      await fetchActivities();
      await fetchDailyActivities();
    };
    
    initializeData();
  }, []);

  const handleDeleteDailyActivity = async (dailyActivityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${base_url}/api/daily_activities/${dailyActivityId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDailyActivities(prev => prev.filter(activity => activity.daily_activity_id !== dailyActivityId));
    } catch (error) {
      console.error('Error deleting daily activity:', error);
      setError('Failed to delete daily activity');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderDailyActivity = (activity, index) => {
    const date = activity.date ? new Date(activity.date) : new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <div className="activity-card" key={activity.daily_activity_id || index}>
        <div className="activity-header" style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <h3>{activity.title}</h3>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteDailyActivity(activity.daily_activity_id);
              }}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  color: 'error.main'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </div>
        <div className="activity-content">
          <p>{activity.description}</p>
          <div className="activity-meta">
            <span className="activity-date">{formattedDate}</span>
            {activity.skills && activity.skills.length > 0 && (
              <div className="activity-skills">
                {activity.skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton
            color="primary"
            onClick={() => setIsProfileOpen(true)}
            sx={{ 
              width: 40, 
              height: 40,
              '&:hover': {
                backgroundColor: 'rgba(67, 97, 238, 0.1)'
              }
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 32 }} />
          </IconButton>
          <Button 
            variant="contained" 
            color="error" 
            onClick={logout}
          >
            Logout
          </Button>
        </Box>
      </div>
      
      {/* Profile Dialog */}
      <Profile
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      
      <div className="dashboard-container">
        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon projects">
              <WorkIcon />
            </div>
            <div className="stat-info">
              <h2>{stats.totalProjects}</h2>
              <p>Projects</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon certs">
              <SchoolIcon />
            </div>
            <div className="stat-info">
              <h2>{stats.totalCertifications}</h2>
              <p>Certifications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon github">
              <GitHubIcon />
            </div>
            <div className="stat-info">
              <h2>{stats.githubContributions}</h2>
              <p>GitHub Contributions</p>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            background: 'linear-gradient(135deg, #006989 0%, #4B89AC 100%)',
            borderRadius: 2,
            color: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
              pointerEvents: 'none'
            }
          }}
        >
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Welcome, {userData?.name || 'Developer'}! 👋
          </Typography>
          <Box sx={{ height: '60px', display: 'flex', alignItems: 'center' }}>
            <ReactTypingEffect
              text={[
                "Track your achievements and build the perfect resume",
                "Showcase your LeetCode progress and skills",
                "Document your journey to success"
              ]}
              speed={50}
              eraseSpeed={50}
              typingDelay={1000}
              eraseDelay={2000}
              cursorRenderer={cursor => (
                <span style={{ color: '#ffa116' }}>{cursor}</span>
              )}
              displayTextRenderer={(text) => (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1.1rem'
                  }}
                >
                  {text}
                </Typography>
              )}
            />
          </Box>
        </Box>

        {/* LeetCode Section */}
        <div className="leetcode-section">
          <div className="leetcode-header">
            <div className="leetcode-title">
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">LeetCode Stats</Typography>
                  <IconButton
                    size="small"
                    onClick={handleSetLeetcodeUsername}
                    sx={{
                      padding: '4px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <EditIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
                  </IconButton>
                </Box>
                {leetcodeStatus?.has_leetcode && (
                  <IconButton
                    size="small"
                    onClick={handleUpdateLeetCodeData}
                    sx={{
                      padding: '8px',
                      color: '#ffa116',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 161, 22, 0.04)'
                      }
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: '20px' }} />
                  </IconButton>
                )}
              </Box>
            </div>
          </div>
          
          <div className="leetcode-content">
            {error ? (
              <Typography color="error" gutterBottom>
                {error}
                <Button 
                  onClick={() => {
                    setError(null);
                    checkLeetCodeStatus();
                  }}
                  sx={{ ml: 2 }}
                >
                  Retry
                </Button>
              </Typography>
            ) : loading ? (
              <CircularProgress />
            ) : !leetcodeStatus?.has_leetcode ? (
              <div className="leetcode-setup">
                <Typography variant="body1" gutterBottom>
                  You haven't connected your LeetCode account yet. Connect it to track your progress.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleSetLeetcodeUsername}
                  startIcon={<CodeIcon />}
                >
                  Set LeetCode Username
                </Button>
              </div>
            ) : (
              <Grid container spacing={3}>
                {/* Problem Solving Stats Card */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: { xs: 2, sm: 3 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center', 
                      gap: 2, 
                      mb: 3 
                    }}>
                      <Box sx={{ 
                        width: { xs: '160px', sm: '200px' },
                        height: { xs: '160px', sm: '200px' },
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Box sx={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            border: '20px solid #f3f3f3',
                            borderRadius: '50%'
                          }
                        }}>
                          <Box sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            border: '20px solid',
                            borderColor: (theme) => `${theme.palette.primary.main} transparent transparent transparent`,
                            borderRadius: '50%',
                            transform: 'rotate(-45deg)',
                            animation: 'rotate 1s linear'
                          }} />
                          <Typography variant="h4" sx={{ 
                            fontWeight: 'bold', 
                            zIndex: 1,
                            fontSize: { 
                              xs: '1.2rem',  // Smaller font size on mobile
                              sm: '2rem'     // Regular size on larger screens
                            }
                          }}>
                            {leetcodeData?.submission_stats?.total || '258'}/3466
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            position: 'absolute',
                            bottom: '25%',
                            zIndex: 1,
                            fontSize: {
                              xs: '0.75rem',  // Smaller font size on mobile
                              sm: '0.875rem'  // Regular size on larger screens
                            }
                          }}>
                            Solved
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, width: '100%' }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <span>Easy</span>
                            <span style={{ color: '#00b8a3' }}>{leetcodeData?.submission_stats?.easy || '118'}/861</span>
                          </Typography>
                          <Box sx={{ 
                            width: '100%',
                            height: '8px',
                            bgcolor: '#f3f3f3',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: '40%',
                              height: '100%',
                              bgcolor: '#00b8a3',
                              borderRadius: '4px'
                            }} />
                          </Box>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <span>Med</span>
                            <span style={{ color: '#ffc01e' }}>{leetcodeData?.submission_stats?.medium || '128'}/1801</span>
                          </Typography>
                          <Box sx={{ 
                            width: '100%',
                            height: '8px',
                            bgcolor: '#f3f3f3',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: '35%',
                              height: '100%',
                              bgcolor: '#ffc01e',
                              borderRadius: '4px'
                            }} />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <span>Hard</span>
                            <span style={{ color: '#ff375f' }}>{leetcodeData?.submission_stats?.hard || '12'}/804</span>
                          </Typography>
                          <Box sx={{ 
                            width: '100%',
                            height: '8px',
                            bgcolor: '#f3f3f3',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: '15%',
                              height: '100%',
                              bgcolor: '#ff375f',
                              borderRadius: '4px'
                            }} />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Contest Rating Graph Card */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: { xs: 2, sm: 3 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      gap: { xs: 1, sm: 2 },
                      mb: 2 
                    }}>
                      <Box sx={{ 
                        display: { xs: 'grid', sm: 'block' },
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2,
                        width: '100%'
                      }}>
                        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                          <Typography variant="body2" color="text.secondary">Contest Rating</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2cbe4e' }}>
                            {leetcodeData?.contest_history?.[leetcodeData.contest_history.length - 1]?.rating || '1,651'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                          <Typography variant="body2" color="text.secondary">Attended</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {leetcodeData?.contest_history?.length || '43'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                          <Typography variant="body2" color="text.secondary">Top %</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            17.02%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      minHeight: { xs: 250, sm: 200 },
                      mt: { xs: 2, sm: 0 }
                    }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={leetcodeData?.contest_history?.map(contest => ({
                            ...contest,
                            date: new Date(contest.date * 1000).getTime()
                          })) || []}
                          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="date"
                            type="number"
                            scale="time"
                            domain={['auto', 'auto']}
                            tickFormatter={(timestamp) => {
                              const date = new Date(timestamp);
                              return date.toLocaleDateString('en-US', {
                                year: 'numeric'
                              });
                            }}
                            stroke="#999"
                          />
                          <YAxis stroke="#999" />
                          <Tooltip content={CustomTooltip} />
                          <Line
                            type="monotone"
                            dataKey="rating"
                            stroke="#ffa116"
                            strokeWidth={2}
                            dot={{ r: 0 }}
                            activeDot={{ r: 6, fill: '#ffa116' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card" onClick={() => navigate('/resume-builder')}>
            <h3>Resume Builder</h3>
            <p>Create a professional resume using your profile and activities</p>
            <button>Create Resume</button>
          </div>
          <div className="action-card" onClick={() => setIsAddActivityOpen(true)}>
            <h3>Track Progress</h3>
            <p>Log your achievements, projects, and learning progress</p>
            <button>Log New Activity</button>
          </div>
        </div>

        {/* Activities Tabs Section */}
        <div className="activities-section">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="activity tabs">
              <Tab label="Major Activities" />
              <Tab label="Daily Activities" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            <div className="activities-list">
              {loading ? (
                <CircularProgress />
              ) : activities.length > 0 ? (
                activities.map((activity, index) => renderActivity(activity, index))
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  No activities found
                </Typography>
              )}
            </div>
          ) : (
            <div className="activities-list">
              {loadingDailyActivities ? (
                <CircularProgress />
              ) : dailyActivities.length > 0 ? (
                dailyActivities.map((activity, index) => renderDailyActivity(activity, index))
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  No daily activities found
                </Typography>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <AddActivity 
          open={isAddActivityOpen}
          onClose={() => setIsAddActivityOpen(false)}
          onActivityAdded={fetchActivities}
        />

        <Dialog 
          open={isSetUsernameModalOpen} 
          onClose={handleCloseSetUsernameModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {leetcodeStatus?.has_leetcode ? 'Update LeetCode Username' : 'Set LeetCode Username'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {leetcodeStatus?.has_leetcode 
                ? 'Enter your new LeetCode username to update your connection.'
                : 'Enter your LeetCode username to start tracking your progress.'}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="LeetCode Username"
              type="text"
              fullWidth
              value={newLeetcodeUsername}
              onChange={(e) => setNewLeetcodeUsername(e.target.value)}
              error={!!error}
              helperText={error}
              disabled={isSettingUsername}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseSetUsernameModal} disabled={isSettingUsername}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveLeetcodeUsername} 
              variant="contained"
              disabled={isSettingUsername || !newLeetcodeUsername.trim()}
            >
              {isSettingUsername ? (
                <CircularProgress size={24} />
              ) : leetcodeStatus?.has_leetcode ? (
                'Update Username'
              ) : (
                'Set Username'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {editingActivity && (
          <Dialog
            open={!!editingActivity}
            onClose={() => setEditingActivity(null)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                fullWidth
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
              />
              <TextField
                select
                margin="dense"
                label="Status"
                fullWidth
                value={editFormData.status}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  status: e.target.value
                }))}
              >
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingActivity(null)}>Cancel</Button>
              <Button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await axios.put(
                      `${base_url}/api/activities/${editingActivity.activity_id}`,
                      editFormData,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    setActivities(prev => 
                      prev.map(activity => 
                        activity.activity_id === editingActivity.activity_id 
                          ? { ...activity, ...editFormData }
                          : activity
                      )
                    );
                    setEditingActivity(null);
                  } catch (error) {
                    console.error('Error updating activity:', error);
                    setError('Failed to update activity');
                  }
                }}
                variant="contained"
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

export default Dashboard; 