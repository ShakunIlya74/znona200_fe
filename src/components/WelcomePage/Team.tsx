// src/components/WelcomePage/Team.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ana from '../../source/about/ana_full.png'; 
import nasty from '../../source/about/nasty_full.png';
import lilia from '../../source/about/lilia_full.png';
import olenka from '../../source/about/olenka_full.png';
import yarina from '../../source/about/yarina_full.png';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  horizontalShift?: string;
}

const Team: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedMemberId, setExpandedMemberId] = useState<number | null>(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Анна',
      role: 'Засновниця проєкту, учителька української мови, яка готує до ЗНО вже 10 років, співавторка конспекту з мови.',
      image: ana,
      horizontalShift: '70%',
    },
    {
      id: 2,
      name: 'Анастасія',
      role: '200-бальниця з української мови та літератури, переможниця Всеукраїнського етапу ХХ Міжнародного конкурсу з української мови імені Петра Яцика, репетиторка з української мови, співавторка конспекту з мови.',
      image: nasty,
      horizontalShift: '30%',
    },
    {
      id: 3,
      name: 'Лілія',
      role: 'Репетиторка з української мови',
      image: lilia,
      horizontalShift: '40%',
    },
    {
      id: 4,
      name: 'Олена',
      role: 'Репетиторка з української мови',
      image: olenka,
      horizontalShift: '70%',
    },
    {
      id: 5,
      name: 'Ярина',
      role: 'Менеджерка',
      image: yarina,
      horizontalShift: '80%',
    },
  ];

  const handleMemberClick = (memberId: number) => {
    setExpandedMemberId(expandedMemberId === memberId ? null : memberId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
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
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
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
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 2,
              height: { xs: '70vh', md: '80vh' },
              minHeight: 500,
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#063231',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: '#0a4a47',
                },
              },
            }}
          >
            {teamMembers.map((member) => {
              const isExpanded = expandedMemberId === member.id;
              
              return (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  layout                  animate={{
                    width: isExpanded 
                      ? isMobile ? 400 : 600 
                      : isMobile ? 180 : 280,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                  whileHover={{ 
                    scale: isExpanded ? 1 : 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flexShrink: 0,
                  }}
                >
                  <Box
                    onClick={() => handleMemberClick(member.id)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',                      backgroundImage: `url(${member.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: member.horizontalShift || 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: isExpanded ? '50%' : '40%',
                        background: isExpanded 
                          ? 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                          : 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isExpanded ? 'expanded' : 'collapsed'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          bottom: 16,
                          left: 16,
                          right: 16,
                          zIndex: 2,
                          color: 'white',
                        }}
                      >                        <Typography
                          variant={isExpanded ? "h5" : "h6"}
                          sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            fontSize: isExpanded 
                              ? { xs: '1.5rem', md: '2rem' }
                              : { xs: '1rem', md: '1.25rem' },
                          }}
                        >
                          {member.name}
                        </Typography>
                        
                        <Typography
                          variant="body1"
                          sx={{
                            lineHeight: 1.4,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            fontSize: isExpanded 
                              ? { xs: '0.9rem', md: '1rem' }
                              : { xs: '0.75rem', md: '0.85rem' },
                            display: isExpanded ? 'block' : '-webkit-box',
                            WebkitLineClamp: isExpanded ? 'none' : 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {member.role}
                        </Typography>
                      </motion.div>
                    </AnimatePresence>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Team;