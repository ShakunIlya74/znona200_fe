// src/components/WelcomePage/FAQ.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState<string | false>(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const faqItems: FAQItem[] = [
    {
      question: 'З чого складається курс?',
      answer: 'Курс складається з теоретичних та практичних вебінарів, домашніх завдань, модульних тестів, друкованих конспектів та додаткових матеріалів.',
    },
    {
      question: 'Що робити, якщо мені не сподобається навчання?',
      answer: 'Ви можете звернутися до нашої служби підтримки протягом перших двох тижнів навчання для вирішення питань або повернення коштів.',
    },
    {
      question: 'Чи надсилатимемо ми друковані конспекти учням, які перебувають за кордоном?',
      answer: 'Так, ми надсилаємо друковані конспекти по всьому світу. Вартість доставки розраховується індивідуально.',
    },
    {
      question: 'Чим відрізняються курси «Комплексний» та «Контроль»?',
      answer: 'Курс «Контроль» включає всі переваги «Комплексного» курсу, а також додаткові індивідуальні заняття з репетитором та перевірку письмових домашніх завдань.',
    },
    {
      question: 'Який формат домашніх завдань на курсі?',
      answer: 'Домашні завдання включають тестові завдання, письмові роботи та практичні вправи. Всі завдання перевіряються автоматично або репетиторами.',
    },
  ];

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      id="faq"
      ref={ref}
      sx={{
        py: 8,
        px: { xs: 2, md: 4 },
        backgroundColor: '#f9f9f9',
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            mb: 6,
            textAlign: 'center',
            color: '#063231',
          }}
        >
          Запитання & Відповіді
        </Typography>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Accordion
                expanded={expanded === `panel${index}`}
                onChange={handleChange(`panel${index}`)}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  '&:before': {
                    display: 'none',
                  },
                  boxShadow: expanded === `panel${index}` ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: expanded === `panel${index}` ? '#f0f9f9' : 'transparent',
                    '& .MuiAccordionSummary-content': {
                      my: 2,
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 500 }}>{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#f0f9f9' }}>
                  <Typography>{item.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </motion.div>
      </Box>
    </Box>
  );
};

export default FAQ;