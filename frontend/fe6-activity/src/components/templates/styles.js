import { styled } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';

// Base Resume Container
export const ResumeContainer = styled(Paper)(({ theme }) => ({
  width: '8.5in',
  minHeight: '11in',
  maxHeight: '11in',
  margin: '0 auto',
  padding: '0.5in',
  backgroundColor: 'white',
  boxShadow: theme.shadows[3],
  overflowY: 'hidden',
  position: 'relative',
  fontSize: '0.9rem',
  '@media print': {
    boxShadow: 'none',
    margin: 0,
    padding: '0.5in',
    width: '8.5in',
    height: '11in',
  },
  '@media screen': {
    marginBottom: theme.spacing(4),
  }
}));

// Section Container
export const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  pageBreakInside: 'avoid',
  '&:last-child': {
    marginBottom: 0,
  },
}));

// Modern Template Styles
export const ModernSectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '1.2rem',
  marginBottom: theme.spacing(1),
  paddingBottom: theme.spacing(0.5),
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  pageBreakAfter: 'avoid',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

export const ModernHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  '& h4': {
    fontSize: '1.5rem',
    fontWeight: 600,
    letterSpacing: '1px',
    marginBottom: theme.spacing(1),
  },
  '& .MuiTypography-body1': {
    fontSize: '0.9rem',
  },
  '& .MuiTypography-body2': {
    fontSize: '0.8rem',
  }
}));

// Classic Template Styles
export const ClassicSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1.5),
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: theme.palette.text.primary,
  pageBreakAfter: 'avoid',
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(0.5),
}));

export const ClassicHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textAlign: 'center',
  '& h3': {
    fontSize: '1.8rem',
    fontWeight: 700,
    letterSpacing: '2px',
    marginBottom: theme.spacing(1),
  },
  '& .MuiTypography-body1': {
    fontSize: '0.9rem',
  }
}));

// Shared Components
export const ExperienceItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0,
  },
  '& .MuiTypography-h6': {
    fontSize: '1rem',
    marginBottom: '0.1rem',
  },
  '& .MuiTypography-subtitle1': {
    fontSize: '0.9rem',
    marginBottom: '0.1rem',
  },
  '& .MuiTypography-body2': {
    fontSize: '0.85rem',
    lineHeight: 1.4,
  }
}));

export const SkillsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  '& .MuiChip-root': {
    height: '24px',
    fontSize: '0.75rem',
    '& .MuiChip-label': {
      padding: '0 8px',
    }
  }
}));

export const ProjectItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0,
  },
  '& .MuiTypography-subtitle1': {
    fontSize: '0.95rem',
    marginBottom: '0.1rem',
  },
  '& .MuiTypography-body2': {
    fontSize: '0.85rem',
    lineHeight: 1.4,
  }
}));

// Print Styles
export const PrintStyles = {
  '@media print': {
    margin: 0,
    padding: '0.5in',
    boxShadow: 'none',
    '@page': {
      size: 'letter',
      margin: '0.5in',
    },
    '.MuiChip-root': {
      border: '1px solid #000',
      pageBreakInside: 'avoid',
    },
  },
};

// Content scaling styles
export const ContentContainer = styled(Box)(({ theme }) => ({
  maxHeight: '9in',
  overflowY: 'hidden',
  '& > *': {
    transform: 'scale(1)',
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease',
  }
})); 