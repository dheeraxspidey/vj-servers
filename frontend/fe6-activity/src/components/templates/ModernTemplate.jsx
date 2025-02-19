import React, { useEffect, useRef } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
  ResumeContainer,
  Section,
  ModernSectionTitle,
  ModernHeader,
  ExperienceItem,
  SkillsContainer,
  ProjectItem,
  PrintStyles,
  ContentContainer
} from './styles';

const ModernTemplate = ({ resumeData }) => {
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
          <ModernHeader>
            <Typography variant="h4" gutterBottom>
              {basics.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {basics.email} • {basics.location}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {basics.profiles.linkedin && (
                <Typography variant="body2" color="textSecondary">
                  LinkedIn: {basics.profiles.linkedin}
                </Typography>
              )}
              {basics.profiles.github && (
                <Typography variant="body2" color="textSecondary">
                  GitHub: {basics.profiles.github}
                </Typography>
              )}
            </Box>
          </ModernHeader>

          {/* Summary Section */}
          <Section>
            <ModernSectionTitle>Professional Summary</ModernSectionTitle>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>{basics.summary}</Typography>
          </Section>

          {/* Experience Section */}
          <Section>
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

          {/* Education Section */}
          <Section>
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

          {/* Skills Section */}
          <Section>
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

          {/* Projects Section */}
          <Section>
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
        </Box>
      </ContentContainer>
    </ResumeContainer>
  );
};

export default ModernTemplate; 