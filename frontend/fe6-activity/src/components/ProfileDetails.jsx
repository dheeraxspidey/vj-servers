import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Stack
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ProfileDetails = ({ onSubmit, onSkip, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    education: initialData.education || [],
    experience: initialData.experience || [],
    skills: initialData.skills || [],
    bio: initialData.bio || '',
    location: initialData.location || '',
    github: initialData.github || '',
    linkedin: initialData.linkedin || ''
  });

  const [newEducation, setNewEducation] = useState({
    school: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
    current: false
  });

  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    current: false
  });

  const [newSkill, setNewSkill] = useState('');
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    setNewEducation({
      school: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      current: false
    });
    setIsEducationDialogOpen(false);
  };

  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
    setNewExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false
    });
    setIsExperienceDialogOpen(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format education data
    const formattedEducation = formData.education.map(edu => ({
      school: edu.school || '',
      degree: edu.degree || '',
      field: edu.field || '',
      start_year: edu.start_year || '',
      end_year: edu.end_year || '',
      current: edu.current || false,
      description: edu.description || ''
    }));

    // Format experience data
    const formattedExperience = formData.experience.map(exp => ({
      company: exp.company || '',
      position: exp.position || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      current: exp.current || false,
      description: exp.description || ''
    }));

    // Create the final formatted data
    const finalData = {
      ...formData,
      education: formattedEducation,
      experience: formattedExperience,
      skills: formData.skills || [],
      bio: formData.bio || '',
      location: formData.location || '',
      github: formData.github || '',
      linkedin: formData.linkedin || ''
    };

    onSubmit(finalData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Profile Details (Optional)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Bio"
            name="bio"
            multiline
            rows={4}
            value={formData.bio}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="GitHub Profile"
            name="github"
            value={formData.github}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="LinkedIn Profile"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
          />
        </Grid>

        {/* Education Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Education
            </Typography>
            {formData.education.map((edu, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveEducation(index)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
                <Typography variant="subtitle2">{edu.school}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {edu.degree} in {edu.field}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {edu.startYear} - {edu.current ? 'Present' : edu.endYear}
                </Typography>
              </Paper>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => setIsEducationDialogOpen(true)}
            >
              Add Education
            </Button>
          </Box>
        </Grid>

        {/* Experience Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Experience
            </Typography>
            {formData.experience.map((exp, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveExperience(index)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
                <Typography variant="subtitle2">{exp.position}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {exp.company}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </Typography>
                <Typography variant="body2">{exp.description}</Typography>
              </Paper>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => setIsExperienceDialogOpen(true)}
            >
              Add Experience
            </Button>
          </Box>
        </Grid>

        {/* Skills Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Skills
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Add Skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button onClick={handleAddSkill}>Add</Button>
            </Stack>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onSkip}>
          Skip for Now
        </Button>
        <Button type="submit" variant="contained">
          Save Profile
        </Button>
      </Box>

      {/* Education Dialog */}
      <Dialog
        open={isEducationDialogOpen}
        onClose={() => setIsEducationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Education</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="School/University"
                value={newEducation.school}
                onChange={(e) => setNewEducation(prev => ({ ...prev, school: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Degree"
                value={newEducation.degree}
                onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Field of Study"
                value={newEducation.field}
                onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Year"
                value={newEducation.startYear}
                onChange={(e) => setNewEducation(prev => ({ ...prev, startYear: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Year"
                value={newEducation.endYear}
                onChange={(e) => setNewEducation(prev => ({ ...prev, endYear: e.target.value }))}
                disabled={newEducation.current}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEducationDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddEducation} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog
        open={isExperienceDialogOpen}
        onClose={() => setIsExperienceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Experience</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company"
                value={newExperience.company}
                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position"
                value={newExperience.position}
                onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={newExperience.startDate}
                onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={newExperience.endDate}
                onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                disabled={newExperience.current}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newExperience.description}
                onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsExperienceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddExperience} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileDetails; 