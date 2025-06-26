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
        answer: `1) Онлайн-вебінари \n
2) Домашні завдання, авторські тести та симуляції НМТ

3) Робота з репетитором

4) Написання мотиваційних листів чи/та власних висловлень 

5) Навчання із сайтом та телеграм-ботом

Телеграм-бот допомогатиме вам структурувати навчання (будьте певні, що тепер ви не пропустите жодного важливого оголошення) і нагадуватиме про невиконані домашні завдання.`,
    },
    {
        question: 'Що робити, якщо мені не сподобається навчання?',
        answer: 'Насамперед ви можете ознайомитися із записами наших етерів в інстаграмі та безкоштовними матеріалами в телеграм-групі, щоб зрозуміти, чи подобається вам спосіб подачі інформації. Також є  можливість щомісячної оплати: якщо вам не підійде наш формат навчання, ви зможете в будь-який момент відмовитися від продовження курсу й не оплачувати наступний місяць навчання.',
    },
    {
        question: 'Чи надсилатимемо ми друковані конспекти учням, які перебувають за кордоном?',
        answer: 'Так, надсилатимемо за бажанням учнів. Будь ласка, врахуйте, що вартість доставки сплачує отримувач.',
    },
    {
        question: 'Чим відрізняються курси «Комплексний» та «Контроль»?',
        answer: `Учні обидвох курсів мають доступ до телеграм-бота та сайту, беруть участь у вебінарах, виконують домашні завдання та можуть уточнити в репетитора всі незрозумілі моменти. Відмінність полягає в тому, що:
            
1) на курсі «Контроль» репетитор перевіряє кожне домашнє завдання учня й вказує йому на помилки, а на курсі  «Комплексний» учень сам перевіряє свою домашню роботу, звіряючи її з наданими правильними відповідями;

2) учні курсу «Контроль» мають щомісяця урок контролю з репетитором на платформі “Zoom”, на якому викладач опитує вивчений матеріал й контролює досягнення учнів.`,
    },
    {
        question: 'Який формат домашніх завдань на курсі?',
        answer: 'Ми поєднуємо кілька типів домашніх завдань. Переважно це тести на сайті різного рівня складності та письмові вправи. Також домашнім завданням може бути написання власного висловлення чи мотиваційного листа. Усі завдання з’являються в боті: учень бачить, що саме потрібно виконати й коли слід здати роботу.',
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
                </AccordionSummary>                <AccordionDetails sx={{ backgroundColor: '#f0f9f9' }}>
                  <Typography sx={{ whiteSpace: 'pre-line' }}>{item.answer}</Typography>
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