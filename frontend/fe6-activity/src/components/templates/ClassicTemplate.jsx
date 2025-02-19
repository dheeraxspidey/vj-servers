import React, { useEffect, useRef } from 'react';
import { Box, Typography, Chip, Divider } from '@mui/material';
import {
  ResumeContainer,
  Section,
  ClassicSectionTitle,
  ClassicHeader,
  ExperienceItem,
  SkillsContainer,
  ProjectItem,
  PrintStyles,
  ContentContainer
} from './styles';

const ClassicTemplate = ({ resumeData }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!resumeData) return;

    // Function to adjust content scale if it overflows
    const adjustScale = () => {
      const content = contentRef.current;
      if (!content) return;

      // Reset scale to measure true height
      content.style.transform = 'scale(1)';
      const contentHeight = content.scrollHeight;
      const containerHeight = content.parentElement.clientHeight;

      if (contentHeight > containerHeight) {
        const scale = containerHeight / contentHeight;
        content.style.transform = `scale(${scale})`;
      }
    };

    adjustScale();
    window.addEventListener('resize', adjustScale);
    return () => window.removeEventListener('resize', adjustScale);
  }, [resumeData]);

  if (!resumeData) return null;

  const { basics, education, experience, skills, projects } = resumeData;

  return (
    <ResumeContainer id="resume-preview" sx={PrintStyles}>
      <ContentContainer>
        <Box ref={contentRef}>
          {/* Header Section */}
          <ClassicHeader>
            <Typography variant="h3">
              {basics.name}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 1,
              flexWrap: 'wrap',
              color: 'text.secondary',
              fontSize: '0.9rem'
            }}>
              <Typography>{basics.email}</Typography>
              <Typography>•</Typography>
              <Typography>{basics.location}</Typography>
              {basics.profiles.linkedin && (
                <>
                  <Typography>•</Typography>
                  <Typography>LinkedIn: {basics.profiles.linkedin}</Typography>
                </>
              )}
              {basics.profiles.github && (
                <>
                  <Typography>•</Typography>
                  <Typography>GitHub: {basics.profiles.github}</Typography>
                </>
              )}
            </Box>
          </ClassicHeader>

          <Divider sx={{ mb: 2 }} />

          {/* Summary Section */}
          <Section>
            <ClassicSectionTitle>Professional Summary</ClassicSectionTitle>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {basics.summary}
            </Typography>
          </Section>

          <Divider sx={{ my: 2 }} />

          {/* Experience Section */}
          <Section>
            <ClassicSectionTitle>Professional Experience</ClassicSectionTitle>
            {experience.map((exp, index) => (
              <ExperienceItem key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {exp.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {exp.period}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {exp.position}
                </Typography>
                {exp.description && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {exp.description}
                  </Typography>
                )}
              </ExperienceItem>
            ))}
          </Section>

          <Divider sx={{ my: 2 }} />

          {/* Education Section */}
          <Section>
            <ClassicSectionTitle>Education</ClassicSectionTitle>
            {education.map((edu, index) => (
              <ExperienceItem key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {edu.school}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {edu.period}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {edu.degree} in {edu.field}
                </Typography>
                {edu.description && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {edu.description}
                  </Typography>
                )}
              </ExperienceItem>
            ))}
          </Section>

          <Divider sx={{ my: 2 }} />

          {/* Skills Section */}
          <Section>
            <ClassicSectionTitle>Technical Skills</ClassicSectionTitle>
            <SkillsContainer>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    borderRadius: '4px',
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              ))}
            </SkillsContainer>
          </Section>

          <Divider sx={{ my: 2 }} />

          {/* Projects Section */}
          <Section>
            <ClassicSectionTitle>Notable Projects</ClassicSectionTitle>
            {projects.map((project, index) => (
              <ProjectItem key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {project.title}
                </Typography>
                {project.description && (
                  <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    {project.description}
                  </Typography>
                )}
                {project.skills && project.skills.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}
                  >
                    {project.skills.join(', ')}
                  </Typography>
                )}
              </ProjectItem>
            ))}
          </Section>
        </Box>
      </ContentContainer>
    </ResumeContainer>
  );
};

export default ClassicTemplate; 