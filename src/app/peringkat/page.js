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

    // STATE
    const [loadData, setLoadData] = useState(true);
    const [rank, setRank] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [transcript, setTrancript] = useState('');

    const [speechOn, setSpeechOn] = useState(false);
    const [skipTrigger, setSkipTrigger] = useState(false);
    const [isTrigger, setIsTrigger] = useState(false);
    const [introPage, setIntroPage] = useState(true);
    const [isClickButton, setClickButton] = useState(false); //clicking for skiping introPage

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
                                        setSkipTrigger(true);
                                    },
                                },
                                {
                                    text: `Saya juga akan diam, jika perintah sudah dilakukan. Tapi Anda jangan khawatir, panggil saja saya lagi dengan hi Uli atau hallo uli agar saya dapat mendengar Anda.`,
                                },
                                {
                                    text: 'Jika Anda masih bingung, Anda bisa ucapkan intruksi agar mendapatkan penjelasan lebih banyak.',
                                    actionOnEnd: () => {
                                        setIntroPage(false);
                                        setSkipTrigger(false);
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

    // init recognition
    useEffect(() => {
        try {
            recognition.start();
        } catch (error) {
            recognition.stop();
        }
    }, []);

    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event?.results[0][0]?.transcript?.toLowerCase();
            const cleanCommand = command?.replace('.', '');
            setTrancript(cleanCommand);
            console.log(cleanCommand);

            if (speechOn && !skipTrigger) {
                if (cleanCommand.includes('peringkat')) {
                    if (cleanCommand.includes('saya')) {
                        setSpeechOn(false);
                        if (!userRank.ranking) {
                            speechAction({
                                text: `Anda belum menyelesaikan materi, Silahkan belajar terlebih dahulu!`,
                                actionOnEnd: () => {
                                    setIsTrigger(false);
                                },
                            });
                            return;
                        }

                        if (userRank.ranking === 1) {
                            speechAction({
                                text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking}, dengan ${userRank.poin} poin.`,
                                actionOnEnd: () => {
                                    console.log(userRank);
                                    setIsTrigger(false);
                                },
                            });
                        } else if (userRank.ranking === 2) {
                            speechAction({
                                text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking} dengan poin ${userRank.poin}. Ayo tingkatkan lagi!`,
                                actionOnEnd: () => {
                                    console.log(userRank);
                                    setIsTrigger(false);
                                },
                            });
                        } else if (userRank.ranking === 3) {
                            speechAction({
                                text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking} dengan poin ${userRank.poin}. Ayo lebih semangat lagi belajarnya ${userName}!`,
                                actionOnEnd: () => {
                                    console.log(userRank);
                                    setIsTrigger(false);
                                },
                            });
                        } else {
                            speechAction({
                                text: `Anda sedang diperingkat ke - ${userRank.ranking} dengan poin ${userRank.poin}. Ayo lebih banyak lagi belajarnya ${userName}!`,
                                actionOnEnd: () => {
                                    console.log(userRank);
                                    setIsTrigger(false);
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
                                setIsTrigger(false);
                                router.push('/kelas');
                            },
                        });
                    } else if (cleanCommand.includes('beranda')) {
                        // moving to /beranda
                        setSpeechOn(false);
                        speechAction({
                            text: `Anda akan menuju halaman beranda`,
                            actionOnEnd: () => {
                                setIsTrigger(false);
                                router.push('/');
                            },
                        });
                    } else if (cleanCommand.includes('rapor')) {
                        // moving to /rapor
                        setSpeechOn(false);
                        speechAction({
                            text: `Anda akan menuju halaman Rapor`,
                            actionOnEnd: () => {
                                setIsTrigger(false);
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
                            setIsTrigger(false);
                        },
                    });
                }
            }

            if (!skipTrigger) {
                if (cleanCommand.includes('muat')) {
                    if (cleanCommand.includes('ulang')) {
                        if (cleanCommand.includes('halaman')) {
                            setSpeechOn(false);
                            speechAction({
                                text: `Anda akan load halaman ini!`,
                                actionOnEnd: () => {
                                    setIsTrigger(false);
                                    setLoadData(true);
                                },
                            });
                        }
                    }
                } else if (cleanCommand.includes('hallo') || cleanCommand.includes('halo') || cleanCommand.includes('hai')) {
                    if (cleanCommand.includes('uli')) {
                        stopSpeech();
                        speechAction({
                            text: `Hai ${userName}, saya mendengarkan Anda!`,
                            actionOnStart: () => {
                                setIsTrigger(true);
                            },
                            actionOnEnd: () => {
                                setSpeechOn(true);
                            },
                        });
                    }
                }
            }

            if (!introPage) {
                if (cleanCommand.includes('intruksi')) {
                    setSpeechOn(false);
                    speechWithBatch({
                        speechs: [
                            {
                                text: `Hai ${userName}, sekarang Anda mendengarkan intruksi di halaman beranda.`,
                                actionOnEnd: () => {
                                    setSkipTrigger(true);
                                    setIsTrigger(false);
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
                                    setSkipTrigger(false);
                                },
                            },
                        ],
                    });
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
                        setIsTrigger(false);
                        setSpeechOn(false);
                    },
                });
            }, 10000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [router, userName, userRank, speechOn, skipTrigger, introPage]);

    //effects
    useEffect(() => {
        const spaceButtonIntroAction = (event) => {
            buttonAction({
                event: event,
                key: ' ',
                keyCode: 32,
                action: () => {
                    if (!isClickButton) {
                        stopSpeech();
                        speechAction({
                            text: 'Anda melewati Intro Halaman',
                            actionOnEnd: () => {
                                setIntroPage(false);
                                setSkipTrigger(false);
                                setClickButton(true);
                            },
                        });
                    }
                },
            });
        };
        window.addEventListener('keydown', spaceButtonIntroAction);

        return () => {
            window.removeEventListener('keydown', spaceButtonIntroAction);
        };
    }, [isClickButton]);

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
            <Transkrip transcript={transcript} isTrigger={isTrigger} />
        </section>
    );
};

export default Peringkat;
