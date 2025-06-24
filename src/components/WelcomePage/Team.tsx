// src/components/WelcomePage/Team.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

const Team: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Ім\'я Прізвище',
      role: 'Викладач',
      image: '/placeholder-team-1.jpg', // Replace with actual image
    },
    {
      id: 2,
      name: 'Ім\'я Прізвище',
      role: 'Викладач',
      image: '/placeholder-team-2.jpg', // Replace with actual image
    },
    {
      id: 3,
      name: 'Ім\'я Прізвище',
      role: 'Викладач',
      image: '/placeholder-team-3.jpg', // Replace with actual image
    },
    {
      id: 4,
      name: 'Ім\'я Прізвище',
      role: 'Викладач',
      image: '/placeholder-team-4.jpg', // Replace with actual image
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Box
      id="team"
      ref={ref}
      sx={{
        py: 8,
        px: { xs: 2, md: 4 },
        backgroundColor: '#fef3e2',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            mb: 6,
            textAlign: 'center',
            color: '#063231',
          }}
        >
          Наша команда
        </Typography>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member) => (
              <Grid item xs={12} sm={6} md={3} key={member.id}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="300"
                      image={member.image}
                      alt={member.name}
                      sx={{
                        borderRadius: 2,
                        objectFit: 'cover',
                      }}
                    />
                    <CardContent sx={{ px: 0, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.role}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Team;