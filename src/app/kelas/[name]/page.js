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
import { useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useCallback } from 'react';

// third party
import { useSession } from 'next-auth/react';
import { MdPlayCircleOutline, MdOutlineQuestionAnswer } from 'react-icons/md';
import { PDFDownloadLink } from '@react-pdf/renderer/lib/react-pdf.browser.es.js';
import * as tf from '@tensorflow/tfjs';

// redux
import { useDispatch, useSelector } from 'react-redux';
import { checkPermissionSlice, getIsPermit } from '@/redux/check-permission';

// components
import HeroIcon from '@/components/HeroIcon';
import NavbarButton from '@/components/NavbarButton';
import VideoFrame from '@/components/VideoFrame';
import Certificate from '@/components/Certificate';
import Transkrip from '@/components/Transkrip';
import MateriPoinNotification from '@/components/MateriPointNotification';
import CheckPermission from '@/components/CheckPermission';

// datas
import { Kelas, ListMateri, ListQuiz } from '@/data/model';

// apis
import axios from 'axios';
import { userGetEnroll, userSendAnswer, userUpdateVideoMateri } from '@/axios/user';

// utils
import { recognition } from '@/utils/speech-recognition';
import { speechAction, speechWithBatch, stopSpeech } from '@/utils/text-to-speech';
import { getYoutubeVideoId } from '@/utils/get-youtube-videoId';
import { getImageFile } from '@/utils/get-server-storage';
import { convertStringToNum } from '@/utils/convert-stringNum-to-num';
import { ApiResponseError } from '@/utils/error-handling';
import { buttonAction } from '@/utils/space-button-action';
import { punctuationRemoval, stemming, removeStopwords } from '@/utils/special-text';
import { calculateTFIDFWithWeights } from '@/utils/tfidf';

//hooks
import { useCheckReloadPage, useMovePage, useMl, useCheckScreenOrientation } from '@/hooks';
import { browserPermission } from '@/utils/browserPermission';

// not related state function
const saveBlobToDevice = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
};

export default function EnrollKelasPage() {
    /* SETUP */
    const { data } = useSession();
    const token = data?.user?.token;
    const userName = data?.user?.name;
    const pathname = usePathname();
    const { name } = useParams();

    /* REDUX */
    const dispatch = useDispatch();
    const isPermit = useSelector(getIsPermit);
    const { setIsPermit, setMicrophoneStatus, setCameraStatus } = checkPermissionSlice.actions;

    /* CUSTOM HOOKS */
    const { sessioName } = useCheckReloadPage({ name: pathname });
    const { handleMovePage } = useMovePage(sessioName);
    const { windowSize } = useCheckScreenOrientation();
    const { model, vocab, labelEncoder } = useMl();

    /* COMMON STATE */
    // load data
    const [poinNotif, setPoinNotif] = useState(0);
    const [isVisible, setVisible] = useState(false);
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
    const [isCetakSertifikat, setCetakSertifikat] = useState(false);
    const [enrollClassName, setEnrollClassName] = useState('');
    const [statusKelas, setStatusKelas] = useState('');

    /* ACCESSIBILITY STATE */
    const [speechOn, setSpeechOn] = useState(false); // state untuk  speech recognition
    const [transcript, setTrancript] = useState(''); // state untuk menyimpan transcript hasil speech recognition
    const [skipSpeech, setSkipSpeech] = useState(false); // state untuk  mengatasi speech recogniton ter-trigger
    const [displayTranscript, setDisplayTranscript] = useState(false); // state untuk  menampilkan transcript
    const [isClickButton, setIsClickButton] = useState(false); // state untuk aksi tombol
    const [isPlayIntruction, setIsPlayIntruction] = useState(false); // state  ketika intruksi berjalan

    /* FUNCTION */
    // This func related with state
    const handleNotifAction = useCallback(() => {
        // setPoinNotif(poin);
        setVisible(!isVisible);
    }, [isVisible]);

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
                // console.log('ketika video end tidak fetch');
                return;
            }
            const fetchApiUpdateVideoMateri = async () => {
                try {
                    // const response = await userUpdateVideoMateri({
                    //     id_materi_history: dataUpdate.id_materi_history,
                    //     playback: dataUpdate.playback,
                    //     is_end: true,
                    //     token,
                    // });
                    await userUpdateVideoMateri({
                        id_materi_history: dataUpdate.id_materi_history,
                        playback: dataUpdate.playback,
                        is_end: true,
                        token,
                    });

                    //console.log('success update selesai materi', response.data);
                    setLoadData(true);
                } catch (error) {
                    //console.log('ERROR', error);
                }
            };
            fetchApiUpdateVideoMateri();
            //console.log('data', dataUpdate, `dengan status SELESAI`);
        } else if (statusVideo[statusCode] === 'pause') {
            if (currentMateri.status === 'selesai') {
                //console.log('ketika pause tidak update');
                return;
            }
            const fetchApiUpdateVideoMateri = async () => {
                try {
                    // const response = await userUpdateVideoMateri({
                    //     id_materi_history: dataUpdate.id_materi_history,
                    //     playback: dataUpdate.playback,
                    //     token,
                    // });
                    await userUpdateVideoMateri({
                        id_materi_history: dataUpdate.id_materi_history,
                        playback: dataUpdate.playback,
                        token,
                    });
                    //console.log('success update progres materi', response.data);
                } catch (error) {
                    //console.log('ERROR', error);
                }
            };
            fetchApiUpdateVideoMateri();
            //console.log('data', dataUpdate, `dengan status UPDATE`);
        }
    };

    /* EFFECTS */
    // Processing Accesing browser with browser url
    useEffect(() => {
        const deleteSessionReload = () => {
            console.log('it worked kelas belajar');
            dispatch(setIsPermit(false));
            sessionStorage.removeItem(sessioName);
        };

        window.addEventListener('pageshow', deleteSessionReload);

        return () => {
            window.removeEventListener('pageshow', deleteSessionReload);
        };
    }, [sessioName, dispatch, setIsPermit]);

    // Gain Browser Permission
    useEffect(() => {
        // camera permission
        browserPermission('camera', (browserPermit) => {
            if (browserPermit.error && !browserPermit.state) {
                // console.log('Error perizinan Camera: ', browserPermit.error);
            } else {
                dispatch(setCameraStatus(browserPermit.state));
            }
        });

        // microphone permission
        browserPermission('microphone', (browserPermit) => {
            if (browserPermit.error && !browserPermit.state) {
                // console.log('Error perizinan Microphone: ', browserPermit.error);
            } else {
                dispatch(setMicrophoneStatus(browserPermit.state));
            }
        });
    }, [dispatch, setCameraStatus, setMicrophoneStatus]);

    // Init speech recognition
    useEffect(() => {
        try {
            recognition.start();
        } catch (error) {
            recognition.stop();
        }
    }, []);

    // Load Data
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
                            id_enrollment: response.data.data.id_enrollment,
                            name: response.data.data.kelas.name,
                            image: response.data.data.kelas.image,
                            materi: response.data.data.kelas.materi,
                            description: response.data.data.kelas.description,
                            quiz: response.data.data.kelas.quiz,
                            progress: response.data.data.progress,
                            nilai: response.data.data.nilai,
                            poin: response.data.data.poin,
                            status: response.data.data.status,
                            quiz_count: response.data.data.quiz_count,
                        });

                        //console.log('Qurrent Response: ', response);
                        //console.log('Qurrent Id Enrollment: ', kelas.getIdxEnrollment());

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
                        setEnrollClassName(kelas.getName());
                        setMateri(kelas.getMateri());
                        setQuiz(kelas.getQuiz());
                        setProgress(kelas.getProgress());
                        setPoin(kelas.getPoin());
                        setNilai(kelas.getNilai());
                        setStatusKelas(kelas.getStatusKelas());

                        //cetak sertifikat
                        if (isCetakSertifikat) {
                            speechAction({
                                text: 'Sertifikat sudah didownload!',
                                actionOnEnd: () => {
                                    setCetakSertifikat(false);
                                },
                            });
                        } else if (Number(kelas.firstPlaybackMateri()) === 0) {
                            //jika materi playback 0 maka akan masuk intro
                            // Kondisi Baru Enroll Kelas sehingga playback masih 0.0
                            setIntro(true);
                            setIntroData({
                                name: kelas.getName(),
                                description: kelas.getDescription(),
                                imageUrl: kelas.getImage(),
                            });

                            speechWithBatch({
                                speechs: [
                                    {
                                        text: `Selamat datang di Kelas ${name}. Pada kelas ini Anda akan belajar sebanyak ${kelas.getMateriLength()} materi dan mengerjakan ${kelas.getQuizLength()} quiz.`,
                                        actionOnStart: () => {
                                            setSkipSpeech(true);
                                        },
                                    },
                                    {
                                        text: `Sebelum Anda memulai pembelajaran, ada beberapa instruksi yang wajib Anda pahami. `,
                                    },
                                    {
                                        text: `Dalam pembelajaran ini, untuk memulai materi, Anda dapat  menekan tombol spasi, dan untuk menjeda materi Anda dapat menekan kembali tombol spasi`,
                                    },
                                    {
                                        text: `Setelah materi selesai, Anda dapat mengerjakan quiz dengan mengucapkan perintah kerjakan quiz `,
                                    },
                                    {
                                        text: `Setelah soal dibacakan, Anda dapat memilih pilihan jawaban yang menurut Anda benar dengan mengucapkan pilih a, b, atau c`,
                                    },
                                    {
                                        text: `Pada tahap pertama, kita akan berkenalan dengan kelas ${kelas.getName()}. ${kelas.getDescription()}`,
                                    },
                                    {
                                        text: `Selanjutnya, kita akan belajar dengan dimulainya materi pertama. Jangan lupa tekan tombol spasi untuk memulai materi`,
                                    },
                                    {
                                        text: 'Jika Anda masih bingung, Anda bisa ucapkan intruksi agar mendapatkan penjelasan lebih banyak.',
                                        actionOnEnd: () => {
                                            setIsClickButton(true);
                                            setIntro(false);
                                            // setIntroPage(false);
                                            setSkipSpeech(false);
                                        },
                                    },
                                ],
                            });
                        } else {
                            setIsClickButton(true);
                            // Kondisi sudah ada materi berjalan dengan adanya playback
                            if (kelas.lastMateri('status') === 'belum' || kelas.lastMateri('status') === 'jalan') {
                                // Kondisi materi terakhir 'belum' atau 'jalan'
                                if (poin !== kelas.getPoin()) {
                                    if (kelas.materiBerjalan().playback > 0) {
                                        speechAction({
                                            text: `Selamat datang kembali di kelas ${kelas.getName()}. Anda sedang belajar pada materi ke- ${
                                                kelas.idxMateriBerjalan() + 1
                                            }. Jangan lupa klik tombol spasi untuk menjalankan materi, dan klik kembali tombol spasi  untuk pause materi. `,
                                        });
                                    } else {
                                        console.log(kelas);
                                        console.log(poin);
                                        console.log(kelas.idxMateriBerjalan());
                                        if (poin == 0 && kelas.idxMateriBerjalan() > 0) {
                                            speechWithBatch({
                                                speechs: [
                                                    {
                                                        text: `Selamat datang kembali di kelas ${kelas.getName()}. Anda sedang belajar pada materi ke- ${
                                                            kelas.idxMateriBerjalan() + 1
                                                        }. Jangan lupa klik tombol spasi untuk menjalankan materi, dan klik kembali tombol spasi  untuk pause materi. `,
                                                    },
                                                ],
                                            });
                                        } else {
                                            setPoinNotif(kelas.getPoin() - poin);
                                            handleNotifAction();
                                            //console.log('Playback: ');
                                            speechWithBatch({
                                                speechs: [
                                                    {
                                                        text: `Selamat Kamu Mendapat ${kelas.getPoin() - poin} Poin !`,
                                                    },
                                                    {
                                                        text: `Selamat datang kembali di kelas ${kelas.getName()}. Anda sedang belajar pada materi ke- ${
                                                            kelas.idxMateriBerjalan() + 1
                                                        }. Jangan lupa klik tombol spasi untuk menjalankan materi, dan klik kembali tombol spasi  untuk pause materi. `,
                                                    },
                                                ],
                                            });
                                        }

                                        //console.log('Selamat Anda mendapatkan poin sebanyak:  ', kelas.getPoin() - poin);
                                    }
                                } else {
                                    speechAction({
                                        text: `Selamat datang kembali di kelas ${kelas.getName()}. Anda sedang belajar pada materi ke- ${
                                            kelas.idxMateriBerjalan() + 1
                                        }. Jangan lupa klik tombol spasi untuk menjalankan materi, dan klik kembali tombol spasi  untuk pause materi. `,
                                    });
                                    //console.log(' Anda masih belajar dikelas ini');
                                }
                                // speechAction({
                                //     text: `Selamat datang kembali di kelas ${kelas.getName()}. Anda sedang belajar pada materi ke- ${
                                //         kelas.idxMateriBerjalan() + 1
                                //     }. Jangan lupa klik tombol spasi untuk menjalankan materi, dan klik kembali tombol spasi  untuk pause materi. `,
                                // });
                            } else if (kelas.lastMateri('status') === 'selesai') {
                                // Kondisi materi terakhir 'selesai'
                                if (isQuizMode) {
                                    //kondisi  mode kerjakan quiz
                                    if (isAnswerMode) {
                                        // kondisi  mode jawab
                                        if (userAnswer) {
                                            // kondisi ada input option user

                                            // mencari option id yg dijawab dari user
                                            const answerData = currentQuiz.options.find(
                                                (curr) => curr.kunci.toLowerCase() === userAnswer.toLowerCase(),
                                            );

                                            // data yg akan dikirm
                                            const userAnswerData = {
                                                id_quiz_history: Number(currentQuiz.id_quiz_history),
                                                id_option: Number(answerData.id_option),
                                            };

                                            // mengirimkan jawaban ke server
                                            if (idxQuiz !== kelas.getQuizLength() - 1) {
                                                const fetchApiSendAnswerQuiz = async () => {
                                                    try {
                                                        // const response = await userSendAnswer({
                                                        //     id_quiz_history: userAnswerData.id_quiz_history,
                                                        //     id_option: userAnswerData.id_option,
                                                        //     token,
                                                        // });
                                                        await userSendAnswer({
                                                            id_quiz_history: userAnswerData.id_quiz_history,
                                                            id_option: userAnswerData.id_option,
                                                            token,
                                                        });

                                                        // if (!response?.data?.data?.answer) {
                                                        //     // kondisi jawaban salah
                                                        //     speechAction({
                                                        //         text: `Anda menjawab ${userAnswer}`,
                                                        //         actionOnEnd: () => {
                                                        //             setIdxQuiz(idxQuiz + 1);
                                                        //             setCurrentQuiz({
                                                        //                 options: [],
                                                        //                 question: '',
                                                        //             });
                                                        //             setAnswerMode(false);
                                                        //             setLoadData(true);
                                                        //             setUserAnswer('');
                                                        //         },
                                                        //     });
                                                        //     return;
                                                        // }

                                                        // kondisi jawaban benar
                                                        speechAction({
                                                            text: `Anda menjawab ${userAnswer}`,
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
                                                    } catch (error) {
                                                        if (error instanceof ApiResponseError) {
                                                            //console.log(`ERR SEND ANSWER API MESSAGE: `, error.message);
                                                            //console.log(error.data);
                                                            return;
                                                        }
                                                        //console.log(`MESSAGE: `, error.message);
                                                    }
                                                };
                                                fetchApiSendAnswerQuiz();
                                            }

                                            // jika quiz terakhir, maka akan sampaikan rekap nilai
                                            if (idxQuiz === kelas.getQuizLength() - 1) {
                                                //console.log('QUIZ terakhir');
                                                const fetchApiSendAnswerQuiz = async () => {
                                                    try {
                                                        await userSendAnswer({
                                                            id_quiz_history: userAnswerData.id_quiz_history,
                                                            id_option: userAnswerData.id_option,
                                                            token,
                                                        });

                                                        const responseLast = await axios.get(
                                                            `https://nurz.site/api/user/enrollment/rekap/${kelas.getIdxEnrollment()}`,
                                                            {
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    Authorization: `Bearer ${token}`,
                                                                },
                                                            },
                                                        );

                                                        const dts = responseLast?.data?.data;
                                                        //console.log('MY ANSWER: ', userAnswer);
                                                        //console.log('MY ANSWER DATA: ', userAnswerData);
                                                        //console.log('NILAI: ', kelas.getNilai());
                                                        //console.log('RESPONSE: ', dts);
                                                        setNilai(dts.nilai);

                                                        if (!dts?.ulang) {
                                                            speechWithBatch({
                                                                speechs: [
                                                                    {
                                                                        text: `Anda menjawab ${userAnswer}`,
                                                                    },
                                                                    {
                                                                        text: 'Karena ini adalah quiz terakhir, Saya akan menyampaikan hasil quiz Anda!',
                                                                    },
                                                                    {
                                                                        text: 'Berikut ini adalah history jawaban Anda',
                                                                    },
                                                                ],
                                                            });

                                                            for (let i = 0; i < dts?.jawaban?.length; i++) {
                                                                speechAction({
                                                                    text: `Pada soal ke ${i + 1} Anda menjawab ${
                                                                        dts?.jawaban[i]?.kunci
                                                                    }`,
                                                                });
                                                            }

                                                            speechAction({
                                                                text: `Selamat, nilai akhir Anda ${
                                                                    dts.nilai
                                                                } sehingga Anda lulus kelas ${kelas.getName()}.`,
                                                                actionOnEnd: () => {
                                                                    setDisplayTranscript(false);
                                                                    //console.log('Response last materi', responseLast);
                                                                    setIdxQuiz(idxQuiz + 1);
                                                                    setCurrentQuiz({
                                                                        options: [],
                                                                        question: '',
                                                                    });
                                                                    setUserAnswer('');
                                                                    setAnswerMode(false);
                                                                    setQuizMode(false);
                                                                    setLoadData(true);
                                                                },
                                                            });
                                                        }

                                                        if (dts.ulang) {
                                                            speechWithBatch({
                                                                speechs: [
                                                                    {
                                                                        text: `Anda menjawab ${userAnswer}`,
                                                                    },
                                                                    {
                                                                        text: 'Karena ini adalah quiz terakhir, Saya akan menyampaikan hasil quiz Anda!',
                                                                    },
                                                                    {
                                                                        text: 'Berikut ini adalah history jawaban Anda',
                                                                    },
                                                                ],
                                                            });

                                                            for (let i = 0; i < dts?.jawaban?.length; i++) {
                                                                speechAction({
                                                                    text: `Pada soal ke ${i + 1} Anda menjawab ${
                                                                        dts?.jawaban[i]?.kunci
                                                                    }`,
                                                                });
                                                            }

                                                            speechAction({
                                                                text: `Sayang sekali, nilai akhir Anda ${dts.nilai} sehingga Anda wajib mengulang mengerjakan quiz. Tetap semangat yaa`,
                                                                actionOnEnd: () => {
                                                                    setDisplayTranscript(false);
                                                                    //console.log('Response last materi', responseLast);
                                                                    setIdxQuiz(0);
                                                                    setCurrentQuiz({
                                                                        options: [],
                                                                        question: '',
                                                                    });
                                                                    setUserAnswer('');
                                                                    setAnswerMode(false);
                                                                    setQuizMode(false);
                                                                    setLoadData(true);
                                                                },
                                                            });
                                                        }
                                                    } catch (error) {
                                                        if (error instanceof ApiResponseError) {
                                                            //console.log(`ERR SEND ANSWER API MESSAGE: `, error.message);
                                                            //console.log(error.data);
                                                            return;
                                                        }
                                                        //console.log(`MESSAGE: `, error.message);
                                                    }
                                                };
                                                fetchApiSendAnswerQuiz();
                                            }
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

                                            //console.log('CURRENT QUIZ', currentQuiz);

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
                                        // speechAction({
                                        //     text: `Selamat ${userName}, materi dan quiz sudah selesai. Anda saat ini bisa memilih semua materi dan mendapatkan sertifikat dari kelas Anda. `,
                                        // });
                                        speechWithBatch({
                                            speechs: [
                                                {
                                                    text: `Selamat ${userName}, materi dan quiz sudah selesai. Anda saat ini bisa memilih semua materi dan mendapatkan sertifikat dari kelas Anda. `,
                                                    actionOnStart: () => {
                                                        setSkipSpeech(true);
                                                    },
                                                },
                                                {
                                                    text: `Untuk mencetak sertifikat Anda dapat ucapkan cetak sertifikat`,
                                                    actionOnEnd: () => {
                                                        setSkipSpeech(false);
                                                    },
                                                },
                                            ],
                                        });
                                    } else {
                                        if (kelas.getQuizCount() === 0) {
                                            //kondisi semua materi selesai dengan tidak  mode kerjakan quiz
                                            speechWithBatch({
                                                speechs: [
                                                    {
                                                        text: `Selamat, materi sudah selesai. Anda saat ini bisa mengerjakan quiz, ucapkan perintah kerjakan quiz, Agar bisa mengerjakan quiz `,
                                                        actionOnStart: () => {
                                                            setSkipSpeech(true);
                                                        },
                                                    },
                                                    {
                                                        text: 'Jangan lupa untuk panggil saya terlebih dahulu dengan hai atau halo uli.agar saya bisa mendengar Anda',
                                                        actionOnEnd: () => {
                                                            setSkipSpeech(false);
                                                        },
                                                    },
                                                ],
                                            });
                                        } else if (kelas.getQuizCount() >= 1) {
                                            //kondisi semua materi selesai dengan tidak  mode kerjakan quiz
                                            speechWithBatch({
                                                speechs: [
                                                    {
                                                        text: `Selamat datang kembali, semua materi sudah selesai. Anda saat ini bisa melanjutkan pengerjaan quiz.`,
                                                        actionOnStart: () => {
                                                            setSkipSpeech(true);
                                                        },
                                                    },
                                                    {
                                                        text: 'Untuk mengerjakan quiz, ucapkan perintah kerjakan quiz, Agar bisa mengerjakan quiz kembali',
                                                    },
                                                    {
                                                        text: 'Jangan lupa untuk panggil saya terlebih dahulu dengan hai atau halo uli.agar saya bisa mendengar Anda',
                                                        actionOnEnd: () => {
                                                            setSkipSpeech(false);
                                                        },
                                                    },
                                                ],
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        if (error instanceof ApiResponseError) {
                            //console.log(`ERR CLASS ENROLLMENT API MESSAGE: `, error.message);
                            //console.log(error.data);
                            if (
                                error?.data?.data?.metadata?.code === 401 ||
                                error?.message?.toLowerCase() === 'Email belum diverifikasi'.toLocaleLowerCase()
                            ) {
                                speechAction({
                                    text: 'Anda harus verifikasi akun Anda terlebih dahulu. Silahkan check email Anda!',
                                    actionOnEnd: () => {
                                        // router.replace('/must-verify');
                                        handleMovePage('must-verify', 'replace', false);
                                    },
                                });
                            }
                            return;
                        }
                        //console.log(`MESSAGE: `, error.message);
                    }
                };
                fetchApiClassEnrollment();
            }
            setLoadData(false);
        }
    }, [
        name,
        loadData,
        token,
        isQuizMode,
        userAnswer,
        isAnswerMode,
        idxQuiz,
        currentQuiz,
        isCetakSertifikat,
        userName,
        handleMovePage,
        handleNotifAction,
        poin,
    ]);

    // Processing Speech Recognition
    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            const cleanCommand = command?.replace('.', '');
            // console.log({
            //     cleanCommand,
            // });

            // Memastikan model dan vocab dimuat sebelum melakukan prediksi
            if (!model || !vocab || !labelEncoder) {
                //console.error('Model, vocab, label encoder  belum dimuat.');
            } else {
                const removePunctuationWords = punctuationRemoval(cleanCommand);
                const stemmingWords = stemming(removePunctuationWords);
                const removedStopWords = removeStopwords(stemmingWords);
                // console.log({
                //     removePunc: removePunctuationWords,
                //     stem: stemmingWords,
                //     removeStop: removedStopWords,
                // });
                // Hitung TF-IDF untuk setiap kata dalam inputText dengan bobot dari vocab
                const tfidfResults = Object.keys(vocab).map((word) => {
                    return {
                        word: word,
                        tfidf: calculateTFIDFWithWeights(word, removedStopWords, [removedStopWords], vocab),
                    };
                });

                // Menyusun ulang hasil untuk menyimpan nilai TF-IDF dalam bentuk array
                const orderedResults = tfidfResults.map((result) => result.tfidf);

                const inputArray = [orderedResults]; // Sesuaikan dengan bentuk input model
                const inputTensor = tf.tensor2d(inputArray);
                const prediction = model.predict(inputTensor);
                const result = prediction.dataSync();

                // Temukan indeks kelas dengan nilai tertinggi
                const predictedClassIndex = result.indexOf(Math.max(...result));
                const checkValueOfResult = orderedResults.reduce((curr, prev) => curr + prev, 0);

                if (isQuizMode) {
                    if (checkValueOfResult !== 0) {
                        const predictedCommand = labelEncoder[predictedClassIndex];
                        // console.log({
                        //     'Check value result ': checkValueOfResult,
                        //     'Predicted command ': predictedCommand,
                        // });

                        // console.log({
                        //     'Quiz berjalan ': cleanCommand,
                        //     'Is answer mode ': isAnswerMode,
                        // });
                        setDisplayTranscript(true);
                        if (isAnswerMode) {
                            if (predictedCommand.includes('ulangi')) {
                                if (predictedCommand.includes('soal')) {
                                    setTrancript(predictedCommand);
                                    speechAction({
                                        text: `Soal nomor ${idxQuiz + 1} akan dibaca ulang`,
                                        actionOnEnd: () => {
                                            setAnswerMode(false);
                                            setLoadData(true);
                                            setQuizMode(true);
                                        },
                                    });
                                }
                            } else if (predictedCommand.includes('pilih')) {
                                // const quizCommand = predictedCommand.replace('pilih', '').trim().toLowerCase();
                                setTrancript(predictedCommand);
                                if (predictedCommand.includes('a')) {
                                    // setSpeechOn(false);
                                    //console.log('Anda memilih A');
                                    setUserAnswer('A');
                                    setLoadData(true);
                                } else if (predictedCommand.includes('b')) {
                                    // setSpeechOn(false);
                                    //console.log('Anda memilih B');
                                    setUserAnswer('B');
                                    setLoadData(true);
                                } else if (predictedCommand.includes('c')) {
                                    // setSpeechOn(false);
                                    //console.log('Anda memilih C');
                                    setUserAnswer('C');
                                    setLoadData(true);
                                }
                            } else if (predictedCommand.includes('hentikan')) {
                                if (
                                    predictedCommand.includes('quiz') ||
                                    predictedCommand.includes('quis') ||
                                    predictedCommand.includes('kuis') ||
                                    predictedCommand.includes('kuiz')
                                ) {
                                    setTrancript(predictedCommand);
                                    const listQuiz = new ListQuiz({
                                        listQuiz: quiz,
                                    });
                                    speechAction({
                                        text: `Anda berhenti untuk menjawab quiz di soal ke ${idxQuiz + 1}`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                            // setSpeechOn(false);
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
                            }
                        }
                    }
                }

                if (speechOn && !skipSpeech) {
                    if (checkValueOfResult !== 0) {
                        const predictedCommand = labelEncoder[predictedClassIndex];
                        //console.log('Check value result: ', checkValueOfResult);
                        //console.log('Predicted command : ', predictedCommand);
                        if (predictedCommand.includes('kerjakan')) {
                            if (
                                predictedCommand.includes('quiz') ||
                                predictedCommand.includes('quis') ||
                                predictedCommand.includes('kuis') ||
                                predictedCommand.includes('kuiz')
                            ) {
                                setTrancript(predictedCommand);
                                setSpeechOn(false);
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
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    });
                                    return;
                                }

                                if (listQuiz.getIdxQuizBerjalan() === -1) {
                                    speechAction({
                                        text: `Quiz Anda sudah selesai!`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    });
                                    return;
                                }

                                if (listQuiz.getIdxQuizBerjalan() > 0) {
                                    speechAction({
                                        text: `Anda melanjutkan mengerjakan quiz ke- ${listQuiz.getIdxQuizBerjalan() + 1}`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
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
                                        setDisplayTranscript(false);
                                        setQuizMode(true);
                                        setLoadData(true);
                                    },
                                });
                            }
                        } else if (cleanCommand.includes('pilih')) {
                            if (cleanCommand.includes('materi')) {
                                setTrancript(cleanCommand);
                                setSpeechOn(false);
                                const materiCommand = cleanCommand.replace('pilih materi', '').trim().toLowerCase();
                                const materiIdx = convertStringToNum(materiCommand) - 1;
                                const listMateri = new ListMateri({
                                    listMateri: materi,
                                });
                                //console.log('MATERI COMMAND: ', materiCommand);
                                const findMateri = listMateri.getMateriByIdx(materiIdx);
                                const findIndexMateriBerjalan = listMateri.getIdxMateriBerjalan();

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
                                                        //console.log('RESPONSE MATERII: ', response);
                                                        const lastMateri =
                                                            response.data.data.kelas.materi[
                                                                response.data.data.kelas.materi.length - 1
                                                            ];
                                                        //console.log('last materi : ', lastMateri);
                                                        speechAction({
                                                            text: `Materi telah selesai semua, Anda akan diarahkan ke materi terkakhir dari kelas ini!`,
                                                            actionOnEnd: () => {
                                                                setDisplayTranscript(false);
                                                                setCurrentMateri(lastMateri);
                                                                setPlayback(0);
                                                                setVideoId(getYoutubeVideoId(lastMateri.url));
                                                                speechAction({
                                                                    text: `Anda belajar lagi materi ke ${
                                                                        response.data.data.kelas.materi.length - 1
                                                                    } atau materi yang terakhir.  Jangan lupa klik tombol spasi untuk menjalankan materi, dan klik kembali tombol spasi  untuk pause materi.`,
                                                                });
                                                            },
                                                        });
                                                        return;
                                                    }

                                                    speechAction({
                                                        text: `Anda sedang belajar materi sekarang atau materi yang sedang berjalan.  Jangan lupa klik tombol spasi untuk menjalankan materi, dan klik kembali tombol spasi  untuk pause materi.`,
                                                        actionOnStart: () => {
                                                            setDisplayTranscript(false);
                                                            //  setSpeechOn(false);
                                                            setCurrentMateri(materiBerjalan);
                                                            setPlayback(materiBerjalan.playback);
                                                            setVideoId(getYoutubeVideoId(materiBerjalan.url));
                                                        },
                                                    });
                                                } catch (error) {
                                                    if (error instanceof ApiResponseError) {
                                                        // console.log(
                                                        //     `ERR CLASS ENROLLMENT API FROM MATERI SEKARANG MESSAGE: `,
                                                        //     error.message,
                                                        // );
                                                        // console.log(error.data);
                                                        return;
                                                    }
                                                    //console.log(`MESSAGE: `, error.message);
                                                }
                                            };
                                            fetchApiClassEnrollment();
                                        },
                                    });
                                    return;
                                }

                                if (!findMateri) {
                                    if (!materiCommand) {
                                        speechAction({
                                            text: `Materi tidak ditemukan, perlu diperhatikan ketika Anda mencari materi. ucapkan pilih materi sesuai angka yang Anda pilih, misalnya pilih materi 1`,
                                            actionOnEnd: () => {
                                                setDisplayTranscript(false);
                                            },
                                        });

                                        speechAction({
                                            text: `Jika ada kelas yang masih berjalan, Anda juga bisa mencari materi tersebut dengan pilih materi sekarang`,
                                            actionOnEnd: () => {
                                                setDisplayTranscript(false);
                                            },
                                        });
                                        return;
                                    }
                                    speechAction({
                                        text: `Materi ke ${
                                            materiIdx + 1
                                        } tidak ditemukan, perlu diperhatikan jumlah materi sampai ${materi.length}!`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    });
                                    return;
                                }

                                if (findMateri.status === 'belum') {
                                    speechAction({
                                        text: `Materi ke ${
                                            materiIdx + 1
                                        } tidak dapat diakses. Anda perlu menyelesaikan materi sampai ${
                                            materi.length
                                        } dan sekarang Anda sedang di materi ke ${findIndexMateriBerjalan + 1}`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    });
                                    return;
                                }

                                speechAction({
                                    text: `Anda akan memilih materi ke ${materiIdx + 1}`,
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                        setCurrentMateri(findMateri);
                                        setPlayback(0);
                                        setVideoId(getYoutubeVideoId(findMateri.url));
                                        speechAction({
                                            text: `Anda belajar lagi materi ke ${
                                                materiIdx + 1
                                            }.  Jangan lupa klik tombol spasi untuk menjalankan materi, dan klik kembali tombol spasi  untuk pause materi.`,
                                        });
                                    },
                                });
                            }
                        } else if (predictedCommand.includes('pergi')) {
                            if (predictedCommand.includes('kelas')) {
                                setTrancript(predictedCommand);
                                setSpeechOn(false);
                                speechAction({
                                    text: `Anda akan menuju halaman Daftar Kelas`,
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                        // router.push('/kelas');
                                        handleMovePage('/kelas');
                                    },
                                });
                            } else if (predictedCommand.includes('beranda')) {
                                setTrancript(predictedCommand);
                                setSpeechOn(false);
                                speechAction({
                                    text: `Anda akan menuju halaman beranda`,
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                        // router.push('/');
                                        handleMovePage('/');
                                    },
                                });
                            } else if (predictedCommand.includes('rapor')) {
                                setTrancript(predictedCommand);
                                setSpeechOn(false);
                                speechAction({
                                    text: `Anda akan menuju halaman Rapor`,
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                        // router.push('/rapor');
                                        handleMovePage('/rapor');
                                    },
                                });
                            } else if (predictedCommand.includes('peringkat')) {
                                setTrancript(predictedCommand);
                                // moving to /peringkat
                                setSpeechOn(false);
                                speechAction({
                                    text: 'Anda akan menuju halaman Peringkat',
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                        // router.push('/peringkat');
                                        handleMovePage('/peringkat');
                                    },
                                });
                            } else {
                                setTrancript('Perintah tidak ditemukan!');
                                setSpeechOn(false);
                                speechAction({
                                    text: 'Perintah tidak ditemukan!',
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                    },
                                });
                            }
                        } else if (predictedCommand.includes('cetak')) {
                            if (predictedCommand.includes('sertifikat')) {
                                setTrancript(predictedCommand);
                                setSpeechOn(false);

                                if (statusKelas === 'selesai') {
                                    // speechAction({
                                    //     text: 'Sertifikat sudah didownload!',
                                    //     actionOnEnd: () => {
                                    //         setCetakSertifikat(false);
                                    //     },
                                    // });

                                    speechAction({
                                        text: `Anda akan mendapatkan sertifikat ${enrollClassName}`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                            setCetakSertifikat(true);
                                            setLoadData(true);
                                        },
                                    });
                                } else {
                                    speechAction({
                                        text: `Maaf, Anda harus menyelesaikan semua materi dan quiz terlebih dahulu.`,
                                        actionOnEnd: () => {
                                            // setCetakSertifikat(false);
                                            setDisplayTranscript(false);
                                        },
                                    });
                                }
                            }
                        } else if (
                            predictedCommand.includes('saya sekarang dimana') ||
                            predictedCommand.includes('saya sekarang di mana') ||
                            predictedCommand.includes('saya di mana') ||
                            predictedCommand.includes('saya dimana')
                        ) {
                            setTrancript(predictedCommand);
                            setSpeechOn(false);
                            speechAction({
                                text: `Kita sedang di halaman pembelajaran`,
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                },
                            });
                        } else if (predictedCommand.includes('jelaskan')) {
                            if (predictedCommand.includes('intruksi') || predictedCommand.includes('instruksi')) {
                                //console.log('dapet nih');
                                setTrancript(predictedCommand);
                                setSpeechOn(false);
                                setIsClickButton(false);
                                setIsPlayIntruction(true);
                                speechWithBatch({
                                    speechs: [
                                        {
                                            text: `Hai ${userName}, sekarang Anda mendengarkan intruksi di halaman kelas.`,
                                            actionOnStart: () => {
                                                setSkipSpeech(true);
                                            },
                                            actionOnEnd: () => {
                                                setDisplayTranscript(false);
                                            },
                                        },
                                        {
                                            text: `Dalam pembelajaran ini, untuk memulai materi, Jangan lupa klik tombol spasi dan klik kembali tombol spasi  untuk pause materi.`,
                                        },
                                        {
                                            text: `Setelah materi selesai, Anda dapat mengerjakan quiz dengan mengucapkan perintah kerjakan quiz `,
                                        },
                                        {
                                            text: `Setelah soal dibacakan, Anda dapat memilih pilihan jawaban yang menurut Anda benar dengan mengucapkan pilih a, b, atau c`,
                                        },
                                        {
                                            text: 'Jika soal sudah dikerjakan semuanya Anda dapat mengerjakan quiz, ucapkan kerjakan kuiz agar Anda bisa mengerjakan quiz',
                                        },
                                        {
                                            text: 'Apabila materi dan quiz sudah selesai semua, Anda dapat mencetak sertifikat, ucapkan cetak sertifikat agar Anda bisa mencetak sertifikat',
                                        },
                                        {
                                            text: `Jika Anda tersesat sedang halaman apa, Anda dapat mengucapkan saya dimana`,
                                        },
                                        {
                                            text: `Untuk navigasi halaman, Anda dapat mengucapkan pergi ke halaman yang Anda tuju, misalnya pergi ke beranda, pada halaman ini Anda dapat pergi ke halaman beranda, raport, dan peringkat`,
                                        },

                                        {
                                            text: `jangan lupa, Anda harus ucapkan terlebih dahulu hi Uli atau hallo uli agar saya dapat mendengar Anda. Jika tidak ada perintah apapun saya akan diam dalam 10 detik.`,
                                            actionOnEnd: () => {
                                                setSkipSpeech(false);
                                                setIsPlayIntruction(false);
                                            },
                                        },
                                    ],
                                });
                            }
                        } else if (predictedCommand.includes('muat')) {
                            if (predictedCommand.includes('ulang')) {
                                if (predictedCommand.includes('halaman')) {
                                    setTrancript(predictedCommand);
                                    setSpeechOn(false);

                                    const listQuiz = new ListQuiz({
                                        listQuiz: quiz,
                                    });

                                    speechAction({
                                        text: `Anda akan load halaman ini!`,
                                        actionOnEnd: () => {
                                            setIsClickButton(false);
                                            setDisplayTranscript(false);
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
                        }
                    } else {
                        setSpeechOn(false);
                        speechAction({
                            text: 'Perintah tidak ditemukan!',
                            actionOnEnd: () => {
                                setDisplayTranscript(false);
                            },
                        });
                    }
                }
            }

            if (!skipSpeech) {
                if (cleanCommand.includes('hallo') || cleanCommand.includes('halo') || cleanCommand.includes('hai')) {
                    if (cleanCommand.includes('uli')) {
                        setTrancript(cleanCommand);
                        stopSpeech();
                        speechAction({
                            text: `Hai ${userName}, saya mendengarkan Anda!`,
                            actionOnStart: () => {
                                setDisplayTranscript(true);
                            },
                            actionOnEnd: () => {
                                setSpeechOn(true);
                            },
                        });
                    }
                }
            }
        };

        recognition.onend = () => {
            recognition.start();
        };

        // CLEAR TRIGGER
        // console.log({
        //     'TRIGGER CONDITION ': speechOn,
        // });
        if (speechOn) {
            const timer = setTimeout(() => {
                speechAction({
                    text: 'saya diam',
                    actionOnEnd: () => {
                        // console.log({
                        //     'Speeck di clear ': speechOn,
                        // });
                        setDisplayTranscript(false);
                        setSpeechOn(false);
                    },
                });
            }, 10000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [
        handleMovePage,
        materi,
        name,
        token,
        isAnswerMode,
        isQuizMode,
        quiz,
        idxQuiz,
        enrollClassName,
        speechOn,
        skipSpeech,
        userName,
        statusKelas,
        labelEncoder,
        model,
        vocab,
    ]);

    //effects
    useEffect(() => {
        const spaceButtonIntroAction = (event) => {
            return buttonAction({
                event: event,
                key: ' ',
                keyCode: 32,
                action: () => {
                    if (!isClickButton && isPermit) {
                        setSpeechOn(false);
                        stopSpeech();
                        if (isPlayIntruction) {
                            speechAction({
                                text: 'Anda mematikan intruksi',
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                    setSkipSpeech(false);
                                    setIsClickButton(true);
                                    setIsPlayIntruction(false);
                                },
                            });
                            return;
                        }
                        if (isIntro) {
                            speechAction({
                                text: 'Anda melewati Intro Halaman Belajar',
                                actionOnEnd: () => {
                                    setIntro(false);
                                    setSkipSpeech(false);
                                    setIsClickButton(true);
                                },
                            });
                        } else {
                            speechAction({
                                text: 'Anda melewati Intro Halaman',
                                actionOnEnd: () => {
                                    setSkipSpeech(false);
                                    setIsClickButton(true);
                                },
                            });
                        }
                    }
                },
            });
        };
        window.addEventListener('keydown', spaceButtonIntroAction);

        return () => {
            window.removeEventListener('keydown', spaceButtonIntroAction);
        };
    }, [isClickButton, isPlayIntruction, isIntro, isPermit]);

    // Setting if Window in small size
    if (windowSize.innerWidth < 640) {
        return (
            <div className='relative flex h-screen items-center justify-center gap-2'>
                <Image
                    alt='white icon gmooc'
                    src={'/small-images/monitor-size.webp'}
                    width={200}
                    height={80}
                    className='absolute left-1/2 top-1/4 z-10 -translate-x-1/2 -translate-y-1/3 transform'
                />
                <h1 className='z-0 px-3 pt-4 text-center'>
                    <b>Maaf</b>, Aplikasi tidak dapat berjalan dengan baik pada layar {windowSize.innerWidth}px. Buka di layar
                    lebih dari 640px atau gunakan
                    <b> laptop</b>.
                </h1>
            </div>
        );
    }

    return (
        <div className='h-screen bg-[#EDF3F3]'>
            <nav className={` fixed top-0 z-20 w-screen  bg-[#EDF3F3] py-[20px]`}>
                <div className='mx-auto flex max-w-screen-xl items-center justify-between '>
                    <HeroIcon alt='icons' imgUrl={'/images/voice-icon.svg'} height={100} width={100} />
                    <div className=' flex items-center gap-[200px]'>
                        <div className='flex items-center gap-[20px] '>
                            <div className='flex items-center gap-[14px]'>
                                <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full  border-[2px] border-black  p-3 text-[12px] font-bold'>
                                    P
                                </div>{' '}
                                <span className=' text-[16px] font-bold leading-[20px]'>{poin}</span>
                            </div>
                            <div className='flex items-center gap-[14px]'>
                                <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full  border-[2px] border-black  p-3 text-[12px] font-bold'>
                                    N
                                </div>{' '}
                                <span className=' text-[16px] font-bold leading-[20px]'>{nilai}</span>
                            </div>
                            <div className='flex items-center gap-[14px]'>
                                <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full  border-[2px] border-black  p-3 text-[12px] font-bold'>
                                    K
                                </div>{' '}
                                <span className=' text-[16px] font-bold leading-[20px]'>{progress}% </span>
                            </div>
                        </div>
                        <NavbarButton />
                    </div>
                </div>
            </nav>
            <div style={{ height: 'calc(100vh - 88px)' }} className='mx-auto grid max-w-screen-xl grid-cols-12 gap-5 pt-[92px]'>
                <div style={{ height: 'calc(100vh - 110px)' }} className='col-span-3  rounded-[20px]  bg-white p-[10px]'>
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
                                        alt={`course - ${introData?.imageUrl}`}
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
                                <VideoFrame
                                    handleEditMateri={handleEditMateri}
                                    playback={playback}
                                    videoId={videoId}
                                    isInterrop={isPlayIntruction}
                                />
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
                                <PDFDownloadLink
                                    document={<Certificate name={userName} kelas={enrollClassName} />}
                                    // fileName="Jamal Certificate.pdf"
                                >
                                    {({ blob, loading, error }) => {
                                        if (loading) {
                                            return 'Loading document...';
                                        } else if (error) {
                                            return `Error: ${error}`;
                                        } else if (blob) {
                                            saveBlobToDevice(blob, `${userName}-${enrollClassName}-Certificate.pdf`);
                                            return null;
                                        }
                                    }}
                                </PDFDownloadLink>
                            </div>
                        )}
                    </>
                </div>
            </div>
            <Transkrip transcript={transcript} isTrigger={displayTranscript} />
            <MateriPoinNotification time={2000} isVisible={isVisible} poin={poinNotif} handleVisible={handleNotifAction} />
            <CheckPermission />
        </div>
    );
}
