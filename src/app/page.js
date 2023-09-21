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

// third party
import { useSession } from 'next-auth/react';

// redux
import { useSelector } from 'react-redux';
import { getIsPermit } from '@/redux/check-permission';

// components
import Navbar from '@/components/Navbar';
import CheckPermission from '@/components/CheckPermission';
import Transkrip from '@/components/Transkrip';

// datas
// ---

// apis
// ---

// utils
import { speechAction, speechWithBatch, stopSpeech } from '@/utils/text-to-speech';
import { recognition } from '@/utils/speech-recognition';
import Hero from '@/components/Hero';

export default function Beranda() {
    const router = useRouter();
    const { data } = useSession();
    const userName = data?.user?.name;
    const isPermit = useSelector(getIsPermit);

    //STATE
    const [transcript, setTrancript] = useState('');
    const [speechOn, setSpeechOn] = useState(false); // hi uli works
    const [skipTrigger, setSkipTrigger] = useState(false); //skiping hi uli
    const [introPage, setIntroPage] = useState(true); // skiping  intruksi
    const [isTrigger, setIsTrigger] = useState(false);

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
        if (userName) {
            if (isPermit) {
                speechWithBatch({
                    speechs: [
                        {
                            text: `Selamat datang di ji muk fordi, ${userName}`,
                            actionOnStart: () => {
                                setSkipTrigger(true);
                            },
                        },
                        {
                            text: 'Perkenalkan saya Uli, saya akan memandu Anda untuk belajar. ucapkan hai atau hello uli agar saya dapat mendengar Anda',
                            actionOnEnd: () => {
                                setSkipTrigger(false);
                            },
                        },
                        {
                            text: `Halaman ini dinamakan halaman beranda, halaman ini merupakan halaman  pertama kali ketika Anda menggunakan aplikasi ini.`,
                        },
                        {
                            text: 'Pada halaman ini terdapat berbagai perintah untuk pergi ke halaman lain, contohnya halaman kelas, raport, dan peringkat.',
                        },
                        {
                            text: 'Untuk masuk halaman tersebut Anda bisa mengucapkan pergi ke halaman yang Anda tuju, misalnya, pergi ke kelas',
                            actionOnStart: () => {
                                setSkipTrigger(true);
                            },
                        },
                        {
                            text: 'Jangan lupa ucapkan hi Uli atau hallo uli agar saya bisa mendengar Anda. Jika tidak ada perintah apapun saya akan diam dalam 10 detik.',
                        },
                        {
                            text: `Saya juga akan diam, jika perintah sudah dilakukan. Tapi Anda jangan khawatir, panggil saja saya lagi dengan hi Uli atau hallo uli agar saya dapat mendengar Anda.`,
                        },
                        {
                            text: 'Satu lagi, Anda wajib menunggu saya berbicara sampai selesai, agar saya bisa mendengar Anda kembali',
                            actionOnEnd: () => {
                                setSkipTrigger(false);
                            },
                        },
                        {
                            text: 'Jika Anda masih bingung, Anda bisa ucapkan intruksi agar mendapatkan penjelasan lebih banyak.',
                            actionOnEnd: () => {
                                setIntroPage(false);
                                // setSkipTrigger(false);
                            },
                        },
                    ],
                });
            }
        }
    }, [userName, isPermit]);

    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            const cleanCommand = command?.replace('.', '');
            setTrancript(cleanCommand);
            console.log(cleanCommand);

            if (speechOn && !skipTrigger) {
                if (cleanCommand.includes('pergi')) {
                    if (cleanCommand.includes('kelas')) {
                        setSpeechOn(false);
                        speechAction({
                            text: 'Anda akan menuju halaman Daftar Kelas',
                            actionOnEnd: () => {
                                setIsTrigger(false);
                                router.push('/kelas');
                            },
                        });
                    } else if (cleanCommand.includes('rapor')) {
                        setSpeechOn(false);
                        speechAction({
                            text: 'Anda akan menuju halaman Rapor',
                            actionOnEnd: () => {
                                setIsTrigger(false);
                                router.push('/rapor');
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
                    cleanCommand.includes('saya sekarang dimana') ||
                    cleanCommand.includes('saya sekarang di mana') ||
                    cleanCommand.includes('saya di mana') ||
                    cleanCommand.includes('saya dimana')
                ) {
                    setSpeechOn(false);
                    speechAction({
                        text: `Kita sedang di halaman utama`,
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
                                text: `Anda akan load ulang halaman!`,
                                actionOnEnd: () => {
                                    setIsTrigger(false);
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
    }, [router, speechOn, userName, skipTrigger, introPage]);

    return (
        <main className='h-screen '>
            <Navbar />
            <Hero />
            <Transkrip transcript={transcript} isTrigger={isTrigger} />
            <CheckPermission />
        </main>
    );
}
