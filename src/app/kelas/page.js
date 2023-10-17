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
6. apis
    -> api functions
7. utils
    -> utility functions
*/

// core
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// third party
import { useSession } from 'next-auth/react';
import * as tf from '@tensorflow/tfjs';

//redux
//---

// components
import Navbar from '@/components/Navbar';
import ArrowButton from '@/components/ArrowButton';
import Transkrip from '@/components/Transkrip';

// datas
// ---

// apis
import { userGetAllClassApi, userGetClassByLevel } from '@/axios/user';

// utils
import { getImageFile } from '@/utils/get-server-storage';
import { speechAction, speechWithBatch, stopSpeech } from '@/utils/text-to-speech';
import { formatDotString } from '@/utils/format-dot-string';
import { recognition } from '@/utils/speech-recognition';
import { ApiResponseError } from '@/utils/error-handling';
import { buttonAction } from '@/utils/space-button-action';
import { punctuationRemoval, stemming, removeStopwords } from '@/utils/special-text';
import { calculateTFIDFWithWeights } from '@/utils/tfidf';
// import { authLogout } from '@/axios/auth';

const Kelas = () => {
    const { data } = useSession();
    const router = useRouter();
    const token = data?.user?.token;
    const userName = data?.user?.name;

    // COMMON STATE
    const [loadData, setLoadData] = useState(true);
    const [kelas, setKelas] = useState([]);
    const [isChecked, setIsChecked] = useState({
        mudah: false,
        normal: false,
        sulit: false,
        semua: true,
    });
    const [introPage, setIntroPage] = useState(true);

    // TENSORFLOW STATE
    const [model, setModel] = useState(null);
    const [vocab, setVocab] = useState(null);
    const [labelEncoder, setLabelEncoder] = useState(null);

    // ACCESSIBILITY STATE
    const [speechOn, setSpeechOn] = useState(false); // state untuk  speech recognition
    const [transcript, setTrancript] = useState(''); // state untuk menyimpan transcript hasil speech recognition
    const [skipSpeech, setSkipSpeech] = useState(false); // state untuk  mengatasi speech recogniton ter-trigger
    const [displayTranscript, setDisplayTranscript] = useState(false); // state untuk  menampilkan transcript
    const [isClickButton, setIsClickButton] = useState(false); // state untuk aksi tombol
    const [isPlayIntruction, setIsPlayIntruction] = useState(false); // state  ketika intruksi berjalan

    //FUNCTION
    // Fungsi untuk memuat model
    const loadModel = async () => {
        try {
            const loadedModel = await tf.loadLayersModel('/model.json');
            setModel(loadedModel);
        } catch (error) {
            console.error('Gagal memuat model:', error);
        }
    };

    // Fungsi untuk memuat vocab.json
    const loadVocab = async () => {
        try {
            const response = await fetch('/vocab.json');
            const data = await response.json();
            setVocab(data);
        } catch (error) {
            console.error('Gagal memuat vocab:', error);
        }
    };

    // Fungsi untuk memuat label_encoder.json
    const loadLabelEncoder = async () => {
        try {
            const response = await fetch('/label_encoder.json');
            const data = await response.json();
            setLabelEncoder(data);
        } catch (error) {
            console.error('Gagal memuat label encoder:', error);
        }
    };

    const handlePilihKelas = (namaKelas) => router.push(`/kelas/${namaKelas}`);

    const fetchKelasByLevel = async (idLevel, token) => {
        try {
            const kelasLevel = {
                1: 'mudah',
                2: 'normal',
                3: 'sulit',
                4: 'semua',
            };

            let response;

            if (kelasLevel[idLevel] === 'semua') {
                setSpeechOn(false);
                response = await userGetAllClassApi({ token });

                if (!response?.data?.length) {
                    speechAction({
                        text: `Tidak ada kelas.`,
                        actionOnEnd: () => {
                            setDisplayTranscript(false);
                        },
                    });
                    return [];
                }

                speechAction({
                    text: `Ditemukan ${response?.data?.length} kelas tersedia dari semua kelas.`,
                    actionOnEnd: () => {
                        setDisplayTranscript(false);
                    },
                });

                return response?.data;
            } else {
                setSpeechOn(false);
                response = await userGetClassByLevel({ idLevel, token });

                if (!response?.data?.kelas?.length) {
                    speechAction({
                        text: `Kelas dengan level ${kelasLevel[idLevel]} tidak ditemukan`,
                        actionOnEnd: () => {
                            setDisplayTranscript(false);
                        },
                    });
                    return [];
                }

                speechAction({
                    text: `Ditemukan ${response?.data?.kelas?.length} kelas tersedia dengan level ${kelasLevel[idLevel]}.`,
                    actionOnEnd: () => {
                        setDisplayTranscript(false);
                    },
                });

                return response?.data?.kelas;
            }
        } catch (error) {
            if (error instanceof ApiResponseError) {
                console.log(`ERR API MESSAGE: `, error.message);
                console.log(error.data);
                speechAction({
                    text: 'Kelas tidak ditemukan',
                });
                return;
            }
            console.log(`MESSAGE: `, error.message);
            speechAction({
                text: 'Kelas tidak ditemukan',
            });
        }
    };

    const handleCheckBoxChange = (level) => {
        switch (level) {
            case 'mudah':
                setIsChecked({
                    mudah: true,
                    normal: false,
                    sulit: false,
                    semua: false,
                });
                break;
            case 'normal':
                setIsChecked({
                    mudah: false,
                    normal: true,
                    sulit: false,
                    semua: false,
                });
                break;
            case 'sulit':
                setIsChecked({
                    mudah: false,
                    normal: false,
                    sulit: true,
                    semua: false,
                });
                break;
            case 'semua':
                setIsChecked({
                    mudah: false,
                    normal: false,
                    sulit: false,
                    semua: true,
                });
                break;

            default:
                setIsChecked({
                    mudah: false,
                    normal: false,
                    sulit: false,
                    semua: true,
                });
                break;
        }
    };

    // Prevent for react exhaust hook warning, using usecallback wrapper
    const handleFetchKelasByLevelName = useCallback(
        async (level) => {
            if (token) {
                switch (level) {
                    case 'mudah': {
                        const kelasMudah = await fetchKelasByLevel(1, token);
                        setKelas(kelasMudah);
                        handleCheckBoxChange('mudah');
                        break;
                    }
                    case 'normal': {
                        const kelasNormal = await fetchKelasByLevel(2, token);
                        setKelas(kelasNormal);
                        handleCheckBoxChange('normal');
                        break;
                    }
                    case 'sulit': {
                        const kelasSulit = await fetchKelasByLevel(3, token);
                        setKelas(kelasSulit);
                        handleCheckBoxChange('sulit');
                        break;
                    }
                    case 'semua': {
                        const semuaKelas = await fetchKelasByLevel(4, token);
                        setKelas(semuaKelas);
                        handleCheckBoxChange('semua');
                        break;
                    }
                    default: {
                        const semuaKelas = await fetchKelasByLevel(4, token);
                        setKelas(semuaKelas);
                        handleCheckBoxChange('semua');
                        break;
                    }
                }
            }
        },
        [token],
    );

    // EFFECTS
    // init speech recognition
    useEffect(() => {
        try {
            recognition.start();
        } catch (error) {
            recognition.stop();
        }
    }, []);

    useEffect(() => {
        if (token) {
            if (loadData) {
                loadModel();
                loadVocab();
                loadLabelEncoder();
                const fetchApiAllClass = async () => {
                    try {
                        const response = await userGetAllClassApi({ token });
                        setKelas(response.data);
                        handleCheckBoxChange('semua');

                        speechWithBatch({
                            speechs: [
                                {
                                    text: `Selamat datang di Daftar Kelas, ${userName}. Pada halaman ini terdapat kumpulan dari berbagai kelas yang dapat Anda pelajari.`,
                                    actionOnStart: () => {
                                        setSkipSpeech(true);
                                    },
                                },
                                {
                                    text: ' Anda dapat mencari jumlah kelas yang tersedia dengan berdasarkan level, yaitu, Level Mudah, Normal, dan Sulit.',
                                },
                                {
                                    text: `Untuk perintahnya, Anda bisa mengucapkan cari kelas dengan level yang Anda inginkan, misalnya, cari kelas mudah`,
                                },
                                {
                                    text: 'Jika bingung,  Anda juga dapat mencari semua kelas dengan mengucapkan cari semua kelas.',
                                },
                                {
                                    text: 'Selanjutnya, Anda bisa ucapkan sebutkan kelas agar mengetahui apa saja kelas di level tersebut.',
                                },
                                {
                                    text: 'Anda juga dapat mengetahui jumlah kelas yang ada dengan mengucapkan perintah jumlah kelas.',
                                },
                                {
                                    text: 'Jika sudah menemukan kelas yang cocok, Anda bisa mengucapkan belajar dengan kelas yang Anda inginkan, misalnya Belajar bahasa.',
                                },
                                {
                                    text: 'Jika Anda masih bingung, Anda bisa ucapkan intruksi agar dapat mengulangi penjelasan ini.',
                                    actionOnEnd: () => {
                                        setIsClickButton(true);
                                        setIntroPage(false);
                                        setSkipSpeech(false);
                                    },
                                },
                            ],
                        });
                    } catch (error) {
                        if (error instanceof ApiResponseError) {
                            console.log(`ERR API MESSAGE: `, error.data);
                            console.log(error.data);

                            if (
                                error?.data?.data?.metadata?.code === 401 ||
                                error?.message?.toLowerCase() === 'Email belum diverifikasi'.toLocaleLowerCase()
                            ) {
                                speechAction({
                                    text: 'Anda harus verifikasi akun Anda terlebih dahulu. Silahkan check email Anda!',
                                    actionOnEnd: () => {
                                        router.push('/must-verify');
                                    },
                                });
                            } else {
                                speechAction({
                                    text: 'Kelas tidak ditemukan',
                                });
                            }
                            return;
                        }
                        console.log(`MESSAGE: `, error.data);
                        speechAction({
                            text: 'Kelas tidak ditemukan',
                        });
                    }
                };
                fetchApiAllClass();
            }
            setLoadData(false);
        }
    }, [token, loadData, router, userName]);

    useEffect(() => {
        // SPEECH RECOGNITION RESULT
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            const cleanCommand = command?.replace('.', '');

            /* Dengan trigger */
            if (speechOn && !skipSpeech) {
                const removePunctuationWords = punctuationRemoval(cleanCommand);
                const stemmingWords = stemming(removePunctuationWords);
                const removedStopWords = removeStopwords(stemmingWords);
                console.log({
                    removePunc: removePunctuationWords,
                    stem: stemmingWords,
                    removeStop: removedStopWords,
                });

                // Memastikan model dan vocab dimuat sebelum melakukan prediksi
                if (!model || !vocab || !labelEncoder) {
                    console.error('Model, vocab, label encoder  belum dimuat.');
                } else {
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

                    // skipping prediction
                    if (cleanCommand.includes('pergi')) {
                        if (cleanCommand.includes('peringkat')) {
                            setTrancript('pergi peringkat');
                            setSpeechOn(false);
                            speechAction({
                                text: 'Anda akan menuju halaman Peringkat',
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                    router.push('/peringkat');
                                },
                            });
                        }
                    } else if (cleanCommand.includes('jelaskan')) {
                        if (cleanCommand.includes('intruksi') || cleanCommand.includes('instruksi')) {
                            // console.log('dapet nih');
                            setTrancript('jelaskan instruksi');
                            setSpeechOn(false);
                            setIsClickButton(false);
                            setIsPlayIntruction(true);
                            speechWithBatch({
                                speechs: [
                                    {
                                        text: `Hai ${userName}, sekarang Anda mendengarkan intruksi di halaman daftar kelas.`,
                                        actionOnStart: () => {
                                            setSkipSpeech(true);
                                        },
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    },
                                    {
                                        text: `Halaman ini dinamakan halaman daftar kelas. Pada halaman ini terdapat kumpulan dari berbagai kelas yang dapat Anda pelajari.`,
                                    },
                                    {
                                        text: ' Anda dapat mencari jumlah kelas yang tersedia dengan berdasarkan level, yaitu, Level Mudah, Normal, dan Sulit.',
                                    },
                                    {
                                        text: `Untuk perintahnya, Anda bisa mengucapkan cari kelas dengan level yang Anda inginkan, misalnya, cari kelas mudah`,
                                    },
                                    {
                                        text: 'Jika bingung,  Anda juga dapat mencari semua kelas dengan mengucapkan cari semua kelas.',
                                    },
                                    {
                                        text: 'Selanjutnya, Anda bisa ucapkan sebutkan kelas agar mengetahui apa saja kelas di level tersebut.',
                                    },
                                    {
                                        text: 'Jika sudah menemukan kelas yang cocok, Anda bisa ucapkan belajar dengan kelas yang Anda inginkan, misalnya Belajar bahasa.',
                                    },
                                    {
                                        text: `Jika Anda tersesat, Anda dapat mengucapkan saya dimana`,
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
                    } else if (cleanCommand.includes('belajar')) {
                        //enroll the class
                        setSpeechOn(false);
                        const kelasCommand = cleanCommand.replace('belajar', '').trim();
                        const findKelas = kelas.find((k) => k.name.toLowerCase() === kelasCommand);
                        console.log('belajar:   ', kelasCommand);
                        setTrancript(`belajar ${kelasCommand}`);
                        if (!findKelas) {
                            // kelas not found
                            console.log('belajar:   ', kelasCommand);
                            speechAction({
                                text: 'Kelas tidak ditemukan',
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                },
                            });
                            return;
                        }
                        speechAction({
                            text: `Anda akan belajar dikelas ${findKelas.name}`,
                            actionOnEnd: () => {
                                setDisplayTranscript(false);
                                router.push(`/kelas/${findKelas.name.toLowerCase()}`);
                            },
                        });
                    } else if (cleanCommand.includes('jumlah kelas')) {
                        setTrancript('jumlah kelas');
                        setSpeechOn(false);
                        if (kelas.length) {
                            let typeClass;
                            if (isChecked.mudah) {
                                typeClass = 'mudah';
                            } else if (isChecked.normal) {
                                typeClass = 'normal';
                            } else if (isChecked.sulit) {
                                typeClass = 'sulit';
                            } else if (isChecked.semua) {
                                typeClass = 'semua';
                            }
                            speechAction({
                                text: `Terdapat ${kelas.length} kelas ${
                                    typeClass === 'semua' ? 'pada semua level' : `pada level ${typeClass}`
                                }. Ucapkan sebutkan kelas agar Anda dapat mengetahui nama-nama kelas tersebut`,
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                },
                            });
                        }
                    }

                    // PREDICTION
                    if (checkValueOfResult !== 0) {
                        const predictedCommand = labelEncoder[predictedClassIndex];
                        console.log('Check value result: ', checkValueOfResult);
                        console.log('Predicted command : ', predictedCommand);
                        if (predictedCommand.includes('cari')) {
                            //search class by level
                            if (predictedCommand.includes('kelas')) {
                                // setTrancript(predictedCommand);
                                if (predictedCommand.includes('semua')) {
                                    // semua
                                    setTrancript(predictedCommand);
                                    handleFetchKelasByLevelName('semua');
                                } else if (predictedCommand.includes('mudah')) {
                                    // mudah
                                    setTrancript(predictedCommand);
                                    handleFetchKelasByLevelName('mudah');
                                } else if (predictedCommand.includes('normal')) {
                                    // normal
                                    setTrancript(predictedCommand);
                                    handleFetchKelasByLevelName('normal');
                                } else if (predictedCommand.includes('sulit')) {
                                    // sulit
                                    setTrancript(predictedCommand);
                                    handleFetchKelasByLevelName('sulit');
                                }
                            }
                        } else if (predictedCommand.includes('pergi')) {
                            // moving page with speech
                            if (predictedCommand.includes('beranda')) {
                                setTrancript(predictedCommand);
                                // moving to /beranda
                                setSpeechOn(false);
                                speechAction({
                                    text: 'Anda akan menuju halaman Beranda',
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                        router.push('/');
                                    },
                                });
                            } else if (predictedCommand.includes('rapor')) {
                                setTrancript(predictedCommand);
                                // moving to /rapot
                                setSpeechOn(false);
                                speechAction({
                                    text: 'Anda akan menuju halaman Rapor',
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                        router.push('/rapor');
                                    },
                                });
                            }
                        } else if (predictedCommand.includes('sebutkan')) {
                            if (predictedCommand.includes('kelas')) {
                                setTrancript(predictedCommand);
                                setSpeechOn(false);
                                // sebutkan kelas yang tersedia berdasarkan level
                                if (kelas.length > 0) {
                                    let typeClass;
                                    if (isChecked.mudah) {
                                        typeClass = 'mudah';
                                    } else if (isChecked.normal) {
                                        typeClass = 'normal';
                                    } else if (isChecked.sulit) {
                                        typeClass = 'sulit';
                                    } else if (isChecked.semua) {
                                        typeClass = 'semua';
                                    }
                                    speechAction({
                                        text: `Daftar kelas ${
                                            typeClass === 'semua' ? 'pada semua level' : `pada level ${typeClass}`
                                        } yaitu : `,
                                        actionOnEnd: () => {
                                            for (let i = 0; i < kelas.length; i++) {
                                                speechAction({
                                                    text: ` ${kelas[i].name}`,
                                                });
                                            }
                                            speechAction({
                                                text: 'ucapkan belajar diikuti nama kelas, agar Anda dapat belajar di kelas tersebut, contohnya belajar sejarah',
                                                actionOnEnd: () => {
                                                    setDisplayTranscript(false);
                                                    console.log('speech diclear');
                                                },
                                            });
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
                                text: `Kita sedang di halaman kelas`,
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                },
                            });
                        } else if (predictedCommand.includes('muat')) {
                            if (predictedCommand.includes('ulang')) {
                                if (predictedCommand.includes('halaman')) {
                                    setTrancript(predictedCommand);
                                    setSpeechOn(false);
                                    speechAction({
                                        text: `Anda akan load ulang halaman!`,
                                        actionOnEnd: () => {
                                            setIsClickButton(false);
                                            setDisplayTranscript(false);
                                            setLoadData(true);
                                        },
                                    });
                                }
                            }
                        }
                    } else {
                        // USE CASE IF DYNAMIC SPEECH
                        if (
                            cleanCommand.includes('pergi ke peringkat') ||
                            cleanCommand.includes('jumlah kelas') ||
                            cleanCommand.includes('belajar') ||
                            cleanCommand.includes('pergi peringkat') ||
                            cleanCommand.includes('jelaskan intruksi') ||
                            cleanCommand.includes('jelaskan instruksi')
                        ) {
                            return;
                        }
                        setTrancript('Perintah tidak ditemukan di halaman ini!');
                        setSpeechOn(false);
                        speechAction({
                            text: 'Perintah tidak ditemukan di halaman ini!',
                            actionOnEnd: () => {
                                setDisplayTranscript(false);
                            },
                        });
                    }
                }
            }

            // if (isCari) {
            //     if (token) {
            //         synth.speak(speech(`Mencari ${command}`));
            //         const fetchApiClassByName = async () => {
            //             try {
            //                 const response = await axios.get(`https://nurz.site/api/user/kelasByName/${cleanCommand}`, {
            //                     headers: {
            //                         'Content-Type': 'application/json',
            //                         Authorization: `Bearer ${token}`,
            //                     },
            //                 });

            //                 console.log(response.data);

            //                 if (!response.data.data.length) {
            //                     synth.speak(speech(`Kelas tidak ditemukan`));
            //                     setCari(false);
            //                     return;
            //                 }

            //                 if (response.data.data.length > 0) {
            //                     setKelas(response.data.data);
            //                     synth.speak(speech('Ditemukan kelas'));
            //                     for (let i = 0; i < response.data.data.length; i++) {
            //                         synth.speak(speech(` ${response.data.data[i].name}`));
            //                     }
            //                     setCari(false);
            //                 }
            //             } catch (error) {
            //                 setCari(false);
            //                 synth.speak(`Kelas tidak ditemukan`);
            //             }
            //         };
            //         fetchApiClassByName();
            //     }
            // }

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

        // HANDLING SPEECH RECOGNITION FROM DEATH
        recognition.onend = () => {
            recognition.start();
        };

        // CLEAR TRIGGER
        console.log('TRIGGER CONDITION: ', speechOn);
        if (speechOn) {
            const timer = setTimeout(() => {
                speechAction({
                    text: 'saya diam',
                    actionOnEnd: () => {
                        console.log('speech diclear');
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
        router,
        kelas,
        token,
        isChecked,
        handleFetchKelasByLevelName,
        speechOn,
        userName,
        introPage,
        skipSpeech,
        labelEncoder,
        model,
        vocab,
    ]);

    // SINGLE BUTTON
    useEffect(() => {
        const spaceButtonIntroAction = (event) => {
            buttonAction({
                event: event,
                key: ' ',
                keyCode: 32,
                action: () => {
                    if (!isClickButton) {
                        setSpeechOn(false);
                        stopSpeech();
                        if (isPlayIntruction) {
                            speechAction({
                                text: 'Anda mematikan intruksi',
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                    setIntroPage(false);
                                    setSkipSpeech(false);
                                    setIsClickButton(true);
                                    setIsPlayIntruction(false);
                                },
                            });
                        } else {
                            speechAction({
                                text: 'Anda melewati Intro Halaman',
                                actionOnEnd: () => {
                                    setIntroPage(false);
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
    }, [isClickButton, isPlayIntruction]);

    // Need UI for not verify human
    // if (kelas.length < 1) {
    //     return <h1>NULL</h1>;
    // }

    return (
        <div className='h-screen bg-[#EDF3F3]'>
            <Navbar />
            <main style={{ height: 'calc(100vh - 90px)' }} className='w-screen bg-[#EDF3F3] pt-[90px] '>
                <div className='grid max-w-screen-xl grid-cols-12 mx-auto'>
                    <div className='col-span-2'>
                        <h1 className='font-bold text-title-2 '>Level</h1>
                        <div className='mt-[30px] flex flex-col gap-[18px] '>
                            <div className='flex items-center gap-2'>
                                <input
                                    type='checkbox'
                                    id='check'
                                    checked={isChecked.mudah}
                                    onChange={() => {
                                        handleFetchKelasByLevelName('mudah');
                                    }}
                                    className='h-[28px] w-[28px] rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                                />
                                <label htmlFor='check' className='font-medium text-body-4'>
                                    Mudah
                                </label>
                            </div>
                            <div className='flex items-center gap-2 '>
                                <input
                                    type='checkbox'
                                    id='check'
                                    onChange={() => {
                                        handleFetchKelasByLevelName('normal');
                                    }}
                                    checked={isChecked.normal}
                                    className='h-[28px] w-[28px] rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                                />
                                <label htmlFor='check' className='font-medium text-body-4'>
                                    Normal
                                </label>
                            </div>
                            <div className='flex items-center gap-2 '>
                                <input
                                    type='checkbox'
                                    id='check'
                                    onChange={() => {
                                        handleFetchKelasByLevelName('sulit');
                                    }}
                                    checked={isChecked.sulit}
                                    className='h-[28px] w-[28px] rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                                />
                                <label htmlFor='check' className='font-medium text-body-4'>
                                    Sulit
                                </label>
                            </div>
                            <div className='flex items-center gap-2 '>
                                <input
                                    type='checkbox'
                                    id='check'
                                    onChange={() => {
                                        handleFetchKelasByLevelName('semua');
                                    }}
                                    checked={isChecked.semua}
                                    className='h-[28px] w-[28px] rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                                />
                                <label htmlFor='check' className='font-medium text-body-4'>
                                    Semua
                                </label>
                            </div>
                        </div>
                    </div>
                    <div
                        style={{ height: 'calc(100vh - 100px)' }}
                        className='col-span-10 grid grid-cols-4 gap-[24px] overflow-y-scroll '>
                        {kelas?.length
                            ? kelas.map((kelasData, index) => {
                                  return (
                                      <div
                                          key={index}
                                          className='relative h-[400px] rounded-rad-7  bg-white  p-[14px] shadow-lg lg:col-span-1'>
                                          <div className='relative  h-[200px] w-full overflow-hidden rounded-rad-7'>
                                              <Image
                                                  alt=''
                                                  src={getImageFile(kelasData.image)}
                                                  fill
                                                  style={{ objectFit: 'cover' }}
                                              />
                                          </div>
                                          <h1 className='mt-[14px] text-body-1 font-bold'>{kelasData.name}</h1>
                                          <p className='mt-[6px]'>{formatDotString(kelasData.description, 40)}</p>
                                          {kelasData.status === 'jalan' ? (
                                              <div className='absolute bottom-[16px] right-[16px] flex items-center gap-5  rounded-[20px] bg-neutral-2  p-[10px]'>
                                                  <span className='font-bold text-white'>Lanjutkan belajar</span>
                                                  <ArrowButton
                                                      onClick={() => handlePilihKelas(kelasData.name.toLowerCase())}
                                                      directionIcon={'right'}
                                                  />
                                              </div>
                                          ) : kelasData.status === 'selesai' ? (
                                              <div className=' absolute bottom-[16px] right-[16px] flex items-center gap-5  rounded-[20px] bg-secondary-1 p-[10px]'>
                                                  <span className='font-bold text-white'>Belajar kembali</span>
                                                  <ArrowButton
                                                      onClick={() => handlePilihKelas(kelasData.name.toLowerCase())}
                                                      directionIcon={'right'}
                                                  />
                                              </div>
                                          ) : (
                                              <div className='absolute bottom-[16px] right-[16px] flex items-center gap-5  rounded-[20px] border-2 bg-primary-1  p-[10px] shadow-low'>
                                                  <span className='font-bold text-white'>Masuk Kelas</span>
                                                  <ArrowButton
                                                      onClick={() => handlePilihKelas(kelasData.name.toLowerCase())}
                                                      directionIcon={'right'}
                                                  />
                                              </div>
                                          )}
                                      </div>
                                  );
                              })
                            : null}
                    </div>
                </div>
            </main>
            <Transkrip transcript={transcript} isTrigger={displayTranscript} />
        </div>
    );
};

export default Kelas;
