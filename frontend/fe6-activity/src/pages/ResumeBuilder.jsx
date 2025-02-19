import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import html2pdf from 'html2pdf.js';
import { templates, getTemplateById } from '../components/templates';
import ResumePreview from '../components/ResumePreview';

const steps = ['Select Template', 'Choose Type', 'Select Activities', 'Preview'];

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [resumeType, setResumeType] = useState('general');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchActivities();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:6030/api/user/profile',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:6030/api/activities',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      generateResume();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const generateResume = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:6030/api/resume/generate',
        {
          template: selectedTemplate,
          type: resumeType,
          job_title: jobTitle,
          selected_activities: selectedActivities
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Resume generation response:', response.data);

      if (response.data.generated_content) {
        setGeneratedContent(response.data.generated_content);
        
        // Set the PDF URL using the resume_id
        if (response.data.resume_id) {
          const pdfUrl = `/api/resume/${response.data.resume_id}/download`;
          console.log('Setting PDF URL:', pdfUrl);
          setPdfUrl(pdfUrl);
          setActiveStep(3); // Move to preview step
        } else {
          console.error('No resume_id received');
          setError('Failed to get resume ID');
        }
      } else {
        setError('Failed to generate resume content');
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      if (error.response?.data?.error) {
        setError(`Failed to generate resume: ${error.response.data.error}`);
      } else {
        setError('Failed to generate resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const element = document.getElementById('resume-preview');
      if (!element) {
        setError('Resume preview not found');
        return;
      }

      // Enhanced PDF options for better quality
      const opt = {
        margin: [0.5, 0.5],
        filename: `resume_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 3,
          useCORS: true,
          logging: true,
          letterRendering: true,
          windowWidth: 1200
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait',
          compress: true,
          precision: 3
        }
      };

      // Create a clone of the element to avoid modifying the original
      const clonedElement = element.cloneNode(true);
      
      // Apply print-specific styles
      clonedElement.style.width = '8.5in';
      clonedElement.style.padding = '0.5in';
      clonedElement.style.backgroundColor = 'white';
      
      // Create temporary container
      const container = document.createElement('div');
      container.appendChild(clonedElement);
      document.body.appendChild(container);

      try {
        await html2pdf().set(opt).from(clonedElement).save();
        setError('');
      } finally {
        // Clean up
        document.body.removeChild(container);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return !!selectedTemplate;
      case 1:
        return resumeType === 'general' || (resumeType === 'specific' && jobTitle.trim());
      case 2:
        return selectedActivities.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={4} key={template.id}>
                <Paper
                  elevation={selectedTemplate === template.id ? 8 : 3}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: selectedTemplate === template.id ? '2px solid primary.main' : 'none',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <Typography variant="h6" gutterBottom>{template.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Resume Type</InputLabel>
              <Select
                value={resumeType}
                onChange={(e) => setResumeType(e.target.value)}
                label="Resume Type"
              >
                <MenuItem value="general">General Resume</MenuItem>
                <MenuItem value="specific">Job Specific</MenuItem>
              </Select>
            </FormControl>
            
            {resumeType === 'specific' && (
              <TextField
                fullWidth
                label="Job Title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                sx={{ mb: 3 }}
              />
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <FormControl fullWidth>
              <InputLabel>Select Activities</InputLabel>
              <Select
                multiple
                value={selectedActivities}
                onChange={(e) => setSelectedActivities(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={activities.find(a => a.title === value)?.title || value} />
                    ))}
                  </Box>
                )}
              >
                {activities.map((activity) => (
                  <MenuItem key={activity.title} value={activity.title}>
                    {activity.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {generatedContent && (
                  <>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      
                    </Box>
                    {(() => {
                      try {
                        const resumeData = JSON.parse(generatedContent);
                        const SelectedTemplate = getTemplateById(selectedTemplate);
                        return SelectedTemplate ? (
                          <SelectedTemplate resumeData={resumeData} />
                        ) : (
                          <Alert severity="error">Template not found</Alert>
                        );
                      } catch (error) {
                        return (
                          <Alert severity="error">
                            Error parsing resume data. Please try generating again.
                          </Alert>
                        );
                      }
                    })()}
                  </>
                )}
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Resume Builder
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {renderStepContent(activeStep)}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Back to Dashboard
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
          disabled={activeStep === 0}
          onClick={handleBack}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
            disabled={loading || !isStepValid()}
            sx={{
              minWidth: '120px',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3
              },
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              'Generate Resume'
            ) : (
              'Next'
            )}
          </Button>
          {generatedContent && !loading && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPDF}
              sx={{
                minWidth: '160px',
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                },
                transition: 'all 0.2s'
              }}
            >
              Download PDF
        </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ResumeBuilder; 