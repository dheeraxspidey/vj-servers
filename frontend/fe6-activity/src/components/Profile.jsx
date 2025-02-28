import React, { useState, useEffect, useRef } from 'react';
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

const base_url = import.meta.env.VITE_API_BASE_URL;
console.log(base_url);

const Profile = ({ open, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]);

  useEffect(() => {
    if (profileData?.profile_image) {
      const byteCharacters = atob(profileData.profile_image);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const newImageUrl = URL.createObjectURL(blob);
      setImageUrl(newImageUrl);

      return () => URL.revokeObjectURL(newImageUrl);
    } else {
      setImageUrl(null);
    }
  }, [profileData?.profile_image]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${base_url}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.profile_image) {
        setProfileData(response.data);
      } else {
        console.warn("Profile data missing profile_image:", response.data);
        setProfileData({...response.data, profile_image: ''});
      }
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
      const response = await axios.post(
        `${base_url}/api/user/profile`,
        updatedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh profile data after successful update
      await fetchProfileData();
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${base_url}/api/user/profile_image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      if (response.status === 200) {
        // After successful upload, re-fetch profile data.
        fetchProfileData();
      } else {
        setError('Failed to upload image.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image.');
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleProfileIconClick = () => {
    fileInputRef.current.click();
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
          <Box
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto',
              mb: 2,
              position: 'relative',
              cursor: 'pointer',
            }}
            onClick={handleProfileIconClick}
          >
            <Avatar
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: 'primary.main',
              }}
              src={imageUrl}
            >
              {!imageUrl && profileData?.name ? (
                profileData.name.charAt(0).toUpperCase()
              ) : (
                !imageUrl && !profileData?.name ? '+' : null
              )}
            </Avatar>
          </Box>
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
                    {edu.start_year} - {edu.current ? 'Present' : edu.end_year}
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
                    {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
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

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Profile; 