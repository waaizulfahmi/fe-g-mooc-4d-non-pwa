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
import { useRouter } from 'next/navigation';

// third party
import { useSession } from 'next-auth/react';

// redux
// ---

// components
import Navbar from '@/components/Navbar';
import Transkrip from '@/components/Transkrip';

// datas
// ---

// apis
import { userGetPeringkatApi } from '@/axios/user';

// utils
import { ApiResponseError } from '@/utils/error-handling';
import { recognition } from '@/utils/speech-recognition';
import { speechAction, speechWithBatch, stopSpeech } from '@/utils/text-to-speech';
import { buttonAction } from '@/utils/space-button-action';

const Peringkat = () => {
    const { data } = useSession();
    const token = data?.user?.token;
    const userName = data?.user?.name;
    const router = useRouter();

    // COMMON STATE
    const [loadData, setLoadData] = useState(true);
    const [rank, setRank] = useState([]);
    const [userRank, setUserRank] = useState(null);

    // ACCESSIBILITY STATE
    const [speechOn, setSpeechOn] = useState(false); // state untuk  speech recognition
    const [transcript, setTrancript] = useState(''); // state untuk menyimpan transcript hasil speech recognition
    const [skipSpeech, setSkipSpeech] = useState(false); // state untuk  mengatasi speech recogniton ter-trigger
    const [displayTranscript, setDisplayTranscript] = useState(false); // state untuk  menampilkan transcript
    const [isClickButton, setIsClickButton] = useState(false); // state untuk aksi tombol
    const [isPlayIntruction, setIsPlayIntruction] = useState(false); // state  ketika intruksi berjalan

    // FUNC
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

    // EFFECT
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
                const fetchApiPeringkat = async () => {
                    try {
                        const response = await userGetPeringkatApi({ token });
                        setRank(response?.ranking);
                        setUserRank(response?.user);

                        console.log(response);
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
                                        // setIntroPage(false);
                                        setSkipSpeech(false);
                                    },
                                },
                            ],
                        });
                    } catch (error) {
                        if (error instanceof ApiResponseError) {
                            console.log(`ERR CLASS ENROLLMENT API MESSAGE: `, error.message);
                            console.log(error.data);
                            return;
                        }
                        console.log(`MESSAGE: `, error.message);
                    }
                };
                fetchApiPeringkat();
            }
        }
    }, [token, loadData, userName]);

    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event?.results[0][0]?.transcript?.toLowerCase();
            const cleanCommand = command?.replace('.', '');
            setTrancript(cleanCommand);
            console.log(cleanCommand);

            if (speechOn && !skipSpeech) {
                if (cleanCommand.includes('peringkat')) {
                    if (cleanCommand.includes('saya')) {
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
                                    console.log(userRank);
                                    setDisplayTranscript(false);
                                },
                            });
                        } else if (userRank.ranking === 2) {
                            speechAction({
                                text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking} dengan poin ${userRank.poin}. Ayo tingkatkan lagi!`,
                                actionOnEnd: () => {
                                    console.log(userRank);
                                    setDisplayTranscript(false);
                                },
                            });
                        } else if (userRank.ranking === 3) {
                            speechAction({
                                text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking} dengan poin ${userRank.poin}. Ayo lebih semangat lagi belajarnya ${userName}!`,
                                actionOnEnd: () => {
                                    console.log(userRank);
                                    setDisplayTranscript(false);
                                },
                            });
                        } else {
                            speechAction({
                                text: `Anda sedang diperingkat ke - ${userRank.ranking} dengan poin ${userRank.poin}. Ayo lebih banyak lagi belajarnya ${userName}!`,
                                actionOnEnd: () => {
                                    console.log(userRank);
                                    setDisplayTranscript(false);
                                },
                            });
                        }
                    }
                } else if (cleanCommand.includes('pergi')) {
                    if (cleanCommand.includes('kelas')) {
                        // moving to /kelas
                        setSpeechOn(false);
                        speechAction({
                            text: `Anda akan menuju halaman Daftar Kelas`,
                            actionOnEnd: () => {
                                setDisplayTranscript(false);
                                router.push('/kelas');
                            },
                        });
                    } else if (cleanCommand.includes('beranda')) {
                        // moving to /beranda
                        setSpeechOn(false);
                        speechAction({
                            text: `Anda akan menuju halaman beranda`,
                            actionOnEnd: () => {
                                setDisplayTranscript(false);
                                router.push('/');
                            },
                        });
                    } else if (cleanCommand.includes('rapor')) {
                        // moving to /rapor
                        setSpeechOn(false);
                        speechAction({
                            text: `Anda akan menuju halaman Rapor`,
                            actionOnEnd: () => {
                                setDisplayTranscript(false);
                                router.push('/rapor');
                            },
                        });
                    }
                } else if (
                    cleanCommand.includes('saya sekarang dimana') ||
                    cleanCommand.includes('saya sekarang di mana') ||
                    cleanCommand.includes('saya di mana') ||
                    cleanCommand.includes('saya dimana')
                ) {
                    setSpeechOn(false);
                    speechAction({
                        text: `Kita sedang di halaman Peringkat`,
                        actionOnEnd: () => {
                            setDisplayTranscript(false);
                        },
                    });
                } else if (cleanCommand.includes('jelaskan')) {
                    if (cleanCommand.includes('intruksi') || cleanCommand.includes('instruksi')) {
                        console.log('dapet nih');
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
                } else if (cleanCommand.includes('muat')) {
                    if (cleanCommand.includes('ulang')) {
                        if (cleanCommand.includes('halaman')) {
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
            }

            if (!skipSpeech) {
                if (cleanCommand.includes('hallo') || cleanCommand.includes('halo') || cleanCommand.includes('hai')) {
                    if (cleanCommand.includes('uli')) {
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
    }, [router, userName, userRank, speechOn, skipSpeech]);

    //effects
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
    }, [isClickButton, isPlayIntruction]);

    return (
        <section className='h-screen bg-primary-1'>
            <Navbar />
            <main className='mx-auto max-w-screen-xl  pt-[80px] '>
                <div className='mt-[20px] flex items-center justify-center gap-[60px]'>
                    <Image alt='' src={'/images/mahkota.svg'} width={80} height={40} />
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
        </section>
    );
};

export default Peringkat;
