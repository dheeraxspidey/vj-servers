import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import axios from 'axios';
import {
  ResumeContainer,
  Section,
  ModernSectionTitle,
  ModernHeader,
  ExperienceItem,
  SkillsContainer,
  ProjectItem,
  PrintStyles,
  ContentContainer,
  ProfileImageContainer
} from './styles';

const base_url = import.meta.env.VITE_API_BASE_URL;

const ProfessionalTemplate = ({ resumeData }) => {
  const contentRef = useRef(null);
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    // Only fetch from API if resumeData doesn't already have a profile_image
    if (!resumeData?.profile_image) {
      const fetchUserImage = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${base_url}/api/user/profile/image`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              responseType: 'arraybuffer'
            }
          );
          
          const base64Image = Buffer.from(response.data, 'binary').toString('base64');
          setUserImage(base64Image);
        } catch (error) {
          console.error('Error fetching user image:', error);
        }
      };

      fetchUserImage();
    }
  }, [resumeData?.profile_image]);

  useEffect(() => {
    if (!resumeData) return;

    const adjustScale = () => {
      const content = contentRef.current;
      if (!content) return;

      if (!window.matchMedia('print').matches) {
        content.style.transform = 'scale(1)';
        const contentHeight = content.scrollHeight;
        const containerHeight = content.parentElement.clientHeight;

        if (contentHeight > containerHeight) {
          const scale = containerHeight / contentHeight;
          content.style.transform = `scale(${scale})`;
        }
      }
    };

    adjustScale();
    window.addEventListener('resize', adjustScale);
    return () => window.removeEventListener('resize', adjustScale);
  }, [resumeData]);

  if (!resumeData) return null;

  const { basics, education, experience, skills, projects, sectionOrder = [
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'custom'
  ] } = resumeData;

  const renderSection = (sectionType) => {
    switch (sectionType) {
      case 'summary':
        return (
          <Section key="summary">
            <ModernSectionTitle>Professional Summary</ModernSectionTitle>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>{basics.summary}</Typography>
          </Section>
        );
      case 'experience':
        return (
          <Section key="experience">
            <ModernSectionTitle>Experience</ModernSectionTitle>
            {experience.map((exp, index) => (
              <ExperienceItem key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {exp.position}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {exp.company} • {exp.period}
                </Typography>
                {exp.description && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {exp.description}
                  </Typography>
                )}
              </ExperienceItem>
            ))}
          </Section>
        );
      case 'education':
        return (
          <Section key="education">
            <ModernSectionTitle>Education</ModernSectionTitle>
            {education.map((edu, index) => (
              <ExperienceItem key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {edu.degree} in {edu.field}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {edu.school} • {edu.period}
                </Typography>
                {edu.description && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {edu.description}
                  </Typography>
                )}
              </ExperienceItem>
            ))}
          </Section>
        );
      case 'skills':
        return (
          <Section key="skills">
            <ModernSectionTitle>Skills</ModernSectionTitle>
            <SkillsContainer>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </SkillsContainer>
          </Section>
        );
      case 'projects':
        return (
          <Section key="projects">
            <ModernSectionTitle>Projects</ModernSectionTitle>
            {projects.map((project, index) => (
              <ProjectItem key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {project.title}
                </Typography>
                {project.description && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {project.description}
                  </Typography>
                )}
                {project.skills && project.skills.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {project.skills.map((skill, skillIndex) => (
                      <Typography
                        key={skillIndex}
                        variant="caption"
                        color="textSecondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {skill}{skillIndex < project.skills.length - 1 ? ', ' : ''}
                      </Typography>
                    ))}
                  </Box>
                )}
              </ProjectItem>
            ))}
          </Section>
        );
      case 'custom':
        return resumeData.sections?.filter(section => 
          !['personal', 'experience', 'education', 'skills'].includes(section.id)
        ).map(section => (
          <Section key={section.id}>
            <ModernSectionTitle>{section.title}</ModernSectionTitle>
            <Box sx={{ pl: 2 }}>
              {section.bullets.map((bullet, bulletIndex) => (
                <Typography 
                  key={bulletIndex} 
                  variant="body2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    mb: 0.5,
                    '&:before': {
                      content: '"•"',
                      marginRight: '8px',
                      marginLeft: '-16px'
                    }
                  }}
                >
                  {bullet}
                </Typography>
              ))}
            </Box>
          </Section>
        ));
      default:
        return null;
    }
  };

  return (
    <ResumeContainer id="resume-preview" sx={PrintStyles}>
      <ContentContainer>
        <Box ref={contentRef}>
          {/* Header Section with Profile Image */}
          <ModernHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              <ProfileImageContainer>
                <Avatar
                  src={resumeData.profile_image 
                    ? `data:image/jpeg;base64,${resumeData.profile_image}` 
                    : userImage 
                      ? `data:image/jpeg;base64,${userImage}` 
                      : ''}
                  alt={basics.name}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '3px solid #fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
              </ProfileImageContainer>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {basics.name}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {basics.email} • {basics.location}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {basics.profiles?.linkedin && (
                    <Typography variant="body2" color="textSecondary">
                      LinkedIn: {basics.profiles.linkedin}
                    </Typography>
                  )}
                  {basics.profiles?.github && (
                    <Typography variant="body2" color="textSecondary">
                      GitHub: {basics.profiles.github}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </ModernHeader>

          {/* Render sections in order */}
          {sectionOrder.map(sectionType => renderSection(sectionType))}
        </Box>
      </ContentContainer>
    </ResumeContainer>
  );
};

export default ProfessionalTemplate; 