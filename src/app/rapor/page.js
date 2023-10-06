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
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PropTypes from 'prop-types';

// third party
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

// redux
// ---

// components
import FillButton from '@/components/FillButton';
import Navbar from '@/components/Navbar';
import BorderedButton from '@/components/BorderedButton';
import Transkrip from '@/components/Transkrip';

// datas
import { Rapot } from '@/data/model';

// apis
//---

// utils
import { speechAction, speechWithBatch, stopSpeech } from '@/utils/text-to-speech';
import { recognition } from '@/utils/speech-recognition';
import { ApiResponseError } from '@/utils/error-handling';
import { getImageFile } from '@/utils/get-server-storage';
import { apiInstance } from '@/axios/instance';
import { buttonAction } from '@/utils/space-button-action';

const userGetRapotApi = async ({ token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');

        const response = await apiInstance.get(`/user/rapor`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            //custom from backend

            // const errorMsgGJadi = error?.response?.data?.metadata?.message; // yg g jadi
            const errorMsg = error?.response?.data?.message; // yg jadi

            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

const DisplayClass = ({ listClass }) => {
    // console.log('Classs nilai: ', listClass);
    return (
        <>
            {listClass?.length
                ? listClass.map((rClass, idx) => {
                      // console.log('Classs nilai: ', rClass);
                      return (
                          <div
                              key={idx + 1}
                              className='flex items-center justify-between rounded-rad-7 bg-[#F5F5F5] px-[24px] py-[14px]'>
                              <div className='flex items-center gap-[34px]'>
                                  <Image alt='' src={getImageFile(rClass.image)} width={54} height={54} />
                                  <p className='text-[18px] font-bold leading-[24px]'>{rClass.name}</p>
                              </div>
                              <div className='flex items-center gap-[16px]'>
                                  <div className='flex flex-col rounded-rad-3 bg-secondary-1 px-[21px] py-[8px]'>
                                      <span className='text-[24px] font-bold text-white '>{rClass.progress}</span>
                                      <span className='text-[12px] font-bold text-white'>Kemajuan</span>
                                  </div>
                                  {rClass.progress === '100%' ? (
                                      <BorderedButton className='border-primary-1 px-[58px] py-[18px] text-[24px] text-primary-1'>
                                          Selesai
                                      </BorderedButton>
                                  ) : (
                                      <FillButton className=' px-[58px] py-[18px] text-[24px]'>Lanjut</FillButton>
                                  )}
                              </div>
                          </div>
                      );
                  })
                : null}
        </>
    );
};

DisplayClass.propTypes = {
    listClass: PropTypes.array,
};

const Rapor = () => {
    const { data } = useSession();
    const token = data?.user?.token;
    const userName = data?.user?.name;
    const router = useRouter();

    // STATE
    const [playingIntruksi, setPlayingIntruksi] = useState(false);
    const [classShow, setClassShow] = useState('progress'); // progress || done
    const [loadData, setLoadData] = useState(true);
    const [countFinishedClass, setCountFinishedClass] = useState(0);
    const [totalPoin, setTotalPoin] = useState(0);
    const [runningClass, setRunningClass] = useState([]);
    const [finishedClass, setFinishedClass] = useState([]);
    const [totalPelajaran, setTotalPelajaran] = useState([]);
    const [transcript, setTrancript] = useState('');
    const [speechOn, setSpeechOn] = useState(false);
    const [skipTrigger, setSkipTrigger] = useState(false);
    const [introPage, setIntroPage] = useState(true);
    const [isTrigger, setIsTrigger] = useState(false);
    const [isClickButton, setClickButton] = useState(false); //clicking for skiping introPage

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
        if (token) {
            if (loadData) {
                const fetchApiRapot = async () => {
                    try {
                        const response = await userGetRapotApi({ token });

                        const rapot = new Rapot({
                            totalPoin: response.total_poin,
                            nilai: response.nilai,
                            jumlahSelesai: response.jumlah_selesai,
                            kelasProgress: response.kelas_progress,
                            kelasSelesai: response.kelas_selesai,
                            rataProgress: response.rata_progress,
                        });

                        console.log('Response rapor: ', response);

                        setTotalPoin(rapot.getTotalPoin());
                        setCountFinishedClass(rapot.getJumlahSelesai());
                        setRunningClass(rapot.getKelasProgress());
                        setTotalPelajaran(rapot.getKelasProgress());
                        setFinishedClass(rapot.getKelasSelesai());

                        console.log('response selesai : ', rapot.getKelasSelesai());

                        speechWithBatch({
                            speechs: [
                                {
                                    text: `Selamat datang di halaman rapor, ${userName}. total poin anda adalah ${rapot.getTotalPoin()},  ${
                                        rapot.getKelasSelesai().length === 0
                                            ? 'namun, Anda belum menyelesaikan kelas apapun'
                                            : `jumlah kelas yang sudah di selesaikan adalah ${
                                                  rapot.getKelasSelesai().length
                                              } kelas`
                                    } `,
                                    actionOnStart: () => {
                                        setSkipTrigger(true);
                                    },
                                },
                                {
                                    text: `Dalam halaman ini, terdapat kelas yang sedang berjalan dan yang sudah selesai, `,
                                },
                                {
                                    text: ` untuk mencari kelas berjalan, Anda dapat mengucapkan cari kelas berjalan. untuk mencari kelas selesai,  Anda dapat mengucapkan cari kelas selesai`,
                                },
                                {
                                    text: 'Jangan lupa untuk panggil saya terlebih dahulu dengan hai atau halo uli.agar saya bisa mendengar Anda',
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

                        // console.log('semua peljara:', rapot.getSemuaPelajaran());
                        // console.log(response);
                        // console.log(rapot);
                    } catch (error) {
                        if (error instanceof ApiResponseError) {
                            console.log(`ERR RAPOT API MESSAGE: `, error.message);
                            console.log(error.data);
                            return;
                        }
                        console.log(`MESSAGE: `, error.message);
                    }
                };
                fetchApiRapot();
            }
            setLoadData(false);
        }
    }, [token, loadData, userName]);

    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            const cleanCommand = command?.replace('.', '');
            setTrancript(cleanCommand);
            console.log(cleanCommand);

            if (speechOn && !skipTrigger) {
                if (cleanCommand.includes('pergi')) {
                    if (cleanCommand.includes('beranda')) {
                        setSpeechOn(false);
                        speechAction({
                            text: 'Anda akan menuju halaman Beranda',
                            actionOnEnd: () => {
                                setIsTrigger(false);
                                router.push('/');
                            },
                        });
                    } else if (cleanCommand.includes('kelas')) {
                        setSpeechOn(false);
                        speechAction({
                            text: 'Anda akan menuju halaman Kelas',
                            actionOnEnd: () => {
                                setIsTrigger(false);
                                router.push('/kelas');
                            },
                        });
                    } else if (cleanCommand.includes('peringkat')) {
                        setSpeechOn(false);
                        speechAction({
                            text: 'Anda akan menuju halaman Peringkat',
                            actionOnEnd: () => {
                                setIsTrigger(false);
                                router.push('/peringkat');
                            },
                        });
                    }
                } else if (
                    command.includes('saya sekarang dimana') ||
                    command.includes('saya sekarang di mana') ||
                    command.includes('saya di mana') ||
                    command.includes('saya dimana')
                ) {
                    setSpeechOn(false);
                    speechAction({
                        text: `Kita sedang di halaman rapot`,
                        actionOnEnd: () => {
                            setIsTrigger(false);
                        },
                    });
                } else if (command.includes('cari')) {
                    if (cleanCommand.includes('kelas')) {
                        if (cleanCommand.includes('selesai')) {
                            setSpeechOn(false);
                            console.log('Kelaas selese: ', finishedClass);
                            if (finishedClass.length === 0) {
                                speechAction({
                                    text: `Belum ada nilai!, Anda belum menyelesaikan kelas satu pun!`,
                                    actionOnEnd: () => {
                                        setIsTrigger(false);
                                    },
                                });
                                return;
                            }
                            speechAction({
                                text: `Berikut daftar kelas yang telah selesai`,
                                actionOnEnd: () => {
                                    setIsTrigger(false);
                                    setClassShow('done');
                                    setTotalPelajaran(finishedClass);
                                },
                            });
                            for (let i = 0; i < finishedClass.length; i++) {
                                const namaKelas = finishedClass[i].name;
                                const progress = finishedClass[i].progress;
                                speechAction({
                                    text: `${namaKelas} dengan kemajuan ${progress}`,
                                });
                            }
                        } else if (cleanCommand.includes('berjalan')) {
                            setSpeechOn(false);
                            console.log('Kelaas jalan: ', runningClass);
                            speechAction({
                                text: `Berikut daftar kelas yang sedang berjalan`,
                                actionOnEnd: () => {
                                    setIsTrigger(false);
                                    setClassShow('progress');
                                    setTotalPelajaran(runningClass);
                                },
                            });
                            for (let i = 0; i < runningClass.length; i++) {
                                const namaKelas = runningClass[i].name;
                                const progress = runningClass[i].progress;
                                speechAction({
                                    text: `${namaKelas} dengan kemajuan ${progress}`,
                                });
                            }
                            if (runningClass?.length > 0) {
                                speechAction({
                                    text: `Untuk melanjutkan belajar di kelas, Anda dapat mengucapkan belajar lagi diikuti nama kelas, contohnya belajar lagi kelas ${runningClass[0].name}`,
                                });
                            }
                        } else {
                            setSpeechOn(false);
                            const kelasCommand = cleanCommand.replace('cari kelas', '').trim();
                            if (classShow === 'progress') {
                                const findKelas = runningClass.find((k) => k.name.toLowerCase() === kelasCommand);

                                if (!findKelas) {
                                    console.log(kelasCommand.length);
                                    if (kelasCommand.length >= 10) {
                                        speechAction({
                                            text: `kelas tidak ditemukan!, sepertinya suara yang Anda ucap kurang jelas, Anda bisa ulangi lagi!`,
                                        });
                                    } else {
                                        speechAction({
                                            text: `kelas tidak ditemukan!`,
                                        });
                                    }
                                    return;
                                }
                                speechWithBatch({
                                    speechs: [
                                        {
                                            text: `Ditemukan nilai dari kelas yang masih berjalan, yaitu ${kelasCommand}`,
                                        },
                                        {
                                            text: `Pada kelas ${kelasCommand}, kemajuan pembelajaran Anda adalah ${findKelas.progress}.`,
                                        },
                                        {
                                            text: 'Ayo selesaikan kelas Anda, agar dapat menjadi peringkat teratas!',
                                            actionOnEnd: () => {
                                                setIsTrigger(false);
                                            },
                                        },
                                    ],
                                });
                            }
                        }
                    }
                } else if (command.includes('belajar')) {
                    if (command.includes('lagi')) {
                        setSpeechOn(false);
                        const enrollClass = cleanCommand.replace('belajar lagi', '').trim();
                        const findKelas = runningClass.find((k) => k.name.toLowerCase() === enrollClass);
                        if (findKelas) {
                            speechAction({
                                text: `Anda akan belajar lagi kelas ${enrollClass}`,
                                actionOnEnd: () => {
                                    setIsTrigger(false);
                                    router.push(`/kelas/${enrollClass}`);
                                },
                            });
                        }
                    }
                } else if (cleanCommand.includes('jelaskan')) {
                    if (cleanCommand.includes('intruksi') || cleanCommand.includes('instruksi')) {
                        console.log('dapet nih');
                        setSpeechOn(false);
                        setClickButton(false);
                        setPlayingIntruksi(true);
                        speechWithBatch({
                            speechs: [
                                {
                                    text: `Hai ${userName}, sekarang Anda mendengarkan intruksi di halaman raport.`,
                                    actionOnStart: () => {
                                        setSkipTrigger(true);
                                    },
                                    actionOnEnd: () => {
                                        setIsTrigger(false);
                                    },
                                },
                                {
                                    text: `Perintah untuk mencari kelas yang sudah Anda pelajari dengan mengucapkan Cari Kelas selesai`,
                                },
                                {
                                    text: `Perintah untuk mencari kelas yang sedang berjalan dengan mengucapkan Cari Kelas berjalan`,
                                },
                                {
                                    text: `Perintah untuk kembali belajar di kelas yang sedang berjalan dengan mengucapkan Belajar Kembali yang diikuti nama kelas, misalnya belajar kembali kelas html`,
                                },
                                {
                                    text: `Untuk navigasi halaman Anda dapat mengucapkan pergi ke halaman yang Anda tuju, misalnya pergi ke beranda, pada halaman ini Anda dapat pergi ke halaman beranda, kelas, dan peringkat`,
                                },
                                {
                                    text: `jangan lupa, Anda harus ucapkan terlebih dahulu hi Uli atau hallo uli agar saya dapat mendengar Anda. Jika tidak ada perintah apapun saya akan diam dalam 10 detik.`,
                                    actionOnEnd: () => {
                                        setSkipTrigger(false);
                                        setPlayingIntruksi(false);
                                    },
                                },
                            ],
                        });
                    }
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
                                    setClickButton(false);
                                    setIsTrigger(false);
                                    setClassShow('progress');
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
                        // console.log('speech diclear');
                        setIsTrigger(false);
                        setSpeechOn(false);
                    },
                });
            }, 10000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [router, finishedClass, runningClass, classShow, speechOn, skipTrigger, userName, introPage]);

    //effects
    useEffect(() => {
        const spaceButtonIntroAction = (event) => {
            buttonAction({
                event: event,
                key: ' ',
                keyCode: 32,
                action: () => {
                    if (!isClickButton) {
                        if (playingIntruksi) {
                            setSpeechOn(false);
                            stopSpeech();
                            speechAction({
                                text: 'Anda mematikan intruksi',
                                actionOnEnd: () => {
                                    setIsTrigger(false);
                                    setIntroPage(false);
                                    setSkipTrigger(false);
                                    setClickButton(true);
                                    setPlayingIntruksi(false);
                                },
                            });
                            return;
                        }
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
    }, [isClickButton, playingIntruksi]);

    return (
        <div className='h-screen bg-primary-1'>
            <Navbar />
            <main style={{ height: 'calc(100vh - 90px)' }} className='w-screen bg-primary-1 pt-[90px] '>
                <section className='mx-auto grid max-w-screen-xl grid-cols-12 gap-[78px] '>
                    <div className='col-span-8 pt-[10px]'>
                        <div className='mb-[16px] flex items-center justify-between rounded-rad-7 bg-[#F5F5F5] py-[20px] '>
                            <div className='ml-[39px]'>
                                <h1 className='text-[32px] font-bold leading-[60px]'>Hallo, {userName}!</h1>
                                <p className='text-[16px]  leading-[20px]'>Senang bertemu denganmu lagi</p>
                            </div>
                            <Image alt='' src={'/images/avatar.svg'} width={117} height={159} className='mr-[95px]' />
                        </div>
                        <div style={{ height: 'calc(100vh - 324px)' }}>
                            <div className='flex items-center gap-5'>
                                <h1
                                    className={`${
                                        classShow === 'progress' ? 'bg-white text-primary-1' : 'bg-primary-1 text-white'
                                    } rounded-[20px] px-[16px] py-[12px] text-[20px] font-bold `}>
                                    Kelas yang berjalan
                                </h1>
                                <h1
                                    className={`${
                                        classShow === 'done' ? 'bg-white text-primary-1' : 'bg-primary-1 text-white'
                                    } rounded-[20px]  px-[16px] py-[12px] text-[20px] font-bold `}>
                                    Kelas yang selesai
                                </h1>
                            </div>
                            <div
                                style={{ height: 'calc(100vh - 408px)' }}
                                className='flex flex-col gap-3 overflow-y-scroll pt-[14px]'>
                                <DisplayClass listClass={totalPelajaran} />
                            </div>
                        </div>
                    </div>
                    <div className='col-span-4 flex flex-col gap-5 pt-[10px]'>
                        <div className='flex items-center justify-center gap-[77px] rounded-rad-7 bg-[#F5F5F5] px-[100px] py-[50px]'>
                            <div className='flex flex-col '>
                                <h1 className=' mb-[12px] text-[56px] font-bold leading-[60px] text-secondary-1'>{totalPoin}</h1>
                                <p className='font-bold'>Total poin</p>
                            </div>
                            <Image alt='' src={'/images/trophy.svg'} width={130} height={130} />
                        </div>
                        <div className='mb-[50px] flex justify-end gap-[30px]'>
                            {/* <div className='rounded-rad-7 bg-secondary-1 px-[18px] py-[20px]'>
                                    <h1 className='text-[48px] font-bold  leading-[60px] text-white'>{rataProgress}</h1>
                                    <span className='font-bold text-white'>Rata Rata Kemajuan</span>
                                </div> */}
                            <div className='rounded-rad-7 bg-secondary-1 px-[18px] py-[20px]'>
                                <h1 className='text-[48px] font-bold  leading-[60px] text-white'>{countFinishedClass}</h1>
                                <span className='font-bold text-white '>Kelas di selesaikan</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Transkrip transcript={transcript} isTrigger={isTrigger} />
        </div>
    );
};

export default Rapor;
