import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  pageBreakInside: 'avoid',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '1.5rem',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  pageBreakAfter: 'avoid',
}));

const ResumePreview = ({ resumeData }) => {
  if (!resumeData) return null;

  const { basics, education, experience, skills, projects } = resumeData;

  return (
    <Paper
      id="resume-preview"
      sx={{
        p: 4,
        maxWidth: '8.5in',
        margin: '0 auto',
        backgroundColor: 'white',
        boxShadow: 3,
        '@media print': {
          boxShadow: 'none',
          margin: 0,
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {basics.name}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {basics.email} • {basics.location}
        </Typography>
        <Box sx={{ mt: 1 }}>
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
      </Box>

      {/* Summary Section */}
      <Section>
        <SectionTitle variant="h5">Professional Summary</SectionTitle>
        <Typography variant="body1">{basics.summary}</Typography>
      </Section>

      {/* Education Section */}
      <Section>
        <SectionTitle variant="h5">Education</SectionTitle>
        {education.map((edu, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="h6">{edu.degree} in {edu.field}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {edu.school} • {edu.period}
            </Typography>
            {edu.description && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {edu.description}
              </Typography>
            )}
          </Box>
        ))}
      </Section>

      {/* Experience Section */}
      <Section>
        <SectionTitle variant="h5">Experience</SectionTitle>
        {experience.map((exp, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="h6">{exp.position}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {exp.company} • {exp.period}
            </Typography>
            {exp.description && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {exp.description}
              </Typography>
            )}
          </Box>
        ))}
      </Section>

      {/* Skills Section */}
      <Section>
        <SectionTitle variant="h5">Skills</SectionTitle>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Section>

      {/* Projects Section */}
      <Section>
        <SectionTitle variant="h5">Projects</SectionTitle>
        {projects.map((project, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="h6">{project.title}</Typography>
            {project.description && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {project.description}
              </Typography>
            )}
            {project.skills && project.skills.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {project.skills.map((skill, skillIndex) => (
                  <Chip
                    key={skillIndex}
                    label={skill}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Section>
    </Paper>
  );
};

export default ResumePreview; 