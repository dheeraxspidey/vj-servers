import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Box,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CodeIcon from '@mui/icons-material/Code';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Custom tooltip for the line chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="subtitle2" color="primary">
          {data.contest_name}
        </Typography>
        <Typography variant="body2">
          Date: {new Date(label).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">
          Rating: {data.rating}
        </Typography>
        <Typography variant="body2">
          Rank: #{data.ranking}
        </Typography>
        <Typography variant="body2">
          Time: {Math.floor(data.finish_time / 60)}:{(data.finish_time % 60).toString().padStart(2, '0')}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const LeetCodeStats = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [leetcodeStatus, setLeetcodeStatus] = useState(null);
  const [contestHistory, setContestHistory] = useState([]);

  useEffect(() => {
    fetchLeetCodeData();
  }, [username]);

  const fetchLeetCodeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // First check if user has LeetCode connected
      const statusResponse = await axios.get(
        `http://activity.vnrzone.site/ac-be/api/user/leetcode_status/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setLeetcodeStatus(statusResponse.data);
      
      if (statusResponse.data.has_leetcode) {
        const dataResponse = await axios.get(
          `http://activity.vnrzone.site/ac-be/api/user/${username}/leetcode_history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLeetcodeData(dataResponse.data);
        setContestHistory(dataResponse.data.contest_history || []);
      }
    } catch (error) {
      console.error('Error fetching LeetCode data:', error);
      setError(error.response?.data?.error || 'Error fetching LeetCode data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!leetcodeStatus?.has_leetcode) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            LeetCode Not Connected
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This user hasn't connected their LeetCode account yet.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" gutterBottom>
        LeetCode Statistics for {username}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        LeetCode Username: {leetcodeStatus.leetcode_username}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Overview Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h4">
                      {leetcodeData?.solved_problems || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Problems Solved
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h4">
                      {leetcodeData?.ranking || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Global Ranking
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h4">
                      {leetcodeData?.star_rating || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Star Rating
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contest History Graph */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contest Performance History
              </Typography>
              {contestHistory.length > 0 ? (
                <Box sx={{ height: 400, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={contestHistory}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        domain={['dataMin', 'dataMax']}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        domain={[
                          dataMin => Math.floor((dataMin - 100) / 100) * 100,
                          dataMax => Math.ceil((dataMax + 100) / 100) * 100
                        ]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#4361ee"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#4361ee" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No contest history available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Statistics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle1">
                      Reputation: {leetcodeData?.reputation || 0}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Community reputation points earned
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle1">
                      Contest Count: {contestHistory.length}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Total contests participated
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Container>
  );
};

export default LeetCodeStats; 