import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import sapiens from '../../source/mainPage/sapiens.svg';
import sapiens2 from '../../source/mainPage/sapiens_2.svg';

interface Info {
    number: string;
    title: string;
    text: string[];
}

interface InfoBlockProps {
    number: string;
    title: string;
    text: string[];
    index: number;
    isVisible: boolean;
    slideDirection: 'left' | 'right';
}

const InfoBlock: React.FC<InfoBlockProps> = ({ number, title, text, index, isVisible, slideDirection }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 3,
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transform: isVisible 
                    ? 'translateX(0px)' 
                    : slideDirection === 'left' 
                        ? 'translateX(-100px)' 
                        : 'translateX(100px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transitionDelay: `${index * 0.1}s`,
                // '&:hover': {
                //     transform: isVisible ? 'translateY(-8px) scale(1.02)' : undefined,
                //     boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                //     transition: 'all 0.3s ease-out',
                // },
            }}
        >
            <Typography 
                variant="h2" 
                sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    opacity: 0.7,
                    fontSize: '96px',
                    lineHeight: 1,
                    mb: 1
                }}
            >
                {number}
            </Typography>
            <Typography 
                variant="h6" 
                sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                    mb: 2,
                    fontSize: '18px'
                }}
            >
                {title}
            </Typography>
            <Box>
                {text.map((line, idx) => (
                    <Typography 
                        key={idx} 
                        variant="body2" 
                        sx={{ 
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6,
                            fontSize: '14px',
                            mt: idx > 0 ? 1 : 0 
                        }}
                    >
                        {line}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
};

interface AnimatedGridProps {
    children: React.ReactNode;
    gridId: string;
}

const AnimatedGrid: React.FC<AnimatedGridProps> = ({ children, gridId }) => {
    const [isVisible, setIsVisible] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.2,
                rootMargin: '50px',
            }
        );

        if (gridRef.current) {
            observer.observe(gridRef.current);
        }

        return () => {
            if (gridRef.current) {
                observer.unobserve(gridRef.current);
            }
        };
    }, []);

    return (
        <Box
            ref={gridRef}
            id={gridId}
            sx={{
                width: { xs: '100%', md: '60%' },
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 3,
            }}
        >
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { 
                        ...child.props, 
                        index, 
                        isVisible 
                    });
                }
                return child;
            })}
        </Box>
    );
};

const About: React.FC = () => {
    const theme = useTheme();
    const [titleVisible, setTitleVisible] = useState(false);
    const titleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTitleVisible(true);
                }
            },
            {
                threshold: 0.5,
            }
        );

        if (titleRef.current) {
            observer.observe(titleRef.current);
        }

        return () => {
            if (titleRef.current) {
                observer.unobserve(titleRef.current);
            }
        };
    }, []);

    const info: Info[] = [
        {
            number: '01',
            title: 'Модульна система навчання',
            text: [
                'Курс розділено на частини - модулі. Після засвоєння певної кількості матеріалу наші учні складають модульний тест, закривають усі дедлайни та мають тиждень канікул, щоб усе довчити.',
            ],
        },
        {
            number: '02',
            title: 'Авторські друковані конспекти',
            text: [
                'У вартість курсу входять авторські конспекти, у яких учні знайдуть розбір типових завдань НМТ, легкі пояснення складних правил, наголоси в римах, візуалізовані пароніми та багато іншого.',
            ],
        },
        {
            number: '03',
            title: '3 уроки на тиждень у режимі реального часу',
            text: [
                'Усі уроки відбуваються у форматі онлайн-вебінару: учні бачать викладача, можуть поставити йому запитання та в кінці кожного заняття пишуть тест, щоб перевірити, наскільки добре вони засвоїли нову тему. Щотижня ми матимемо 1 теоретичний вебінар, 1 практичний вебінар та 1 додатковий вебінар (лексика, фразеологія та наголоси). Записи уроків, презентації й тести до них завжди є та доступні всім учням.',
            ],
        },
        {
            number: '04',
            title: 'Репетитор, який пояснює всі незрозумілі моменти',
            text: [
                'За кожним учнем закріплений репетитор, якому завжди можна поставити запитання щодо незрозумілих моментів. Наші репетитори з радістю допоможуть розібратися з певними темами чи завданнями.',
            ],
        },
        {
            number: '05',
            title: 'Телеграм-бот',
            text: [
                'Тут уся організаційна інформація, розклад занять та корисні матеріали. Телеграм-бот допомогатиме тобі структурувати навчання (будь певним/а, що ви не пропустиш жодного важливого оголошення) і нагадуватиме про невиконані домашні завдання.',
            ],
        },
        {
            number: '06',
            title: 'Особистий кабінет на сайті',
            text: [
                'В особистому кабінеті на сайті учням доступні:',
                '- записи вебінарів, презентації й тести до них;',
                '- тести, які є частиною домашнього завдання;',
                '- мінілекції;',
                '- конспект;',
                '- статистика результатів.',
            ],
        },
        {
            number: '07',
            title: 'Високі результати учнів:',
            text: [
                'НМТ 2023 – 58 двістібальників',
                'НМТ 2022 – 150 двістібальників',
                'ЗНО 2021 – 3 двістібальники, 10 учнів 199+',
            ],
        },
        {
            number: '08',
            title: 'Можливість вибрати зручний для тебе формат курсу',
            text: [
                'Ми пропонуємо 2 пакети:',
                ' • Комплексний',
                ' • Комплексний + Контроль',
            ],
        },
    ];    return (
        <Box id="about" sx={{
            backgroundColor: '#f2f1f2', 
            flexGrow: 1,
            p: 4,
            overflow: 'hidden', // Prevent horizontal scrollbar during animations
        }}>
            {/* Scroll to view more indicator */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    mb: 4,
                    opacity: titleVisible ? 0 : 1,
                    transition: 'opacity 0.5s ease-out',
                    pointerEvents: titleVisible ? 'none' : 'auto',
                }}
            >
                <Typography 
                    variant="body1" 
                    sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '16px',
                        fontWeight: 500,
                        mb: 1,
                        textAlign: 'center'
                    }}
                >
                    Гортай вниз, щоб дізнатися більше
                </Typography>
                <Box
                    sx={{
                        fontSize: '24px',
                        color: theme.palette.primary.main,
                        animation: titleVisible ? 'none' : 'bounce 2s infinite',
                        '@keyframes bounce': {
                            '0%, 20%, 53%, 80%, 100%': {
                                transform: 'translate3d(0,0,0)',
                            },
                            '40%, 43%': {
                                transform: 'translate3d(0, -8px, 0)',
                            },
                            '70%': {
                                transform: 'translate3d(0, -4px, 0)',
                            },
                            '90%': {
                                transform: 'translate3d(0, -2px, 0)',
                            },
                        },
                    }}
                >
                    ↓
                </Box>
            </Box>

            {/* Title */}
            <Box ref={titleRef} sx={{ mb: 6 }}>
                <Typography 
                    variant="h3" 
                    align="left" 
                    sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '44px', 
                        mb: 4,
                        transform: titleVisible ? 'translateY(0px)' : 'translateY(50px)',
                        opacity: titleVisible ? 1 : 0,
                        transition: 'all 0.8s ease-out',
                    }}
                >
                    Про курси
                </Typography>

                {/* First Block */}
                <Box
                    sx={{
                        boxSizing: 'border-box',
                        mx: 'auto',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 6,
                        gap: 4,
                    }}
                >
                    <AnimatedGrid gridId="grid1">
                        <InfoBlock number={info[0].number} title={info[0].title} text={info[0].text} index={0} isVisible={false} slideDirection="left" />
                        <InfoBlock number={info[1].number} title={info[1].title} text={info[1].text} index={1} isVisible={false} slideDirection="left" />
                        <InfoBlock number={info[2].number} title={info[2].title} text={info[2].text} index={2} isVisible={false} slideDirection="left" />
                        <InfoBlock number={info[3].number} title={info[3].title} text={info[3].text} index={3} isVisible={false} slideDirection="left" />
                    </AnimatedGrid>

                    <Box
                        sx={{
                            flex: '1 1 auto',
                            maxWidth: { xs: '100%', md: '40%' },
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            component="img"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxWidth: '100%',
                            }}
                            src={sapiens}
                            alt="sapiens"
                        />
                    </Box>
                </Box>                {/* Second Block */}
                <Box
                    sx={{
                        boxSizing: 'border-box',
                        mx: 'auto',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                    }}
                >                    <Box
                        sx={{
                            flex: '1 1 auto',
                            maxWidth: { xs: '100%', md: '40%' },
                            width: '100%',
                            display: { xs: 'none', md: 'flex' },
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            component="img"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxWidth: '100%',
                            }}
                            src={sapiens2}
                            alt="sapiens2"
                        />
                    </Box>

                    <AnimatedGrid gridId="grid2">
                        <InfoBlock number={info[4].number} title={info[4].title} text={info[4].text} index={0} isVisible={false} slideDirection="right" />
                        <InfoBlock number={info[5].number} title={info[5].title} text={info[5].text} index={1} isVisible={false} slideDirection="right" />
                        <InfoBlock number={info[6].number} title={info[6].title} text={info[6].text} index={2} isVisible={false} slideDirection="right" />
                        <InfoBlock number={info[7].number} title={info[7].title} text={info[7].text} index={3} isVisible={false} slideDirection="right" />
                    </AnimatedGrid>
                </Box>
            </Box>
        </Box>
    );
};

export default About;