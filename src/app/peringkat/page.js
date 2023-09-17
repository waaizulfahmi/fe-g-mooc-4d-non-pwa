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
import { speechAction } from '@/utils/text-to-speech';

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

    // const dataMhs = [
    //     {
    //         id: 1,
    //         name: 'Arief Rachman Hakim',
    //     },
    //     {
    //         id: 2,
    //         name: 'Budi Agung Raharjo',
    //     },
    //     {
    //         id: 3,
    //         name: 'Alexa Maharini',
    //     },
    //     {
    //         id: 4,
    //         name: 'Sultan Agung Alexander',
    //     },
    //     {
    //         id: 5,
    //         name: 'Budi Susanto',
    //     },
    // ];

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

                        console.log(response.ranking);
                        speechAction({
                            text: `Selamat datang di halaman Peringkat, ${userName}.`,
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

            if (cleanCommand.includes('peringkat')) {
                if (cleanCommand.includes('saya')) {
                    if (userRank.ranking === 1) {
                        speechAction({
                            text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking}.`,
                            actionOnEnd: () => {
                                console.log(userRank);
                            },
                        });
                    } else if (userRank.ranking === 2) {
                        speechAction({
                            text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking}. Ayo tingkatkan lagi!`,
                            actionOnEnd: () => {
                                console.log(userRank);
                            },
                        });
                    } else if (userRank.ranking === 3) {
                        speechAction({
                            text: `Selamat, Anda sedang diperingkat ke ${userRank.ranking}. Ayo lebih semangat lagi belajarnya ${userName}!`,
                            actionOnEnd: () => {
                                console.log(userRank);
                            },
                        });
                    } else {
                        speechAction({
                            text: `Anda sedang diperingkat ke - ${userRank.ranking}. Ayo lebih banyak lagi belajarnya ${userName}!`,
                            actionOnEnd: () => {
                                console.log(userRank);
                            },
                        });
                    }
                }
            } else if (cleanCommand.includes('pergi')) {
                if (cleanCommand.includes('kelas')) {
                    // moving to /kelas
                    speechAction({
                        text: `Anda akan menuju halaman Daftar Kelas`,
                        actionOnEnd: () => {
                            router.push('/kelas');
                        },
                    });
                } else if (cleanCommand.includes('beranda')) {
                    // moving to /beranda
                    speechAction({
                        text: `Anda akan menuju halaman beranda`,
                        actionOnEnd: () => {
                            router.push('/');
                        },
                    });
                } else if (cleanCommand.includes('rapor')) {
                    // moving to /rapor
                    speechAction({
                        text: `Anda akan menuju halaman Rapor`,
                        actionOnEnd: () => {
                            router.push('/rapor');
                        },
                    });
                }
            } else if (cleanCommand.includes('muat')) {
                if (cleanCommand.includes('ulang')) {
                    if (cleanCommand.includes('halaman')) {
                        speechAction({
                            text: `Anda akan load halaman ini!`,
                            actionOnEnd: () => {
                                setLoadData(true);
                            },
                        });
                    }
                }
            } else if (
                cleanCommand.includes('saya sekarang dimana') ||
                cleanCommand.includes('saya sekarang di mana') ||
                cleanCommand.includes('saya di mana') ||
                cleanCommand.includes('saya dimana')
            ) {
                speechAction({
                    text: `Kita sedang di halaman Peringkat`,
                });
            }
            setTrancript(cleanCommand);
            console.log(cleanCommand);
        };

        recognition.onend = () => {
            recognition.start();
        };
    }, [router, userName, userRank]);

    return (
        <section className='h-screen bg-primary-1'>
            <Navbar />
            <main className='mx-auto max-w-screen-xl  pt-[80px] '>
                <div className='mt-[20px] flex items-center justify-center gap-[60px]'>
                    <Image alt='' src={'/images/mahkota.svg'} width={80} height={40} />
                    <h1 className='text-[48px] font-bold text-white'>Peringkat</h1>
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
            <Transkrip transcript={transcript} />
        </section>
    );
};

export default Peringkat;
