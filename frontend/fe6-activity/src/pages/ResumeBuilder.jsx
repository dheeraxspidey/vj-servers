import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
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
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
  FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { templates, getTemplateById } from '../components/templates';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Container,
  ContentWrapper,
  Title,
  StyledStepper,
  ContentPaper,
  ButtonContainer,
  NavigationButtons,
  StyledButton,
  ActionButton,
  ResumePreviewContainer,
  PreviewPaper,
  EditContainer,
  SectionPaper,
  ItemBox,
  StyledSelect,
  ActivityChip,
  ActivityMenuItem,
  ActivityCard
} from './ResumeBuilder.styles';
const base_url = import.meta.env.VITE_API_BASE_URL;

const steps = ['Select Template', 'Select Resume Type', 'Select Activities', 'Preview & Edit'];

// Rich text editor styles
const styleMap = {
  'BOLD': { fontWeight: 'bold' },
  'ITALIC': { fontStyle: 'italic' },
  'UNDERLINE': { textDecoration: 'underline' },
};

// Initial resume sections
const initialSections = [
  { id: 'personal', title: 'Personal Information', content: EditorState.createEmpty(), bullets: [] },
  { id: 'experience', title: 'Work Experience', content: EditorState.createEmpty(), bullets: [] },
  { id: 'education', title: 'Education', content: EditorState.createEmpty(), bullets: [] },
  { id: 'skills', title: 'Skills', content: EditorState.createEmpty(), bullets: [] },
];

// Add initial basics state
const initialBasics = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  profiles: []
};

// Add initial education and experience states
const initialEducation = [];
const initialExperience = [];

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const componentRef = useRef(null);
  const { control, handleSubmit, setValue, watch } = useForm();
  
  // States
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [resumeType, setResumeType] = useState('general');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sections, setSections] = useState(initialSections);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [basics, setBasics] = useState(initialBasics);
  const [education, setEducation] = useState(initialEducation);
  const [experience, setExperience] = useState(initialExperience);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([
    'contact',
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'custom',
  ]);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [expandedSection, setExpandedSection] = useState('personal');
  const [predefinedJobTitles] = useState([
    'Software Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Full Stack Developer',
    'Backend Developer',
    'Frontend Developer',
    'DevOps Engineer',
    'Cloud Solutions Engineer',
    'Systems Engineer',
    'Research Engineer',
    'AI Engineer',
    'Mobile App Developer',
    'Embedded Systems Engineer',
    'Quality Assurance Engineer',
    'Database Engineer',
    'Network Engineer',
    'Security Engineer',
    'Product Manager',
    'UX/UI Designer',
    'Technical Analyst',
    'Robotics Engineer',
    'IoT Developer',
    'Blockchain Developer',
    'Computer Vision Engineer'
  ]);

  useEffect(() => {
    fetchUserData();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (userData) {
      setBasics({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        summary: userData.bio || resumeData?.basics?.summary || '',
        profiles: {
          linkedin: userData.linkedin || '',
          github: userData.github || ''
        }
      });
      setEducation(userData.education || []);
      setExperience(userData.experience || []);
      
      // Format skills as array of strings
      const formattedSkills = Array.isArray(userData.skills) 
        ? userData.skills.map(skill => typeof skill === 'string' ? skill : skill.name || skill.title || '')
        : [];
      
      // Format projects with required structure
      const formattedProjects = Array.isArray(userData.projects)
        ? userData.projects.map(project => ({
            title: project.title || project.name || '',
            description: project.description || '',
            skills: Array.isArray(project.skills) 
              ? project.skills.map(skill => typeof skill === 'string' ? skill : skill.name || skill.title || '')
              : []
          }))
        : [];
        
        // Update state with formatted data
        setSkills(formattedSkills);
        setProjects(formattedProjects);
    }
  }, [userData, resumeData]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${base_url}/api/user/profile`,
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
        `${base_url}/api/activities`,
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

  // Add these new functions for moving items up/down
  const moveItem = (array, index, direction) => {
    if (direction === 'up' && index > 0) {
      const newArray = [...array];
      [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
      return newArray;
    }
    if (direction === 'down' && index < array.length - 1) {
      const newArray = [...array];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      return newArray;
    }
    return array;
  };

  const moveEducation = (index, direction) => {
    const newEducation = moveItem(education, index, direction);
    setEducation(newEducation);
    updateResumeData({ education: newEducation });
  };

  const moveExperience = (index, direction) => {
    const newExperience = moveItem(experience, index, direction);
    setExperience(newExperience);
    updateResumeData({ experience: newExperience });
  };

  const moveProject = (index, direction) => {
    const newProjects = moveItem(projects, index, direction);
    setProjects(newProjects);
    updateResumeData({ projects: newProjects });
  };

  const moveCustomSection = (index, direction) => {
    const customSections = sections.filter(section => 
      !['personal', 'experience', 'education', 'skills'].includes(section.id)
    );
    const newCustomSections = moveItem(customSections, index, direction);
    const updatedSections = [
      ...sections.filter(section => 
        ['personal', 'experience', 'education', 'skills'].includes(section.id)
      ),
      ...newCustomSections
    ];
    setSections(updatedSections);
    updateResumeData({ sections: updatedSections });
  };

  // Helper function to update resume data
  const updateResumeData = (updates) => {
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        ...updates
      };
      setResumeData(updatedResumeData);
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderArray = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    // Handle reordering within the same list
    if (result.source.droppableId === result.destination.droppableId) {
      switch (result.source.droppableId) {
        case 'education':
          const reorderedEducation = reorderArray(
            education,
            result.source.index,
            result.destination.index
          );
          setEducation(reorderedEducation);
          break;
        case 'experience':
          const reorderedExperience = reorderArray(
            experience,
            result.source.index,
            result.destination.index
          );
          setExperience(reorderedExperience);
          break;
        case 'projects':
          const reorderedProjects = reorderArray(
            projects,
            result.source.index,
            result.destination.index
          );
          setProjects(reorderedProjects);
          break;
        case 'custom-sections':
          const filteredSections = sections.filter(section => 
            !['personal', 'experience', 'education', 'skills'].includes(section.id)
          );
          const reorderedSections = reorderArray(
            filteredSections,
            result.source.index,
            result.destination.index
          );
          const updatedSections = sections.filter(section => 
            ['personal', 'experience', 'education', 'skills'].includes(section.id)
          ).concat(reorderedSections);
          setSections(updatedSections);
          break;
      }

      // Update resume data after reordering
      if (resumeData) {
        const updatedResumeData = {
          ...resumeData,
          basics: basics,
          education: education,
          experience: experience,
          projects: projects,
          sections: sections
        };
        setResumeData(updatedResumeData);
      }
    }
  };

  // Rich text editor handlers
  const handleEditorChange = (editorState, sectionId) => {
    const newSections = sections.map(section => 
      section.id === sectionId ? { ...section, content: editorState } : section
    );
    setSections(newSections);
  };

  const handleKeyCommand = (command, editorState, sectionId) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState, sectionId);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style, sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newState = RichUtils.toggleInlineStyle(section.content, style);
      handleEditorChange(newState, sectionId);
    }
  };

  // Section management
  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      content: EditorState.createEmpty(),
      bullets: ['']
    };
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    
    // Update resume data to include the new section
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  const removeSection = (sectionId) => {
    const updatedSections = sections.filter(section => section.id !== sectionId);
    setSections(updatedSections);
    
    // Update resume data to reflect removed section
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  const updateSectionTitle = (sectionId, newTitle) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, title: newTitle } : section
    );
    setSections(updatedSections);
    
    // Update resume data with new section title
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  // Update bullet point functions to also update resumeData
  const addBulletPoint = (sectionId) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, bullets: [...section.bullets, ''] }
        : section
    );
    setSections(updatedSections);
    
    // Update resume data with new bullet point
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  const updateBulletPoint = (sectionId, bulletIndex, value) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            bullets: section.bullets.map((bullet, idx) =>
              idx === bulletIndex ? value : bullet
            )
          }
        : section
    );
    setSections(updatedSections);
    
    // Update resume data with updated bullet point
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  const removeBulletPoint = (sectionId, bulletIndex) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            bullets: section.bullets.filter((_, idx) => idx !== bulletIndex)
          }
        : section
    );
    setSections(updatedSections);
    
    // Update resume data with removed bullet point
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  // Generate resume data
  const generateResumeData = () => {
    // Make sure we extract just the titles from selectedActivities
    const selectedActivityTitles = selectedActivities.map(activity => 
      typeof activity === 'object' ? activity.title : activity
    );
    
    // Format education entries with proper period field
    const formattedEducation = education.map(edu => {
      // Keep the original fields but add a period field for display
      return {
        ...edu,
        period: `${edu.start_year || ''} - ${edu.current ? 'Present' : (edu.end_year || '')}`
      };
    });

    // Format experience entries with proper period field
    const formattedExperience = experience.map(exp => {
      // Keep the original fields but add a period field for display
      return {
        ...exp,
        period: `${exp.start_date || ''} - ${exp.current ? 'Present' : (exp.end_date || '')}`
      };
    });
    
    // Format project entries with proper period field
    const formattedProjects = projects.map(project => {
      // Keep the original fields but add a period field for display
      return {
        ...project,
        period: project.start_date || project.end_date ? 
          `${project.start_date || ''} - ${project.current ? 'Present' : (project.end_date || '')}` : 
          ''
      };
    });
    
    return {
      template: selectedTemplate,
      type: resumeType,
      job_title: jobTitle,
      selected_activities: selectedActivityTitles,
      sections: sections.map(section => ({
        id: section.id,
        title: section.title,
        bullets: section.bullets || []
      })),
      basics: {
        ...basics,
        summary: basics.summary || resumeData?.basics?.summary || ''
      },
      education: formattedEducation,
      experience: formattedExperience,
      skills: skills,
      projects: formattedProjects
    };
  };

  const generateResume = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const data = generateResumeData();
      const response = await axios.post(
        `${base_url}/api/resume/generate`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.generated_content) {
        // Parse the generated content
        const generatedResumeData = JSON.parse(response.data.generated_content);
        
        // Preserve the summary if it exists in current basics
        const preservedSummary = basics.summary || resumeData?.basics?.summary;
        
        setResumeData({
          ...generatedResumeData,
          basics: {
            ...generatedResumeData.basics,
            summary: preservedSummary || generatedResumeData.basics?.summary || ''
          }
        });
        
        // Initialize the form with generated data, preserving the summary
        setBasics({
          ...generatedResumeData.basics,
          summary: preservedSummary || generatedResumeData.basics?.summary || ''
        });
        setEducation(generatedResumeData.education || []);
        setExperience(generatedResumeData.experience || []);
        setSkills(generatedResumeData.skills || []);
        setProjects(generatedResumeData.projects || []);
      } else {
        setError('Failed to generate resume content');
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      setError('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add handleRegenerate function
  const handleRegenerate = async () => {
    setLoading(true);
    setError('');
    try {
      await generateResume();
    } catch (error) {
      console.error('Error regenerating resume:', error);
      setError('Failed to regenerate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update the handleDownloadPDF function
  const handleDownloadPDF = () => {
    try {
      setLoading(true);
      setError('');

      // Find the resume preview container
      const resumePreviewContainer = document.getElementById('resume-preview');
      if (!resumePreviewContainer) {
        throw new Error('Resume preview not found');
      }

      // Create a temporary container for the print view
      const printContainer = document.createElement('div');
      printContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px;
      `;

      // Clone the resume preview
      const resumeClone = resumePreviewContainer.cloneNode(true);
      resumeClone.style.cssText = `
        width: 8.5in;
        min-height: 11in;
        padding: 0.3in;
        padding-left: 0.2in;  /* Reduced left padding */
        background: white;
        margin: 0 auto;
        box-shadow: none;
      `;

      // Add the clone to the print container
      printContainer.appendChild(resumeClone);

      // Store original body overflow
      const originalOverflow = document.body.style.overflow;
      
      // Add print container to body
      document.body.appendChild(printContainer);
      document.body.style.overflow = 'hidden'; // Prevent scrolling of main content

      // Print the page
      setTimeout(() => {
        window.print();
        
        // Cleanup after printing
        document.body.removeChild(printContainer);
        document.body.style.overflow = originalOverflow;
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Error preparing resume:', error);
      setError('Failed to prepare resume for printing. Please try again.');
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    if (activeStep === 1 && resumeType === 'specific' && jobTitle) {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.post(
          `${base_url}/api/activities/recommend`,
          { job_title: jobTitle },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (response.data && response.data.recommended_activities) {
          // Update selected activities with AI recommendations
          const recommendedActivityTitles = response.data.recommended_activities;
          
          // Find the actual activity objects that match these titles
          const recommendedActivities = activities.filter(activity => 
            recommendedActivityTitles.includes(activity.title)
          );
          
          // Update the selectedActivities state
          setSelectedActivities(recommendedActivities);
          
          // Now move to the next step
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
      } catch (err) {
        console.error('Error fetching recommended activities:', err);
        setError(err.response?.data?.error || 'Failed to get activity recommendations.');
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 2 && !hasGeneratedOnce) {
      // First time generating after activity selection
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      await generateResume();
      setHasGeneratedOnce(true);
    } else {
      // For other steps, just move forward normally
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Validation
  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return !!selectedTemplate;
      case 1:
        return resumeType === 'general' || (resumeType === 'specific' && jobTitle.trim());
      case 2:
        return selectedActivities.length > 0;
      case 3:
        return sections.length > 0;
      default:
        return true;
    }
  };

  // Add education entry
  const addEducation = () => {
    setEducation([...education, {
      school: '',
      degree: '',
      field: '',
      start_year: '',
      end_year: '',
      current: false,
      description: ''
    }]);
  };

  // Update education entry
  const updateEducation = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEducation(newEducation);
  };

  // Remove education entry
  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Add experience entry
  const addExperience = () => {
    setExperience([...experience, {
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      current: false,
      description: ''
    }]);
  };

  // Update experience entry
  const updateExperience = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setExperience(newExperience);
  };

  // Remove experience entry
  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Add project entry
  const addProject = () => {
    setProjects([...projects, {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      current: false,
      skills: []
    }]);
  };

  // Update project entry
  const updateProject = (index, field, value) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
  };

  // Remove project entry
  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Update project skills
  const updateProjectSkills = (index, skillsString) => {
    const newProjects = [...projects];
    newProjects[index] = { 
      ...newProjects[index], 
      skills: skillsString.split(',').map(skill => skill.trim()).filter(Boolean)
    };
    setProjects(newProjects);
  };

  // Add this new function to handle saving changes
  const handleSaveChanges = () => {
    // Format education entries with proper period field
    const formattedEducation = education.map(edu => {
      const period = `${edu.start_year || ''} - ${edu.current ? 'Present' : (edu.end_year || '')}`;
      return {
        ...edu,
        period: period
      };
    });

    // Format experience entries with proper period field
    const formattedExperience = experience.map(exp => {
      const period = `${exp.start_date || ''} - ${exp.current ? 'Present' : (exp.end_date || '')}`;
      return {
        ...exp,
        period: period
      };
    });
    
    // Format project entries with proper period field
    const formattedProjects = projects.map(project => {
      const period = project.start_date || project.end_date ? 
        `${project.start_date || ''} - ${project.current ? 'Present' : (project.end_date || '')}` : 
        '';
      return {
        ...project,
        period: period
      };
    });
    
    // Create updated resumeData with all current values
    const updatedResumeData = {
      ...resumeData,
      basics,
      education: formattedEducation,
      experience: formattedExperience,
      skills,
      projects: formattedProjects,
      sections,
      sectionOrder
    };
    
    setResumeData(updatedResumeData);
    setIsEditing(false);
  };

  // Update the moveSection function to handle section order in preview
  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setSectionOrder(newOrder);
      
      // Create updated resume data with new section order
      const updatedResumeData = {
        ...resumeData,
        sectionOrder: newOrder,
        basics,
        education,
        experience,
        skills,
        projects,
        sections
      };
      setResumeData(updatedResumeData);
      
      // Force a re-render by updating the preview data
      const previewData = {
        basics: {
          name: basics.name || '',
          email: basics.email || '',
          phone: basics.phone || '',
          location: basics.location || '',
          summary: basics.summary || '',
          profiles: basics.profiles || {}
        },
        education: education || [],
        experience: experience || [],
        skills: skills,
        projects: projects,
        sections: sections.map(section => ({
          ...section,
          bullets: section.bullets
        })),
        sectionOrder: newOrder
      };
      setResumeData(previewData);
    } else if (direction === 'down' && index < sectionOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setSectionOrder(newOrder);
      
      // Create updated resume data with new section order
      const updatedResumeData = {
        ...resumeData,
        sectionOrder: newOrder,
        basics,
        education,
        experience,
        skills,
        projects,
        sections
      };
      setResumeData(updatedResumeData);
      
      // Force a re-render by updating the preview data
      const previewData = {
        basics: {
          name: basics.name || '',
          email: basics.email || '',
          phone: basics.phone || '',
          location: basics.location || '',
          summary: basics.summary || '',
          profiles: basics.profiles || {}
        },
        education: education || [],
        experience: experience || [],
        skills: skills,
        projects: projects,
        sections: sections.map(section => ({
          ...section,
          bullets: section.bullets
        })),
        sectionOrder: newOrder
      };
      setResumeData(previewData);
    }
  };

  // Separate functions for moving items within sections
  const moveEducationItem = (index, direction) => {
    const newEducation = [...education];
    if (direction === 'up' && index > 0) {
      [newEducation[index], newEducation[index - 1]] = [newEducation[index - 1], newEducation[index]];
    } else if (direction === 'down' && index < newEducation.length - 1) {
      [newEducation[index], newEducation[index + 1]] = [newEducation[index + 1], newEducation[index]];
    }
    setEducation(newEducation);
    
    // Update resume data
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        education: newEducation
      };
      setResumeData(updatedResumeData);
    }
  };

  const moveExperienceItem = (index, direction) => {
    const newExperience = [...experience];
    if (direction === 'up' && index > 0) {
      [newExperience[index], newExperience[index - 1]] = [newExperience[index - 1], newExperience[index]];
    } else if (direction === 'down' && index < newExperience.length - 1) {
      [newExperience[index], newExperience[index + 1]] = [newExperience[index + 1], newExperience[index]];
    }
    setExperience(newExperience);
    
    // Update resume data
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        experience: newExperience
      };
      setResumeData(updatedResumeData);
    }
  };

  const moveProjectItem = (index, direction) => {
    const newProjects = [...projects];
    if (direction === 'up' && index > 0) {
      [newProjects[index], newProjects[index - 1]] = [newProjects[index - 1], newProjects[index]];
    } else if (direction === 'down' && index < newProjects.length - 1) {
      [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];
    }
    setProjects(newProjects);
    
    // Update resume data
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        projects: newProjects
      };
      setResumeData(updatedResumeData);
    }
  };

  const moveSkillItem = (index, direction) => {
    const newSkills = [...skills];
    if (direction === 'up' && index > 0) {
      [newSkills[index], newSkills[index - 1]] = [newSkills[index - 1], newSkills[index]];
    } else if (direction === 'down' && index < newSkills.length - 1) {
      [newSkills[index], newSkills[index + 1]] = [newSkills[index + 1], newSkills[index]];
    }
    setSkills(newSkills);
    
    // Update resume data
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        skills: newSkills
      };
      setResumeData(updatedResumeData);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <SectionPaper
                  elevation={selectedTemplate === template.id ? 8 : 3}
                  sx={{
                    border: selectedTemplate === template.id ? '2px solid primary.main' : 'none',
                  }}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </SectionPaper>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Box sx={{ maxWidth: { xs: '100%', sm: 400 }, mx: 'auto', width: '100%' }}>
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
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Job Title</InputLabel>
                <Select
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  label="Job Title"
                >
                  {predefinedJobTitles.map((title) => (
                    <MenuItem key={title} value={title}>
                      {title}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select a job title for your targeted resume</FormHelperText>
              </FormControl>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ width: '100%', p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
              Select Relevant Activities ({selectedActivities.length} selected)
            </Typography>
            
            <Grid container spacing={2}>
              {activities.map((activity) => {
                // Check if this activity is selected by comparing objects or titles
                const isSelected = selectedActivities.some(selectedActivity => 
                  typeof selectedActivity === 'object' 
                    ? selectedActivity.title === activity.title 
                    : selectedActivity === activity.title
                );
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={activity.activity_id || activity.title}>
                    <ActivityCard
                      onClick={() => {
                        setSelectedActivities(prev => {
                          // If selected, remove it
                          if (isSelected) {
                            return prev.filter(a => 
                              typeof a === 'object' 
                                ? a.title !== activity.title 
                                : a !== activity.title
                            );
                          } 
                          // If not selected, add the full activity object
                          return [...prev, activity];
                        });
                      }}
                      selected={isSelected}
                    >
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" noWrap>
                          {activity.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            mt: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {activity.description}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          mt: 2
                        }}>
                          <ActivityChip
                            label="Select"
                            sx={{
                              backgroundColor: isSelected 
                                ? 'rgba(33, 150, 243, 0.1)' 
                                : 'rgba(0, 0, 0, 0.05)',
                              color: isSelected
                                ? 'primary.dark'
                                : 'text.secondary'
                            }}
                          />
                        </Box>
                      </Box>
                    </ActivityCard>
                  </Grid>
                );
              })}
            </Grid>
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
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  {resumeData && (
                    <ActionButton
                      variant="contained"
                      color="primary"
                      onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
                      startIcon={isEditing ? <DownloadIcon /> : <EditIcon />}
                    >
                      {isEditing ? 'Save Changes' : 'Edit Resume'}
                    </ActionButton>
                  )}
                </Box>

                <Box className="resume-preview">
                  <ResumePreviewContainer>
                    <PreviewPaper
                      ref={componentRef}
                      elevation={0}
                    >
                      {(() => {
                        const SelectedTemplate = getTemplateById(selectedTemplate);
                        if (!SelectedTemplate) {
                          return <Alert severity="error">Template not found</Alert>;
                        }

                        const previewData = isEditing ? {
                          basics: {
                            name: basics.name || '',
                            email: basics.email || '',
                            phone: basics.phone || '',
                            location: basics.location || '',
                            summary: basics.summary || resumeData?.basics?.summary || '',
                            profiles: basics.profiles || {}
                          },
                          education: education || [],
                          experience: experience || [],
                          skills: skills,
                          projects: projects,
                          sections: sections.filter(section => 
                            !['personal', 'experience', 'education', 'skills', 'projects'].includes(section.id)
                          ).map(section => ({
                            id: section.id,
                            title: section.title,
                            content: section.content,
                            bullets: section.bullets || []
                          })),
                          sectionOrder: sectionOrder
                        } : resumeData || {
                          basics: {
                            ...initialBasics,
                            summary: resumeData?.basics?.summary || ''
                          },
                          education: [],
                          experience: [],
                          skills: [],
                          projects: resumeData?.projects || [],
                          sections: initialSections.filter(section => 
                            !['personal', 'experience', 'education', 'skills'].includes(section.id)
                          ).map(section => ({
                            id: section.id,
                            title: section.title,
                            content: section.content,
                            bullets: section.bullets || []
                          })),
                          sectionOrder: ['contact', 'summary', 'experience', 'education', 'skills', 'projects', 'custom']
                        };

                        return <SelectedTemplate resumeData={previewData} />;
                      })()}
                    </PreviewPaper>
                  </ResumePreviewContainer>

                  {/* Edit Section */}
                  {isEditing && resumeData && (
                    <Box className="edit-section">
                      <EditContainer>
                        {sectionOrder.map((sectionType, index) => (
                          <Box key={sectionType}>
                            <SectionPaper
                              onClick={() => setExpandedSection(expandedSection === sectionType ? null : sectionType)}
                              sx={{
                                border: expandedSection === sectionType ? '2px solid primary.main' : 'none',
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">
                                  {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {index > 0 && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveSection(index, 'up');
                                      }}
                                    >
                                      <KeyboardArrowUpIcon />
                                    </IconButton>
                                  )}
                                  {index < sectionOrder.length - 1 && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveSection(index, 'down');
                                      }}
                                    >
                                      <KeyboardArrowDownIcon />
                                    </IconButton>
                                  )}
                                  {expandedSection === sectionType ? (
                                    <KeyboardArrowUpIcon />
                                  ) : (
                                    <KeyboardArrowDownIcon />
                                  )}
                                </Box>
                              </Box>
                            </SectionPaper>

                            {expandedSection === sectionType && (
                              <ItemBox>
                                {sectionType === 'contact' && (
                                  <ItemBox>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          fullWidth
                                          label="Email"
                                          value={basics.email}
                                          onChange={(e) => setBasics({ ...basics, email: e.target.value })}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          fullWidth
                                          label="Phone"
                                          value={basics.phone}
                                          onChange={(e) => setBasics({ ...basics, phone: e.target.value })}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          fullWidth
                                          label="LinkedIn"
                                          value={basics.profiles?.linkedin || ''}
                                          onChange={(e) => setBasics({
                                            ...basics,
                                            profiles: { ...basics.profiles, linkedin: e.target.value }
                                          })}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          fullWidth
                                          label="GitHub"
                                          value={basics.profiles?.github || ''}
                                          onChange={(e) => setBasics({
                                            ...basics,
                                            profiles: { ...basics.profiles, github: e.target.value }
                                          })}
                                        />
                                      </Grid>
                                    </Grid>
                                  </ItemBox>
                                )}

                                {sectionType === 'summary' && (
                                  <ItemBox>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12}>
                                        <TextField
                                          fullWidth
                                          multiline
                                          rows={6}
                                          label="Professional Summary"
                                          value={basics.summary}
                                          onChange={(e) => setBasics({ ...basics, summary: e.target.value })}
                                          placeholder="Write a compelling professional summary that highlights your key achievements, skills, and career objectives..."
                                          helperText="Tip: Keep your summary concise, focused, and tailored to your target role"
                                        />
                                      </Grid>
                                    </Grid>
                                  </ItemBox>
                                )}

                                {sectionType === 'experience' && (
                                  <>
                                    {experience.map((exp, expIndex) => (
                                      <ItemBox key={expIndex}>
                                        <Grid container spacing={2}>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="Company"
                                              value={exp.company}
                                              onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="Position"
                                              value={exp.position}
                                              onChange={(e) => updateExperience(expIndex, 'position', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={6}>
                                            <TextField
                                              fullWidth
                                              label="Start Date"
                                              value={exp.start_date}
                                              onChange={(e) => updateExperience(expIndex, 'start_date', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                              <TextField
                                                fullWidth
                                                label="End Date"
                                                value={exp.end_date}
                                                disabled={exp.current}
                                                onChange={(e) => updateExperience(expIndex, 'end_date', e.target.value)}
                                              />
                                              <FormControlLabel
                                                control={
                                                  <Checkbox
                                                    checked={exp.current}
                                                    onChange={(e) => updateExperience(expIndex, 'current', e.target.checked)}
                                                  />
                                                }
                                                label="Current"
                                                sx={{ ml: 1 }}
                                              />
                                            </Box>
                                          </Grid>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              multiline
                                              rows={4}
                                              label="Description"
                                              value={exp.description}
                                              onChange={(e) => updateExperience(expIndex, 'description', e.target.value)}
                                            />
                                          </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                          <ActionButton
                                            variant="outlined"
                                            color="error"
                                            onClick={() => removeExperience(expIndex)}
                                          >
                                            Remove
                                          </ActionButton>
                                        </Box>
                                      </ItemBox>
                                    ))}
                                    <Box sx={{ mt: 2 }}>
                                      <ActionButton
                                        variant="contained"
                                        onClick={addExperience}
                                      >
                                        Add Experience
                                      </ActionButton>
                                    </Box>
                                  </>
                                )}

                                {sectionType === 'education' && (
                                  <>
                                    {education.map((edu, eduIndex) => (
                                      <ItemBox key={eduIndex}>
                                        <Grid container spacing={2}>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="School"
                                              value={edu.school}
                                              onChange={(e) => updateEducation(eduIndex, 'school', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="Degree"
                                              value={edu.degree}
                                              onChange={(e) => updateEducation(eduIndex, 'degree', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="Field of Study"
                                              value={edu.field}
                                              onChange={(e) => updateEducation(eduIndex, 'field', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={6}>
                                            <TextField
                                              fullWidth
                                              label="Start Year"
                                              value={edu.start_year}
                                              onChange={(e) => updateEducation(eduIndex, 'start_year', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                              <TextField
                                                fullWidth
                                                label="End Year"
                                                value={edu.end_year}
                                                disabled={edu.current}
                                                onChange={(e) => updateEducation(eduIndex, 'end_year', e.target.value)}
                                              />
                                              <FormControlLabel
                                                control={
                                                  <Checkbox
                                                    checked={edu.current}
                                                    onChange={(e) => updateEducation(eduIndex, 'current', e.target.checked)}
                                                  />
                                                }
                                                label="Current"
                                                sx={{ ml: 1 }}
                                              />
                                            </Box>
                                          </Grid>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              multiline
                                              rows={3}
                                              label="Description"
                                              value={edu.description}
                                              onChange={(e) => updateEducation(eduIndex, 'description', e.target.value)}
                                            />
                                          </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                          <ActionButton
                                            variant="outlined"
                                            color="error"
                                            onClick={() => removeEducation(eduIndex)}
                                          >
                                            Remove
                                          </ActionButton>
                                        </Box>
                                      </ItemBox>
                                    ))}
                                    <Box sx={{ mt: 2 }}>
                                      <ActionButton
                                        variant="contained"
                                        onClick={addEducation}
                                      >
                                        Add Education
                                      </ActionButton>
                                    </Box>
                                  </>
                                )}

                                {sectionType === 'skills' && (
                                  <>
                                    {skills.map((skill, skillIndex) => (
                                      <ItemBox key={skillIndex}>
                                        <Grid container spacing={2}>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="Skill"
                                              value={skill}
                                              onChange={(e) => {
                                                const newSkills = [...skills];
                                                newSkills[skillIndex] = e.target.value;
                                                setSkills(newSkills);
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                          <ActionButton
                                            variant="outlined"
                                            color="error"
                                            onClick={() => {
                                              const newSkills = skills.filter((_, i) => i !== skillIndex);
                                              setSkills(newSkills);
                                            }}
                                          >
                                            Remove
                                          </ActionButton>
                                        </Box>
                                      </ItemBox>
                                    ))}
                                    <Box sx={{ mt: 2 }}>
                                      <ActionButton
                                        variant="contained"
                                        onClick={() => setSkills([...skills, ''])}
                                      >
                                        Add Skill
                                      </ActionButton>
                                    </Box>
                                  </>
                                )}

                                {sectionType === 'projects' && (
                                  <>
                                    {projects.map((project, projectIndex) => (
                                      <ItemBox key={projectIndex}>
                                        <Grid container spacing={2}>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="Project Title"
                                              value={project.title}
                                              onChange={(e) => updateProject(projectIndex, 'title', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={6}>
                                            <TextField
                                              fullWidth
                                              label="Start Date"
                                              value={project.start_date}
                                              onChange={(e) => updateProject(projectIndex, 'start_date', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                              <TextField
                                                fullWidth
                                                label="End Date"
                                                value={project.end_date}
                                                disabled={project.current}
                                                onChange={(e) => updateProject(projectIndex, 'end_date', e.target.value)}
                                              />
                                              <FormControlLabel
                                                control={
                                                  <Checkbox
                                                    checked={project.current}
                                                    onChange={(e) => updateProject(projectIndex, 'current', e.target.checked)}
                                                  />
                                                }
                                                label="Current"
                                                sx={{ ml: 1 }}
                                              />
                                            </Box>
                                          </Grid>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              multiline
                                              rows={4}
                                              label="Description"
                                              value={project.description}
                                              onChange={(e) => updateProject(projectIndex, 'description', e.target.value)}
                                            />
                                          </Grid>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="Skills (comma separated)"
                                              value={project.skills ? project.skills.join(', ') : ''}
                                              onChange={(e) => updateProjectSkills(projectIndex, e.target.value)}
                                              helperText="Enter skills separated by commas"
                                            />
                                          </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                          <ActionButton
                                            variant="outlined"
                                            color="error"
                                            onClick={() => removeProject(projectIndex)}
                                          >
                                            Remove
                                          </ActionButton>
                                        </Box>
                                      </ItemBox>
                                    ))}
                                    <Box sx={{ mt: 2 }}>
                                      <ActionButton
                                        variant="contained"
                                        onClick={addProject}
                                      >
                                        Add Project
                                      </ActionButton>
                                    </Box>
                                  </>
                                )}

                                {sectionType === 'custom' && (
                                  <>
                                    {sections.filter(section => 
                                      !['personal', 'experience', 'education', 'skills'].includes(section.id)
                                    ).map((section, sectionIndex) => (
                                      <ItemBox key={section.id}>
                                        <Grid container spacing={2}>
                                          <Grid item xs={12}>
                                            <TextField
                                              fullWidth
                                              label="Section Title"
                                              value={section.title}
                                              onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                            />
                                          </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                          <ActionButton
                                            variant="outlined"
                                            color="error"
                                            onClick={() => removeSection(section.id)}
                                          >
                                            Remove
                                          </ActionButton>
                                        </Box>
                                        {section.bullets.map((bullet, bulletIndex) => (
                                          <ItemBox key={bulletIndex}>
                                            <Grid container spacing={2}>
                                              <Grid item xs={12}>
                                                <TextField
                                                  fullWidth
                                                  label="Bullet Point"
                                                  value={bullet}
                                                  onChange={(e) => updateBulletPoint(section.id, bulletIndex, e.target.value)}
                                                />
                                              </Grid>
                                            </Grid>
                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                              <ActionButton
                                                variant="outlined"
                                                color="error"
                                                onClick={() => removeBulletPoint(section.id, bulletIndex)}
                                              >
                                                Remove
                                              </ActionButton>
                                            </Box>
                                          </ItemBox>
                                        ))}
                                        <Box sx={{ mt: 2 }}>
                                          <ActionButton
                                            variant="contained"
                                            onClick={() => addBulletPoint(section.id)}
                                          >
                                            Add Bullet Point
                                          </ActionButton>
                                        </Box>
                                      </ItemBox>
                                    ))}
                                    <Box sx={{ mt: 2 }}>
                                      <ActionButton
                                        variant="contained"
                                        onClick={addSection}
                                      >
                                        Add Custom Section
                                      </ActionButton>
                                    </Box>
                                  </>
                                )}
                              </ItemBox>
                            )}
                          </Box>
                        ))}
                      </EditContainer>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: letter;
          margin: 0;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          background: white;
          height: 100%;
          overflow: hidden !important;
        }
        
        /* Hide everything except the print container */
        body > *:not([style*="z-index: 9999"]) {
          display: none !important;
        }

        /* Style the print view */
        [style*="z-index: 9999"] {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Style the resume content */
        [style*="z-index: 9999"] > * {
          width: 8.5in !important;
          min-height: 11in !important;
          padding: 0.3in !important;
          padding-left: 0.2in !important;  /* Reduced left padding */
          margin: 0 auto !important;
          box-shadow: none !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add this effect to handle entering edit mode
  useEffect(() => {
    if (isEditing && resumeData) {
      // Make sure to set the projects state from resumeData
      setProjects(resumeData.projects || []);
    }
  }, [isEditing, resumeData]);

  // Add this function to handle entering edit mode
  const handleEditToggle = () => {
    if (!isEditing) {
      // When entering edit mode, initialize all state with current resumeData
      setBasics({
        name: resumeData?.basics?.name || '',
        email: resumeData?.basics?.email || '',
        phone: resumeData?.basics?.phone || '',
        location: resumeData?.basics?.location || '',
        summary: resumeData?.basics?.summary || '',
        profiles: {
          linkedin: resumeData?.basics?.profiles?.linkedin || '',
          github: resumeData?.basics?.profiles?.github || ''
        }
      });
      
      // Initialize education with proper date handling
      const formattedEducation = resumeData?.education?.map(edu => {
        // Parse the period field (e.g., "2018 - 2022" or "2018 - Present")
        let start_year = '';
        let end_year = '';
        let current = false;
        
        if (edu.period) {
          const periodParts = edu.period.split(' - ');
          start_year = periodParts[0] || '';
          if (periodParts[1] === 'Present') {
            current = true;
            end_year = '';
          } else {
            end_year = periodParts[1] || '';
          }
        }
        
        return {
          ...edu,
          start_year: start_year,
          end_year: end_year,
          current: current
        };
      }) || [];
      setEducation(formattedEducation);
      
      // Initialize experience with proper date handling
      const formattedExperience = resumeData?.experience?.map(exp => {
        // Parse the period field (e.g., "Jan 2018 - Dec 2022" or "Jan 2018 - Present")
        let start_date = '';
        let end_date = '';
        let current = false;
        
        if (exp.period) {
          const periodParts = exp.period.split(' - ');
          start_date = periodParts[0] || '';
          if (periodParts[1] === 'Present') {
            current = true;
            end_date = '';
          } else {
            end_date = periodParts[1] || '';
          }
        }
        
        return {
          ...exp,
          start_date: start_date,
          end_date: end_date,
          current: current
        };
      }) || [];
      setExperience(formattedExperience);
      
      setSkills(resumeData?.skills || []);
      
      // Initialize projects with proper date handling
      const formattedProjects = resumeData?.projects?.map(project => {
        // Parse the period field if it exists
        let start_date = '';
        let end_date = '';
        let current = false;
        
        if (project.period) {
          const periodParts = project.period.split(' - ');
          start_date = periodParts[0] || '';
          if (periodParts[1] === 'Present') {
            current = true;
            end_date = '';
          } else {
            end_date = periodParts[1] || '';
          }
        }
        
        return {
          ...project,
          start_date: start_date,
          end_date: end_date,
          current: current
        };
      }) || [];
      setProjects(formattedProjects);
      
      // Set any custom sections
      if (resumeData?.sections) {
        setSections(resumeData.sections);
      }
      
      setSectionOrder(resumeData?.sectionOrder || ['contact', 'summary', 'experience', 'education', 'skills', 'projects', 'custom']);
    }
    setIsEditing(!isEditing);
  };

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <ContentWrapper>
        <Title variant="h4" gutterBottom>
          Resume Builder
        </Title>
        
        <StyledStepper>
          <Stepper 
            activeStep={activeStep}
            alternativeLabel
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </StyledStepper>

        <ContentPaper elevation={3}>
          {renderStepContent(activeStep)}
        </ContentPaper>

        <ButtonContainer>
          <StyledButton
            variant="outlined"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </StyledButton>
          
          <NavigationButtons>
            <StyledButton
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </StyledButton>
            {activeStep === steps.length - 1 ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <ActionButton
                  variant="contained"
                  onClick={handleRegenerate}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Regenerate Resume
                </ActionButton>
                {resumeData && !loading && (
                  <ActionButton
                    variant="contained"
                    color="secondary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                  >
                    Download PDF
                  </ActionButton>
                )}
              </Box>
            ) : (
              <ActionButton
                variant="contained"
                onClick={handleNext}
                disabled={loading || !isStepValid()}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Next'
                )}
              </ActionButton>
            )}
          </NavigationButtons>
        </ButtonContainer>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
      </ContentWrapper>
    </Container>
  );
};

export default ResumeBuilder; 