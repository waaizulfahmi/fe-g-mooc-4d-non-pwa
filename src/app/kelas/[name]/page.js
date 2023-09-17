'use client';

/* 
@DOCS :
1. core
    -> package from react / next
2. third party
    -> package from third party
3. redux
    -> redux global state management
4. components
    -> reusable component
5. data
    -> handle data model or application static data
6. api
    -> api functions
7. util
    -> utility functions
*/

// core
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

// third party
import { useSession } from 'next-auth/react';
import { MdPlayCircleOutline, MdOutlineQuestionAnswer } from 'react-icons/md';
import { PDFDownloadLink } from '@react-pdf/renderer/lib/react-pdf.browser.es.js';

// redux
// ---

// components
import HeroIcon from '@/components/HeroIcon';
import NavbarButton from '@/components/NavbarButton';
import VideoFrame from '@/components/VideoFrame';
import Certificate from '@/components/Certificate';

// datas
import { Kelas, ListMateri, ListQuiz } from '@/data/model';

// apis
import { userGetEnroll, userSendAnswer, userUpdateVideoMateri } from '@/axios/user';

// utils
import { recognition } from '@/utils/speech-recognition';
import { speechAction } from '@/utils/text-to-speech';
import { getYoutubeVideoId } from '@/utils/get-youtube-videoId';
import { getImageFile } from '@/utils/get-server-storage';
import { convertStringToNum } from '@/utils/convert-stringNum-to-num';
import { ApiResponseError } from '@/utils/error-handling';

const EnrollKelas = () => {
    const { data } = useSession();
    const { name } = useParams();
    const token = data?.user?.token;
    const router = useRouter();

    // STATE
    // load data
    const [loadData, setLoadData] = useState(true);
    // poin etc
    const [progress, setProgress] = useState(0);
    const [nilai, setNilai] = useState(0);
    const [poin, setPoin] = useState(0);
    // quiz
    const [quiz, setQuiz] = useState([]);
    const [idxQuiz, setIdxQuiz] = useState(0);
    const [currentQuiz, setCurrentQuiz] = useState({});
    const [userAnswer, setUserAnswer] = useState('');
    const [isQuizMode, setQuizMode] = useState(false);
    const [isAnswerMode, setAnswerMode] = useState(false);
    // materi
    const [playback, setPlayback] = useState(10);
    const [materi, setMateri] = useState([]);
    const [currentMateri, setCurrentMateri] = useState({});
    const [videoId, setVideoId] = useState('');
    // intro
    const [isIntro, setIntro] = useState(false);
    const [introData, setIntroData] = useState({
        name: '',
        description: '',
        imageUrl: '',
    });
    //sertifikat
    const userName = data?.user?.name;
    const [isCetakSertifikat, setCetakSertifikat] = useState(false);

    // BOOLEAN STATE
    // const [isVideoEnded, setVideoEnded] = useState(false);
    // const [transkripMode, setModeTranskrip] = useState(false);
    // const [isVideoPlaying, setVideoPlaying] = useState(false);
    // const [ulangiQuiz, setUlangiQuiz] = useState(false);

    // FUNC
    const saveBlobToDevice = (blob, fileName) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleEditMateri = (curr, statusCode) => {
        const statusVideo = {
            1: 'selesai',
            2: 'pause',
        };

        const dataUpdate = {
            id_materi_history: currentMateri.id_materi_history,
            id_materi: currentMateri.id_materi,
            playback: curr,
        };

        if (statusVideo[statusCode] === 'selesai') {
            if (currentMateri.status === 'selesai') {
                console.log('ketika video end tidak fetch');
                return;
            }
            const fetchApiUpdateVideoMateri = async () => {
                try {
                    const response = await userUpdateVideoMateri({
                        id_materi_history: dataUpdate.id_materi_history,
                        playback: dataUpdate.playback,
                        is_end: true,
                        token,
                    });

                    console.log('success update selesai materi', response.data);
                    setLoadData(true);
                } catch (error) {
                    console.log('ERROR', error);
                }
            };
            fetchApiUpdateVideoMateri();
            console.log('data', dataUpdate, `dengan status SELESAI`);
        } else if (statusVideo[statusCode] === 'pause') {
            if (currentMateri.status === 'selesai') {
                console.log('ketika pause tidak update');
                return;
            }
            const fetchApiUpdateVideoMateri = async () => {
                try {
                    const response = await userUpdateVideoMateri({
                        id_materi_history: dataUpdate.id_materi_history,
                        playback: dataUpdate.playback,
                        token,
                    });
                    console.log('success update progres materi', response.data);
                    // console.log('current materi: ', currentMateri);
                } catch (error) {
                    console.log('ERROR', error);
                }
            };
            fetchApiUpdateVideoMateri();
            console.log('data', dataUpdate, `dengan status UPDATE`);
        }
    };

    // EFFECTS
    // init recognition
    useEffect(() => {
        try {
            recognition.start();
        } catch (error) {
            recognition.stop();
        }
    }, []);

    useEffect(() => {
        if (token && name) {
            if (loadData) {
                const fetchApiClassEnrollment = async () => {
                    try {
                        const response = await userGetEnroll({
                            namaKelas: name,
                            token,
                        });
                        const kelas = new Kelas({
                            name: response.data.data.kelas.name,
                            image: response.data.data.kelas.image,
                            materi: response.data.data.kelas.materi,
                            description: response.data.data.kelas.description,
                            quiz: response.data.data.kelas.quiz,
                            progress: response.data.data.progress,
                            nilai: response.data.data.nilai,
                            poin: response.data.data.poin,
                            status: response.data.data.status,
                        });

                        // console.log('Qurrent Quiz: ', currentQuiz);

                        if (kelas.materiBerjalan()) {
                            // current data ketika ada materi berjalan
                            setCurrentMateri(kelas.materiBerjalan());
                            setPlayback(kelas.materiBerjalan().playback);
                            setVideoId(getYoutubeVideoId(kelas.materiBerjalan().url));
                        } else {
                            // current data ketika ada materi berakhir
                            setCurrentMateri(kelas.lastMateri());
                            setPlayback(kelas.lastMateri('playback'));
                            setVideoId(getYoutubeVideoId(kelas.lastMateri('url')));
                        }

                        // semua data
                        setMateri(kelas.getMateri());
                        setQuiz(kelas.getQuiz());
                        setProgress(kelas.getProgress());
                        setPoin(kelas.getPoin());
                        setNilai(kelas.getNilai());

                        //cetak sertifikat
                        if (isCetakSertifikat) {
                            speechAction({
                                text: 'Sertifikat sudah didownload!',
                                actionOnEnd: () => {
                                    setCetakSertifikat(false);
                                },
                            });
                            return;
                        }

                        //jika materi playback 0 maka akan masuk intro
                        if (Number(kelas.firstPlaybackMateri()) === 0) {
                            // Kondisi Baru Enroll Kelas sehingga playback masih 0.0
                            setIntro(true);
                            setIntroData({
                                name: kelas.getName(),
                                description: kelas.getDescription(),
                                imageUrl: kelas.getImage(),
                            });

                            speechAction({
                                text: `Selamat datang di Kelas ${name}. Pada kelas ini Anda akan belajar sebanyak ${kelas.getMateriLength()} materi dan mengerjakan ${kelas.getQuizLength()} quiz.`,
                            });

                            speechAction({
                                text: `Pada tahap pertama, kita akan berkenalan dengan kelas ${kelas.getName()}. ${kelas.getDescription()}`,
                            });

                            speechAction({
                                text: `Selanjutnya, kita akan belajar dengan dimulainya materi pertama`,
                                actionOnEnd: () => {
                                    setIntro(false);
                                },
                            });
                            speechAction({
                                text: ` Untuk petunjuk, klik tombol q untuk menjalankan video, dan klik tombol w untuk pause video.`,
                            });
                        } else {
                            // Kondisi sudah ada materi berjalan dengan adanya playback
                            if (kelas.lastMateri('status') === 'belum' || kelas.lastMateri('status') === 'jalan') {
                                // Kondisi materi terakhir 'belum' atau 'jalan'
                                speechAction({
                                    text: `Selamat datang kembali di kelas ${kelas.getName()}. Anda sedang belajar pada materi ke- ${
                                        kelas.idxMateriBerjalan() + 1
                                    }. Jangan lupa klik tombol q untuk menjalankan video, dan klik tombol w untuk pause video. `,
                                });
                            } else if (kelas.lastMateri('status') === 'selesai') {
                                // Kondisi materi terakhir 'selesai'
                                if (isQuizMode) {
                                    //kondisi  mode kerjakan quiz
                                    if (isAnswerMode) {
                                        // kondisi  mode jawab
                                        if (userAnswer) {
                                            // kondisi ada input option user

                                            speechAction({
                                                text: `Anda menjawab ${userAnswer}`,
                                            });

                                            // mencari option id yg dijawab dari user
                                            const answerData = currentQuiz.options.find(
                                                (curr) => curr.kunci.toLowerCase() === userAnswer.toLowerCase(),
                                            );

                                            // data yg akan dikirm
                                            const userAnswerData = {
                                                id_quiz_history: Number(currentQuiz.id_quiz_history),
                                                id_option: Number(answerData.id_option),
                                            };

                                            const fetchApiSendAnswerQuiz = async () => {
                                                try {
                                                    const response = await userSendAnswer({
                                                        id_quiz_history: userAnswerData.id_quiz_history,
                                                        id_option: userAnswerData.id_option,
                                                        token,
                                                    });
                                                    if (!response?.data?.data?.answer) {
                                                        // kondisi jawaban salah
                                                        speechAction({
                                                            text: `Maaf, Jawaban Anda Salah!`,
                                                            actionOnEnd: () => {
                                                                setIdxQuiz(idxQuiz + 1);
                                                                setCurrentQuiz({
                                                                    options: [],
                                                                    question: '',
                                                                });
                                                                setAnswerMode(false);
                                                                setLoadData(true);
                                                                setUserAnswer('');
                                                            },
                                                        });
                                                        return;
                                                    }

                                                    // kondisi jawaban benar
                                                    speechAction({
                                                        text: `Selamat, Jawaban Anda benar!`,
                                                        actionOnEnd: () => {
                                                            setIdxQuiz(idxQuiz + 1);
                                                            setCurrentQuiz({});
                                                            setAnswerMode(false);
                                                            setLoadData(true);
                                                            setUserAnswer('');
                                                        },
                                                    });
                                                } catch (error) {
                                                    if (error instanceof ApiResponseError) {
                                                        console.log(`ERR SEND ANSWER API MESSAGE: `, error.message);
                                                        console.log(error.data);
                                                        return;
                                                    }
                                                    console.log(`MESSAGE: `, error.message);
                                                }
                                            };
                                            fetchApiSendAnswerQuiz();
                                        }
                                    } else {
                                        // kondisi tidak  mode jawab hanya play soal and options
                                        if (idxQuiz >= kelas.getQuizLength()) {
                                            // kondisi quiz habis

                                            speechAction({
                                                text: `Quiz sudah habis!`,
                                                actionOnEnd: () => {
                                                    setQuizMode(false);
                                                    setLoadData(true);
                                                },
                                            });
                                        } else {
                                            // kondisi ada quiz
                                            const currentQuiz = kelas.getQuiz(idxQuiz);
                                            const currentQuizSoal = kelas.getQuiz(idxQuiz).question;
                                            const currentQuizOption = kelas.getQuiz(idxQuiz).options;

                                            console.log('CURRENT QUIZ', currentQuiz);

                                            //  quiz yg berjalan
                                            setCurrentQuiz(currentQuiz);

                                            // soal quiz dibacakan
                                            speechAction({
                                                text: `Soal no ${idxQuiz + 1}. ${currentQuizSoal}`,
                                            });

                                            // option quiz dibacakan
                                            for (let i = 0; i < currentQuizOption.length; i++) {
                                                const userOption = currentQuizOption[i];
                                                speechAction({
                                                    text: `${userOption.kunci}. ${userOption.option}`,
                                                });
                                            }

                                            //ketika sudah dibaca soal maka  mode jawab
                                            speechAction({
                                                text: `Silahkan pilih jawaban`,
                                                actionOnEnd: () => {
                                                    setAnswerMode(true);
                                                },
                                            });
                                        }
                                    }
                                } else {
                                    //kondisi tidak  mode kerjakan quiz
                                    if (kelas.isQuizEnded()) {
                                        //kondisi semua quiz selesai

                                        speechAction({
                                            text: `Selamat, materi dan quiz sudah selesai. Anda saat ini bisa memilih semua materi dan mendapatkan sertifikat dari kelas Anda. `,
                                        });
                                    } else {
                                        //kondisi semua materi selesai dengan tidak  mode kerjakan quiz
                                        speechAction({
                                            text: `Selamat, materi sudah selesai. Anda saat ini bisa mengerjakan quiz!.`,
                                        });
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        if (error instanceof ApiResponseError) {
                            console.log(`ERR CLASS ENROLLMENT API MESSAGE: `, error.message);
                            console.log(error.data);
                            return;
                        }
                        console.log(`MESSAGE: `, error.message);
                    }
                };
                fetchApiClassEnrollment();
            }
        }
        setLoadData(false);
    }, [name, loadData, token, isQuizMode, userAnswer, isAnswerMode, idxQuiz, currentQuiz, isCetakSertifikat]);

    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            const cleanCommand = command?.replace('.', '');

            if (isQuizMode) {
                console.log(`quiz berjalan: `, cleanCommand);
                console.log(`is answer mode: `, isAnswerMode);
                if (isAnswerMode) {
                    if (cleanCommand.includes('ulangi')) {
                        if (cleanCommand.includes('soal')) {
                            speechAction({
                                text: `Soal nomor ${idxQuiz + 1} akan dibaca ulang`,
                                actionOnEnd: () => {
                                    setAnswerMode(false);
                                    setLoadData(true);
                                    setQuizMode(true);
                                },
                            });
                        }
                    } else if (cleanCommand.includes('pilih')) {
                        const quizCommand = cleanCommand.replace('pilih', '').trim().toLowerCase();
                        if (quizCommand === 'a') {
                            console.log('Anda memilih A');
                            setUserAnswer('A');
                            setLoadData(true);
                        } else if (quizCommand === 'b') {
                            console.log('Anda memilih B');
                            setUserAnswer('B');
                            setLoadData(true);
                        } else if (quizCommand === 'c') {
                            console.log('Anda memilih C');
                            setUserAnswer('C');
                            setLoadData(true);
                        }
                    } else if (cleanCommand.includes('hentikan')) {
                        if (
                            cleanCommand.includes('quiz') ||
                            cleanCommand.includes('quis') ||
                            cleanCommand.includes('kuis') ||
                            cleanCommand.includes('kuiz')
                        ) {
                            const listQuiz = new ListQuiz({
                                listQuiz: quiz,
                            });
                            speechAction({
                                text: `Anda berhenti untuk menjawab quiz di soal ke ${idxQuiz + 1}`,
                                actionOnEnd: () => {
                                    if (listQuiz.getIdxQuizBerjalan() === -1) {
                                        setIdxQuiz(0);
                                    } else {
                                        setIdxQuiz(listQuiz.getIdxQuizBerjalan());
                                    }
                                    setUserAnswer('');
                                    setAnswerMode(false);
                                    setQuizMode(false);
                                    setLoadData(true);
                                },
                            });
                        }
                    } else if (
                        cleanCommand.includes('saya sekarang dimana') ||
                        cleanCommand.includes('saya sekarang di mana') ||
                        cleanCommand.includes('saya di mana') ||
                        cleanCommand.includes('saya dimana')
                    ) {
                        speechAction({
                            text: `Kita sedang dalam mode quiz di halaman pembelajaran`,
                        });
                    }
                }
            } else if (cleanCommand.includes('kerjakan')) {
                if (
                    cleanCommand.includes('quiz') ||
                    cleanCommand.includes('quis') ||
                    cleanCommand.includes('kuis') ||
                    cleanCommand.includes('kuiz')
                ) {
                    const listMateri = new ListMateri({
                        listMateri: materi,
                    });

                    const listQuiz = new ListQuiz({
                        listQuiz: quiz,
                    });

                    if (listMateri.getMateriBerjalan()) {
                        speechAction({
                            text: `Anda tidak bisa mengerjakan quiz karena masih ada ${
                                listMateri.getList().length - listMateri.getMateriSelesai().length
                            } materi yang belum diselesaikan.`,
                        });
                        return;
                    }

                    if (listQuiz.getIdxQuizBerjalan() === -1) {
                        speechAction({
                            text: `Quiz Anda sudah selesai!`,
                        });
                        return;
                    }

                    if (listQuiz.getIdxQuizBerjalan() > 0) {
                        speechAction({
                            text: `Anda melanjutkan mengerjakan quiz ke- ${listQuiz.getIdxQuizBerjalan() + 1}`,
                            actionOnEnd: () => {
                                setIdxQuiz(listQuiz.getIdxQuizBerjalan());
                                setQuizMode(true);
                                setLoadData(true);
                            },
                        });
                        return;
                    }

                    speechAction({
                        text: `Anda akan mengerjakan quiz pertama`,
                        actionOnEnd: () => {
                            setQuizMode(true);
                            setLoadData(true);
                        },
                    });
                }
            } else if (cleanCommand.includes('pilih')) {
                if (cleanCommand.includes('materi')) {
                    const materiCommand = cleanCommand.replace('pilih materi', '').trim().toLowerCase();
                    const materiIdx = convertStringToNum(materiCommand) - 1;
                    const listMateri = new ListMateri({
                        listMateri: materi,
                    });
                    const findMateri = listMateri.getMateriByIdx(materiIdx);
                    const findIndexMateriBerjalan = listMateri.getIdxMateriBerjalan();
                    // const findMateri = materi.find((_, index) => index === materiIdx);
                    // const findIndexMateriBerjalan = materi.findIndex((m) => m.status === 'jalan');

                    if (!findMateri) {
                        speechAction({
                            text: `Materi ke ${materiIdx + 1} tidak ditemukan, perlu diperhatikan jumlah materi sampai ${
                                materi.length
                            }!`,
                        });
                        return;
                    }

                    if (materiCommand === 'sekarang') {
                        speechAction({
                            text: `Anda akan memilih materi sekarang atau materi yang sedang berjalan`,
                            actionOnEnd: () => {
                                const fetchApiClassEnrollment = async () => {
                                    try {
                                        const response = await userGetEnroll({
                                            namaKelas: name,
                                            token,
                                        });
                                        const materiBerjalan = response.data.data.kelas.materi.find(
                                            (materiItem) => materiItem.status === 'jalan',
                                        );

                                        if (!materiBerjalan) {
                                            speechAction({
                                                text: `Materi telah selesai semua!`,
                                            });
                                            return;
                                        }

                                        speechAction({
                                            text: `Anda sedang belajar materi sekarang atau materi yang sedang berjalan.  Jangan lupa klik tombol q untuk menjalankan video, dan klik tombol w untuk pause video.`,
                                            actionOnStart: () => {
                                                setCurrentMateri(materiBerjalan);
                                                setPlayback(materiBerjalan.playback);
                                                setVideoId(getYoutubeVideoId(materiBerjalan.url));
                                            },
                                        });
                                    } catch (error) {
                                        if (error instanceof ApiResponseError) {
                                            console.log(`ERR CLASS ENROLLMENT API FROM MATERI SEKARANG MESSAGE: `, error.message);
                                            console.log(error.data);
                                            return;
                                        }
                                        console.log(`MESSAGE: `, error.message);
                                    }
                                };
                                fetchApiClassEnrollment();
                            },
                        });
                        return;
                    }

                    if (findMateri.status === 'belum') {
                        speechAction({
                            text: `Materi ke ${materiIdx + 1} tidak dapat diakses. Anda perlu menyelesaikan materi sampai ${
                                materi.length
                            } dan sekarang Anda sedang di materi ke ${findIndexMateriBerjalan + 1}`,
                        });
                        return;
                    }

                    speechAction({
                        text: `Anda akan memilih materi ke ${materiIdx + 1}`,
                        actionOnEnd: () => {
                            setCurrentMateri(findMateri);
                            setPlayback(0);
                            setVideoId(getYoutubeVideoId(findMateri.url));
                            speechAction({
                                text: `Anda belajar lagi materi ke ${
                                    materiIdx + 1
                                }.  Jangan lupa klik tombol q untuk menjalankan video, dan klik tombol w untuk pause video.`,
                            });
                        },
                    });
                }
            } else if (cleanCommand.includes('pergi')) {
                if (cleanCommand.includes('kelas')) {
                    speechAction({
                        text: `Anda akan menuju halaman Daftar Kelas`,
                        actionOnEnd: () => {
                            router.push('/kelas');
                        },
                    });
                } else if (cleanCommand.includes('beranda')) {
                    speechAction({
                        text: `Anda akan menuju halaman beranda`,
                        actionOnEnd: () => {
                            router.push('/');
                        },
                    });
                } else if (cleanCommand.includes('rapor')) {
                    speechAction({
                        text: `Anda akan menuju halaman Rapor`,
                        actionOnEnd: () => {
                            router.push('/rapor');
                        },
                    });
                } else if (cleanCommand.includes('peringkat')) {
                    // moving to /peringkat
                    speechAction({
                        text: 'Anda akan menuju halaman Peringkat',
                        actionOnEnd: () => {
                            router.push('/peringkat');
                        },
                    });
                }
            } else if (cleanCommand.includes('muat')) {
                if (cleanCommand.includes('ulang')) {
                    if (cleanCommand.includes('halaman')) {
                        const listQuiz = new ListQuiz({
                            listQuiz: quiz,
                        });

                        speechAction({
                            text: `Anda akan load halaman ini!`,
                            actionOnEnd: () => {
                                if (listQuiz.getIdxQuizBerjalan() === -1) {
                                    setIdxQuiz(0);
                                } else {
                                    setIdxQuiz(listQuiz.getIdxQuizBerjalan());
                                }
                                setUserAnswer('');
                                setLoadData(true);
                                setQuizMode(false);
                            },
                        });
                    }
                }
            } else if (cleanCommand.includes('cetak')) {
                if (cleanCommand.includes('sertifikat')) {
                    speechAction({
                        text: 'Anda akan mendapatkan sertifikat JavaScript',
                        actionOnEnd: () => {
                            setCetakSertifikat(true);
                            setLoadData(true);
                        },
                    });
                }
            } else if (
                cleanCommand.includes('saya sekarang dimana') ||
                cleanCommand.includes('saya sekarang di mana') ||
                cleanCommand.includes('saya di mana') ||
                cleanCommand.includes('saya dimana')
            ) {
                speechAction({
                    text: `Kita sedang di halaman pembelajaran`,
                });
            }
            console.log(cleanCommand);
        };

        recognition.onend = () => {
            recognition.start();
        };
    }, [router, materi, name, token, isAnswerMode, isQuizMode, quiz, idxQuiz]);

    return (
        <div className='h-screen bg-[#EDF3F3]'>
            <nav className={` fixed top-0 z-20 w-screen  bg-[#EDF3F3] py-[20px]`}>
                <div className='mx-auto flex max-w-screen-xl items-center justify-between '>
                    <HeroIcon alt='icons' imgUrl={'/images/voice-icon.svg'} height={100} width={100} />
                    <div className=' flex items-center gap-[200px]'>
                        <div className='flex items-center gap-[20px] '>
                            <div className='flex items-center gap-[14px]'>
                                <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full  border-[4px] border-black  p-3 font-bold'>
                                    C
                                </div>{' '}
                                <span className=' text-[16px] font-bold leading-[20px]'>{poin}</span>
                            </div>
                            <div className='flex items-center gap-[14px]'>
                                <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full  border-[4px] border-black  p-3 font-bold'>
                                    N
                                </div>{' '}
                                <span className=' text-[16px] font-bold leading-[20px]'>{nilai}</span>
                            </div>
                            <div className='flex items-center gap-[14px]'>
                                <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full  border-[4px] border-black  p-3 font-bold'>
                                    P
                                </div>{' '}
                                <span className=' text-[16px] font-bold leading-[20px]'>{progress}% </span>
                            </div>
                        </div>
                        <NavbarButton />
                    </div>
                </div>
            </nav>
            <div style={{ height: 'calc(100vh - 88px)' }} className='mx-auto grid max-w-screen-xl grid-cols-12 gap-5 pt-[92px]'>
                <div style={{ height: 'calc(100vh - 110px)' }} className='col-span-3  rounded-[20px]  bg-white p-[24px]'>
                    <div style={{ height: 'calc(100vh - 150px)' }} className='rounded-[10px] p-[16px]'>
                        <div className='rounded-[10px] bg-[#E7A645] p-[16px]'>
                            <h1 className='font-bold text-white'>Persiapan Kelas</h1>
                            <p className='text-[12px] text-white'>Trailer Kelas</p>
                        </div>
                        <div
                            style={{ height: 'calc(100vh - 270px)' }}
                            className='mt-[20px]  flex flex-col gap-[10px] rounded-[10px] bg-[#E7A645] p-[16px]'>
                            <div style={{ height: 'calc(100vh - 400px)' }} className='overflow-y-scroll '>
                                <div>
                                    <h1 className='font-bold text-white'>Materi</h1>
                                    <p className='text-[12px] text-white'>{materi.length} Video</p>
                                </div>
                                <div className='mt-[18px] flex flex-col gap-3'>
                                    {materi &&
                                        materi.map((item, index) => {
                                            return (
                                                <div
                                                    key={index}
                                                    className={`${
                                                        item.status === 'selesai' || (item.status === 'jalan' && !isIntro)
                                                            ? 'bg-[#CF8618] text-white'
                                                            : 'bg-white text-[#CF8618]'
                                                    }  flex items-center gap-[8px] rounded-[10px]  p-[20px] font-bold  `}>
                                                    <MdPlayCircleOutline className='h-[20px] w-[20px]' />{' '}
                                                    <span>Video {index + 1}</span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            <div style={{ height: 'calc(100vh - 500px)' }} className='overflow-y-scroll '>
                                <div className='mt-[18px]'>
                                    <h1 className='font-bold text-white'>Quiz</h1>
                                    <p className='text-[12px] text-white'>{quiz.length} soal</p>
                                </div>
                                <div className='mt-[10px] flex flex-col gap-3'>
                                    {quiz &&
                                        quiz.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`${
                                                    item.status === 'selesai'
                                                        ? 'bg-[#CF8618] text-white'
                                                        : 'bg-white text-[#CF8618]'
                                                } flex items-center gap-[8px] rounded-[10px]  p-[20px] font-bold `}>
                                                <MdOutlineQuestionAnswer className='h-[20px] w-[20px]' />{' '}
                                                <span>Soal {index + 1}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-span-9 h-[500px] w-full overflow-hidden overflow-y-scroll rounded-[20px]'>
                    <>
                        {isIntro && !isQuizMode && (
                            <div style={{ height: 'calc(100vh - 88px)' }} className=' bg-white p-[20px]'>
                                <h1 className='text-[46px] font-bold leading-[57px]'>Kelas {introData?.name}</h1>
                                <div className='mt-[40px] '>
                                    <Image
                                        alt=''
                                        src={getImageFile(introData?.imageUrl)}
                                        width={300}
                                        height={300}
                                        className='rounded-rad-5'
                                    />
                                    <div className='mt-[20px]'>
                                        <h3 className='text-[24px] font-bold leading-[32px]'>Deskripsi</h3>
                                        <p className='mt-[10px] text-[18px] leading-[32px]'>{introData?.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {videoId && !isIntro && !isQuizMode && (
                            <div className='h-full w-full'>
                                <VideoFrame handleEditMateri={handleEditMateri} playback={playback} videoId={videoId} />
                            </div>
                        )}

                        {Object.keys(currentQuiz).length > 0 && isQuizMode && (
                            <div>
                                <h1 className='mt-[20px] text-center text-[60px] font-bold leading-[48px]'>Quiz</h1>
                                {currentQuiz?.question && (
                                    <div className='mt-[60px] flex  items-start gap-[20px]'>
                                        <div className='flex h-[46px] w-[46px] items-center justify-center rounded-full bg-secondary-1 text-[20px] font-bold leading-[20px] text-white'>
                                            {idxQuiz + 1}
                                        </div>
                                        <div>
                                            <p className='text-[20px] font-semibold leading-[20px]'> {currentQuiz.question}</p>
                                            <div className='mt-[36px] flex flex-col gap-[18px]'>
                                                {currentQuiz.options.map((op, idx) => {
                                                    return (
                                                        <div key={idx + 1} className='flex items-center gap-[20px]'>
                                                            <div
                                                                className={`${
                                                                    op.kunci.toLowerCase() === userAnswer.toLowerCase()
                                                                        ? ''
                                                                        : 'bg-opacity-60'
                                                                } flex h-[30px] w-[30px] items-center justify-center rounded-[6px] bg-secondary-1  text-[18px] font-bold leading-[18px] text-white`}>
                                                                {op.kunci}
                                                            </div>
                                                            <p
                                                                className={`${
                                                                    op.kunci.toLowerCase() === userAnswer.toLowerCase()
                                                                        ? 'font-bold '
                                                                        : 'font-medium'
                                                                }`}>
                                                                {op.option}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {isCetakSertifikat && (
                            <div>
                                {/* <div style={{ width: '100%', height: '80vh' }}>
                                    <PDFViewer width='100%' height='100%'>
                                        <Certificate name={'arief'} kelas={'JavaScript'} />
                                    </PDFViewer>
                                </div> */}
                                <PDFDownloadLink
                                    document={<Certificate name={'arief'} kelas={'JavaScript'} />}
                                    // fileName="Jamal Certificate.pdf"
                                >
                                    {({ blob, url, loading, error }) => {
                                        if (loading) {
                                            return 'Loading document...';
                                        } else if (error) {
                                            return `Error: ${error}`;
                                        } else if (blob) {
                                            // auto download
                                            saveBlobToDevice(blob, `${userName} Certificate.pdf`);
                                            // setCetakSertifikat(false);
                                            return null;
                                            // return setCetakSertifikat(false);
                                        }
                                    }}
                                </PDFDownloadLink>
                            </div>
                        )}
                    </>
                </div>
            </div>
        </div>
    );
};

export default EnrollKelas;
