import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Container,
  Stack,
  Paper
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ResponsiveCalendar } from '@nivo/calendar';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import Profile from '../components/Profile';
import './Dashboard.css';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const ActivityCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

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
  const [leetcodeHistory, setLeetcodeHistory] = useState([]);
  const [isSetUsernameModalOpen, setIsSetUsernameModalOpen] = useState(false);
  const [newLeetcodeUsername, setNewLeetcodeUsername] = useState('');
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [joinDate, setJoinDate] = useState(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCertifications: 0,
    githubContributions: 0,
    leetcodeSolved: 0
  });
  const [heatmapData, setHeatmapData] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Initial data fetch
  useEffect(() => {
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

    fetchUserData();
  }, [username]);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://activity.vnrzone.site/ac-be/api/activities`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setActivities(response.data);

      // Calculate stats from activities
      const projectCount = response.data.filter(activity => 
        activity.activity_type?.toLowerCase() === 'project' || 
        activity.type?.toLowerCase() === 'project'
      ).length;

      const certificationCount = response.data.filter(activity => 
        activity.activity_type?.toLowerCase() === 'certification' || 
        activity.type?.toLowerCase() === 'certification'
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

  const checkLeetCodeStatus = async () => {
    if (!username) {
      console.error('Cannot check LeetCode status: No username provided');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Checking LeetCode status for user:', username);
      const response = await axios.get(
        `http://activity.vnrzone.site/ac-be/api/user/leetcode_status/${username}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      
      console.log('LeetCode status response:', response.data);
      setLeetcodeStatus(response.data);
      
      if (response.data.has_leetcode) {
        await fetchLeetcodeData();
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
        `http://activity.vnrzone.site/ac-be/api/user/${username}/leetcode_history`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      console.log('LeetCode data response:', response.data);
      setLeetcodeData(response.data);
      
      // Update contest history if available
      if (response.data.contest_history) {
        setLeetcodeHistory(response.data.contest_history);
      }
    } catch (error) {
      console.error('Error fetching LeetCode data:', error.response?.data || error.message);
      handleLeetCodeError(error);
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
        `http://activity.vnrzone.site/ac-be/api/user/${username}/set_leetcode_username`,
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
      await checkLeetCodeStatus();
      alert('LeetCode data updated successfully');
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
    let formattedDate = 'No date';
    let formattedTime = '';
    
    if (activity.date) {
      try {
        const timestamp = activity.date.$date || activity.date;
        const activityDate = new Date(timestamp);
        
        if (!isNaN(activityDate.getTime())) {
          formattedDate = activityDate.toLocaleDateString();
          formattedTime = activityDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }

    return (
      <div className="activity-card" key={activity._id || index}>
        <div className="activity-header">
          <h3>{activity.title}</h3>
          <span className={`status-badge ${activity.status}`}>
            {activity.status}
          </span>
        </div>
        <div className="activity-time">
          {`${formattedDate} ${formattedTime}`}
        </div>
        {activity.leetcode_rating && (
          <div className="activity-rating">
            LeetCode Rating: {activity.leetcode_rating}
          </div>
        )}
        {activity.description && (
          <div className="activity-description">
            {activity.description}
          </div>
        )}
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

        {/* LeetCode Section */}
        <div className="leetcode-section">
          <div className="leetcode-header">
            <div className="leetcode-title">
              <h2>LeetCode Profile</h2>
              {joinDate && (
                <p className="join-date">Member since {new Date(joinDate).toLocaleDateString()}</p>
              )}
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
              <div className="leetcode-stats">
                {leetcodeData ? (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2
                    }}>
                      
                    </Box>
                    <Grid container spacing={3}>
                      {/* Problem Solving Stats */}
                      <Grid item xs={12}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 3
                          }}>
                            <Typography variant="h6">
                              Problem Solving Stats
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={handleSetLeetcodeUsername}
                              startIcon={<CodeIcon />}
                              sx={{ 
                                minWidth: 'auto',
                                py: 0.5
                              }}
                            >
                              Change username
                            </Button>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="primary">
                                {leetcodeData.submission_stats.total}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Total Solved
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="success.main">
                                {leetcodeData.submission_stats.easy}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Easy
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="warning.main">
                                {leetcodeData.submission_stats.medium}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Medium
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="error.main">
                                {leetcodeData.submission_stats.hard}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Hard
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Contest History Graph */}
                      <Grid item xs={12}>
                        <Paper 
                          sx={{ 
                            p: 3, 
                            mb: 3,
                            height: '400px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Typography variant="h6" gutterBottom>
                            Contest Rating History
                          </Typography>
                          {leetcodeData.contest_history && leetcodeData.contest_history.length > 0 ? (
                            <Box sx={{ flex: 1, minHeight: '300px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={leetcodeData.contest_history.map(contest => ({
                                    ...contest,
                                    date: new Date(contest.date * 1000).getTime() // Convert Unix timestamp to milliseconds
                                  }))}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(timestamp) => {
                                      const date = new Date(timestamp);
                                      return date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      });
                                    }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                  />
                                  <YAxis
                                    label={{ 
                                      value: 'Rating', 
                                      angle: -90, 
                                      position: 'insideLeft',
                                      style: { textAnchor: 'middle' }
                                    }}
                                  />
                                  <Tooltip content={CustomTooltip} />
                                  <Line
                                    type="monotone"
                                    dataKey="rating"
                                    stroke="#4361ee"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#4361ee' }}
                                    activeDot={{ r: 6 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </Box>
                          ) : (
                            <Box sx={{ 
                              flex: 1, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <Typography variant="body2" color="text.secondary">
                                No contest history available
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <CircularProgress />
                )}
              </div>
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

        {/* Recent Activities */}
        <div className="activities-section">
          <h2>Recent Activities</h2>
          <div className="activities-list">
            {activities.map((activity, index) => renderActivity(activity, index))}
          </div>
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

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 