import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

const activityTypes = [
  'Project',
  'LeetCode Update',
  'Internship',
  'Hackathon',
  'Certification',
  'Course',
  'Workshop',
  'Achievement',
  'Other'
];

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Flask',
  'MongoDB', 'SQL', 'AWS', 'Docker', 'Git',
  'Machine Learning', 'Data Analysis', 'UI/UX',
  'Project Management', 'Agile', 'Java', 'C++',
  'TypeScript', 'Angular', 'Vue.js', 'Django',
  'Express.js', 'PostgreSQL', 'Redis', 'GraphQL',
  'REST API', 'CI/CD', 'Kubernetes', 'System Design',
  'Data Structures', 'Algorithms', 'Cloud Computing',
  'DevOps', 'Testing', 'Microservices'
];

// Activity types that should show the skills field
const SKILL_BASED_ACTIVITIES = ['Project', 'Internship', 'Certification'];

const AddActivity = ({ open, onClose, onActivityAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    status: 'ongoing',
    skills: [] // Add skills array to form data
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillsChange = (event, newValue) => {
    setFormData({
      ...formData,
      skills: newValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://activity.vnrzone.site/ac-be/api/add_activity`,
        {
          title: formData.title,
          activity_type: formData.type,
          description: formData.description,
          status: formData.status,
          skills: formData.skills // Include skills in the request
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        console.log("Activity added successfully (status 201), calling onActivityAdded");
        onActivityAdded(); // Refresh activities list
        onClose();
        setFormData({ // Reset form
          title: '',
          type: '',
          description: '',
          status: 'ongoing',
          skills: []
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Activity</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Box sx={{ color: 'error.main', mb: 2 }}>
              {error}
            </Box>
          )}
          
          <TextField
            fullWidth
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              label="Type"
            >
              {activityTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            margin="normal"
          />

          {SKILL_BASED_ACTIVITIES.includes(formData.type) && (
            <Autocomplete
              multiple
              options={COMMON_SKILLS}
              value={formData.skills}
              onChange={handleSkillsChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skills"
                  placeholder="Add relevant skills"
                  margin="normal"
                />
              )}
              freeSolo
              sx={{ mt: 2 }}
            />
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="planned">Planned</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Activity'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddActivity; 