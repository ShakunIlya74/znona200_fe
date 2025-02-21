import React from 'react';
import { Box, Typography } from '@mui/material';
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
}

const InfoBlock: React.FC<InfoBlockProps> = ({ number, title, text }) => {
    return (
        <Box
            sx={{
                // minWidth: 0
                // p: 2,
                // m: 1,
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {number}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
                {title}
            </Typography>
            <Box sx={{ mt: 1 }}>
                {text.map((line, idx) => (
                    <Typography key={idx} variant="body2" sx={{ mt: idx > 0 ? 1 : 0 }}>
                        {line}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
};

const About: React.FC = () => {
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
    ];

    return (
        <Box id="about" sx={{
            backgroundColor: '#f2f1f2', flexGrow: 1,

        }}>
            {/* Title */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" align="left" sx={{ fontWeight: 'bold', fontSize: '44px' }}>
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
                        mb: 4,
                        pr: { xs: 0, md: 10 },
                    }}
                >
                    <Box
                        id="grid1"
                        sx={{
                            width: '60%',
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                            gridTemplateRows: 'repeat(2, auto)',
                            gap: 2,
                        }}
                    >
                        <InfoBlock number={info[0].number} title={info[0].title} text={info[0].text} />
                        <InfoBlock number={info[1].number} title={info[1].title} text={info[1].text} />
                        <InfoBlock number={info[2].number} title={info[2].title} text={info[2].text} />
                        <InfoBlock number={info[3].number} title={info[3].title} text={info[3].text} />
                    </Box>

                    <Box
                        sx={{
                            flex: '1 1 auto',
                            maxWidth: '40%',
                            minWidth: '10%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: { xs: 4, md: 0 },
                            mr: { xs: 0, md: 0 },
                            flexGrow: 1,
                            // padding: { xs: '10px 0', md: '20px 0' },
                        }}
                    >
                        <Box
                            component="img"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxWidth: '100%',
                                mr: { xs: 0, md: 0 },
                            }}
                            src={sapiens}
                            alt="sapiens"
                        />
                    </Box>

                </Box>
                {/* Second Block */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        width: '100%',
                    }}
                >
                    <Box
                        sx={{
                            flex: '1 1 auto',
                            maxWidth: '40%',
                            minWidth: '10%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: { xs: 4, md: 0 },
                            mr: { xs: 0, md: 0 },
                            flexGrow: 1,
                            // padding: { xs: '10px 0', md: '20px 0' },
                        }}
                    >
                        <Box
                            component="img"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxWidth: '100%',
                                mr: { xs: 0, md: 0 },
                            }}
                            src={sapiens2}
                            alt="sapiens2"
                        />
                    </Box>
                    <Box
                        id="grid2"
                        sx={{
                            width: '60%',
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                            gridTemplateRows: 'repeat(2, auto)',
                            gap: 2,
                        }}
                    >
                        <InfoBlock number={info[4].number} title={info[4].title} text={info[4].text} />
                        <InfoBlock number={info[5].number} title={info[5].title} text={info[5].text} />
                        <InfoBlock number={info[6].number} title={info[6].title} text={info[6].text} />
                        <InfoBlock number={info[7].number} title={info[7].title} text={info[7].text} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default About;








