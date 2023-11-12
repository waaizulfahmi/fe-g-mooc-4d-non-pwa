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
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// third party
import { useSession } from 'next-auth/react';
import * as tf from '@tensorflow/tfjs';

// redux
import { useSelector, useDispatch } from 'react-redux';
import { getIsPermit, checkPermissionSlice } from '@/redux/check-permission';

// components
import Navbar from '@/components/Navbar';
import Transkrip from '@/components/Transkrip';
import CheckPermission from '@/components/CheckPermission';

// datas
// ---

// apis
import { userGetPeringkatApi } from '@/axios/user';

// utils
import { ApiResponseError } from '@/utils/error-handling';
import { recognition } from '@/utils/speech-recognition';
import { speechAction, speechWithBatch, stopSpeech } from '@/utils/text-to-speech';
import { buttonAction } from '@/utils/space-button-action';
import { punctuationRemoval, stemming, removeStopwords } from '@/utils/special-text';
import { calculateTFIDFWithWeights } from '@/utils/tfidf';
import { browserPermission } from '@/utils/browserPermission';

//hooks
import { useCheckReloadPage, useCheckScreenOrientation, useMl, useMovePage } from '@/hooks';

// not-related state function
const handleColorPeringkat = (urutan) => {
    switch (urutan) {
        case 1: {
            return 'bg-[#FFD700]';
        }
        case 2: {
            return 'bg-[#C0C0C0]';
        }
        case 3: {
            return 'bg-[#CD7F32]';
        }
        default: {
            return 'bg-[#EDF3F3]';
        }
    }
};

export default function PeringkatPage() {
    /* SETUP */
    const { data } = useSession();
    const token = data?.user?.token;
    const userName = data?.user?.name;
    const pathname = usePathname();

    /* REDUX */
    const dispatch = useDispatch();
    const isPermit = useSelector(getIsPermit);
    const { setCameraStatus, setMicrophoneStatus, setIsPermit } = checkPermissionSlice.actions;

    /* CUSTOM HOOKS */
    const { sessioName } = useCheckReloadPage({ name: pathname });
    const { handleMovePage } = useMovePage(sessioName);
    const { windowSize } = useCheckScreenOrientation();
    const { model, vocab, labelEncoder } = useMl();

    /* COMMON STATE */
    const [loadData, setLoadData] = useState(true);
    const [rank, setRank] = useState([]);
    const [userRank, setUserRank] = useState(null);

    /* ACCESSIBILITY STATE */
    const [speechOn, setSpeechOn] = useState(false); // state untuk  speech recognition
    const [transcript, setTrancript] = useState(''); // state untuk menyimpan transcript hasil speech recognition
    const [skipSpeech, setSkipSpeech] = useState(false); // state untuk  mengatasi speech recogniton ter-trigger
    const [displayTranscript, setDisplayTranscript] = useState(false); // state untuk  menampilkan transcript
    const [isClickButton, setIsClickButton] = useState(false); // state untuk aksi tombol
    const [isPlayIntruction, setIsPlayIntruction] = useState(false); // state  ketika intruksi berjalan

    /* FUNCTION */
    // This func related with state
    // --

    /* EFFECTS */
    useEffect(() => {
        const deleteSessionReload = () => {
            console.log('it worked peringkat');
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
        if (token) {
            if (loadData) {
                const fetchApiPeringkat = async () => {
                    try {
                        const response = await userGetPeringkatApi({ token });
                        setRank(response?.ranking);
                        setUserRank(response?.user);

                        //console.log(response);
                        speechWithBatch({
                            speechs: [
                                {
                                    text: `Selamat datang di halaman Peringkat, ${userName}. Pada halaman ini Anda dapat mengetahui peringkat Anda saat ini, dengan mengucapkan peringkat saya`,
                                    actionOnStart: () => {
                                        setSkipSpeech(true);
                                    },
                                },
                                {
                                    text: `Saya juga akan diam, jika perintah sudah dilakukan. Tapi Anda jangan khawatir, panggil saja saya lagi dengan hi Uli atau hallo uli agar saya dapat mendengar Anda.`,
                                },
                                {
                                    text: 'Jika Anda masih bingung, Anda bisa ucapkan intruksi agar mendapatkan penjelasan lebih banyak.',
                                    actionOnEnd: () => {
                                        setSkipSpeech(false);
                                    },
                                },
                            ],
                        });
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
                                        handleMovePage('/must-verify', 'replace', false);
                                    },
                                });
                            }
                            return;
                        }
                        //console.log(`MESSAGE: `, error.message);
                    }
                };
                fetchApiPeringkat();
            }
            setLoadData(false);
        }
    }, [token, loadData, userName, handleMovePage]);

    // Processing Speech Recognition
    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event?.results[0][0]?.transcript?.toLowerCase();
            const cleanCommand = command?.replace('.', '');
            // console.log({
            //     cleanCommand,
            // });

            if (speechOn && !skipSpeech) {
                const removePunctuationWords = punctuationRemoval(cleanCommand);
                const stemmingWords = stemming(removePunctuationWords);
                const removedStopWords = removeStopwords(stemmingWords);
                // console.log({
                //     removePunc: removePunctuationWords,
                //     stem: stemmingWords,
                //     removeStop: removedStopWords,
                // });

                if (!model || !vocab || !labelEncoder) {
                    //console.error('Model, vocab, label encoder  belum dimuat.');
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
                    if (cleanCommand.includes('jelaskan')) {
                        if (cleanCommand.includes('intruksi') || cleanCommand.includes('instruksi')) {
                            setTrancript('jelaskan instruksi');
                            //console.log('dapet nih');
                            setSpeechOn(false);
                            setIsClickButton(false);
                            setIsPlayIntruction(true);
                            speechWithBatch({
                                speechs: [
                                    {
                                        text: `Hai ${userName}, sekarang Anda mendengarkan intruksi di halaman peringkat.`,
                                        actionOnStart: () => {
                                            setSkipSpeech(true);
                                        },
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    },
                                    {
                                        text: `Perintah untuk mengetahui peringkat Anda dengan mengucapkan peringkat saya`,
                                    },
                                    {
                                        text: `Jika Anda tersesat, Anda dapat mengucapkan saya dimana`,
                                    },
                                    {
                                        text: `Untuk navigasi halaman, Anda dapat mengucapkan pergi ke halaman yang Anda tuju, misalnya pergi ke kelas, pada halaman ini Anda dapat pergi ke halaman kelas, raport, dan peringkat`,
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
                    }

                    // prediction
                    if (checkValueOfResult !== 0) {
                        const predictedCommand = labelEncoder[predictedClassIndex];
                        // console.log({
                        //     'Check value result ': checkValueOfResult,
                        //     'Predicted command ': predictedCommand,
                        // });
                        if (predictedCommand.includes('peringkat')) {
                            if (predictedCommand.includes('saya')) {
                                setTrancript(predictedCommand);
                                setSpeechOn(false);
                                if (!userRank?.ranking || !userRank) {
                                    speechAction({
                                        text: `Anda belum menyelesaikan materi, Silahkan belajar terlebih dahulu!`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    });
                                    return;
                                }

                                if (userRank.ranking === 1) {
                                    speechAction({
                                        text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking}, dengan ${userRank.poin} poin.`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    });
                                } else if (userRank.ranking === 2) {
                                    speechAction({
                                        text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking} dengan poin ${userRank.poin}. Ayo tingkatkan lagi!`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    });
                                } else if (userRank.ranking === 3) {
                                    speechAction({
                                        text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking} dengan poin ${userRank.poin}. Ayo lebih semangat lagi belajarnya ${userName}!`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    });
                                } else {
                                    speechAction({
                                        text: `Anda sedang diperingkat ke - ${userRank.ranking} dengan poin ${userRank.poin}. Ayo lebih banyak lagi belajarnya ${userName}!`,
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    });
                                }
                            }
                        } else if (predictedCommand.includes('pergi')) {
                            if (predictedCommand.includes('kelas')) {
                                setTrancript(predictedCommand);
                                // moving to /kelas
                                setSpeechOn(false);
                                speechAction({
                                    text: `Anda akan menuju halaman Daftar Kelas`,
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);

                                        handleMovePage('/kelas');
                                    },
                                });
                            } else if (predictedCommand.includes('beranda')) {
                                setTrancript(predictedCommand);
                                // moving to /beranda
                                setSpeechOn(false);
                                speechAction({
                                    text: `Anda akan menuju halaman beranda`,
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);

                                        handleMovePage('/');
                                    },
                                });
                            } else if (predictedCommand.includes('rapor')) {
                                setTrancript(predictedCommand);
                                // moving to /rapor
                                setSpeechOn(false);
                                speechAction({
                                    text: `Anda akan menuju halaman Rapor`,
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);

                                        handleMovePage('/rapor');
                                    },
                                });
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
                                text: `Kita sedang di halaman Peringkat`,
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
                                        text: `Anda akan load halaman ini!`,
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
                        if (cleanCommand.includes('jelaskan intruksi') || cleanCommand.includes('jelaskan instruksi')) {
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
    }, [handleMovePage, userName, userRank, speechOn, skipSpeech, labelEncoder, model, vocab]);

    // Space Keyboard Setup
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
                                    // setIntroPage(false);
                                    setSkipSpeech(false);
                                    setIsClickButton(true);
                                    setIsPlayIntruction(false);
                                },
                            });
                        } else {
                            speechAction({
                                text: 'Anda melewati Intro Halaman',
                                actionOnEnd: () => {
                                    // setIntroPage(false);
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
    }, [isClickButton, isPlayIntruction, isPermit]);

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
                    <b>Maaf</b>, Aplikasi tidak dapat berjalan dengan baik pada layar {windowSize.innerWidth}px. Buka di layar lebih dari
                    640px atau gunakan
                    <b> laptop</b>.
                </h1>
            </div>
        );
    }

    return (
        <section className='h-screen bg-primary-1'>
            <Navbar />
            <main className='mx-auto max-w-screen-xl  pt-[80px] '>
                <div className='mt-[20px] flex items-center justify-center gap-[60px]'>
                    <Image alt='mahkota' src={'/images/mahkota.svg'} width={80} height={40} priority />
                    <h1 className='text-[48px] font-bold text-white'>Papan Peringkat</h1>
                </div>
                <div
                    style={{ height: 'calc(100vh - 222px)' }}
                    className='mt-[40px] overflow-y-scroll rounded-rad-7 bg-white p-[12px]'>
                    {rank?.length
                        ? rank.map((mhs, idx) => (
                              <div
                                  key={idx + 1}
                                  className={`${handleColorPeringkat(
                                      mhs.ranking,
                                  )} mb-[12px] flex h-[80px] items-center  justify-between overflow-hidden rounded-rad-7 `}>
                                  <div className='flex h-full items-center gap-[24px]'>
                                      <div
                                          style={{
                                              boxShadow: '4px 0px 4px 0px rgba(0, 0, 0, 0.25)',
                                          }}
                                          className={`${handleColorPeringkat(
                                              mhs.ranking,
                                          )} flex h-full w-[54px] items-center justify-center rounded-br-[20px]  rounded-tr-[20px]  `}>
                                          <span className='text-[26px] font-bold text-primary-1'>{idx + 1}</span>
                                      </div>
                                      <p className='text-[26px] font-bold text-primary-1'>{mhs.user.name}</p>
                                  </div>
                                  <h1 className='mr-[42px] text-[26px] font-bold text-primary-1'>{mhs.poin} Poin</h1>
                              </div>
                          ))
                        : null}
                </div>
            </main>
            <Transkrip transcript={transcript} isTrigger={displayTranscript} />
            <CheckPermission />
        </section>
    );
}
