import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Upload, Checklist, Group, TrendingUp } from '@mui/icons-material';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navItems = [
    { 
      title: 'Upload New Item',
      icon: <Upload fontSize={isMobile ? "medium" : "large"} />,
      path: '/admin/upload',
      color: '#3f51b5'
    },
    { 
      title: 'Approve Items',
      icon: <Checklist fontSize={isMobile ? "medium" : "large"} />,
      path: '/admin/approve',
      color: '#4caf50'
    },
    { 
      title: 'Student Returns',
      icon: <Group fontSize={isMobile ? "medium" : "large"} />,
      path: '/admin/give',
      color: '#ff9800'
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto p-4"
    >
      <Box 
        textAlign="center" 
        mb={isMobile ? 2 : 4}
        sx={{ p: isMobile ? 1 : 2 }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            fontSize: isMobile ? '1.5rem' : '2.125rem'
          }}
        >
          Lost & Found Management
        </Typography>
        <Chip
          icon={<TrendingUp />}
          label="Success Rate"
          color="success"
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{ mb: isMobile ? 1 : 2 }}
        />
      </Box>

      <motion.div variants={itemVariants}>
        <Grid 
          container 
          spacing={isMobile ? 2 : 3}
          sx={{ px: isMobile ? 1 : 2 }}
        >
          {navItems.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card
                sx={{
                  background: item.color,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: item.color,
                    opacity: 0.9,
                    transform: isMobile ? 'none' : 'translateY(-5px)'
                  },
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  height: isMobile ? '80px' : '120px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => navigate(item.path)}
              >
                <CardContent sx={{ 
                  width: '100%',
                  p: isMobile ? '12px !important' : '16px !important'
                }}>
                  <Box 
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 2
                    }}
                  >
                    {item.icon}
                    <Typography 
                      variant={isMobile ? "body1" : "h6"}
                      sx={{ 
                        fontWeight: 'medium',
                        fontSize: isMobile ? '1rem' : '1.25rem'
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;