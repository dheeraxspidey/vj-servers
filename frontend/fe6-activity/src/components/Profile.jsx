import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import ProfileDetails from './ProfileDetails';

const Profile = ({ open, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://activity.vnrzone.site/ac-be/api/user/profile',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setProfileData(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Format education data
      const formattedEducation = updatedData.education.map(edu => ({
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        start_year: edu.startYear || edu.start_year, // Handle both formats
        end_year: edu.endYear || edu.end_year, // Handle both formats
        current: edu.current || false,
        description: edu.description || ''
      }));

      // Format experience data
      const formattedExperience = updatedData.experience.map(exp => ({
        company: exp.company,
        position: exp.position,
        start_date: exp.startDate || exp.start_date, // Handle both formats
        end_date: exp.endDate || exp.end_date, // Handle both formats
        current: exp.current || false,
        description: exp.description || ''
      }));

      // Create the formatted data object
      const formattedData = {
        ...updatedData,
        education: formattedEducation,
        experience: formattedExperience,
        skills: updatedData.skills || [],
        bio: updatedData.bio || '',
        location: updatedData.location || '',
        github: updatedData.github || '',
        linkedin: updatedData.linkedin || ''
      };

      await axios.post(
        'http://activity.vnrzone.site/ac-be/api/user/profile',
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setProfileData(formattedData);
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  if (isEditing) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Profile
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ProfileDetails
            initialData={profileData}
            onSubmit={handleProfileUpdate}
            onSkip={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Profile
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto',
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '3rem'
            }}
          >
            {profileData?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {profileData?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {profileData?.bio || 'No bio added yet'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
            sx={{ mt: 2 }}
          >
            Edit Profile
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Contact Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Typography>
                {profileData?.location || 'Not specified'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                GitHub
              </Typography>
              <Typography>
                {profileData?.github || 'Not linked'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                LinkedIn
              </Typography>
              <Typography>
                {profileData?.linkedin || 'Not linked'}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Education */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Education
          </Typography>
          {profileData?.education?.length > 0 ? (
            <Stack spacing={2}>
              {profileData.education.map((edu, index) => (
                <Box key={index}>
                  <Typography variant="subtitle1">
                    {edu.school}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {edu.degree} in {edu.field}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {edu.startYear} - {edu.current ? 'Present' : edu.endYear}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">
              No education details added
            </Typography>
          )}
        </Paper>

        {/* Experience */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Experience
          </Typography>
          {profileData?.experience?.length > 0 ? (
            <Stack spacing={2}>
              {profileData.experience.map((exp, index) => (
                <Box key={index}>
                  <Typography variant="subtitle1">
                    {exp.position}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {exp.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </Typography>
                  <Typography variant="body2">
                    {exp.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">
              No experience details added
            </Typography>
          )}
        </Paper>

        {/* Skills */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Skills
          </Typography>
          {profileData?.skills?.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profileData.skills.map((skill, index) => (
                <Chip key={index} label={skill} />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">
              No skills added
            </Typography>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default Profile; 