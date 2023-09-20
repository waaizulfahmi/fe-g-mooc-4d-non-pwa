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
import { speechAction } from '@/utils/text-to-speech';
import { recognition } from '@/utils/speech-recognition';
import Hero from '@/components/Hero';

export default function Beranda() {
    const router = useRouter();
    const { data } = useSession();
    const userName = data?.user?.name;
    const isPermit = useSelector(getIsPermit);

    //STATE
    const [transcript, setTrancript] = useState('');
    const [speechOn, setSpeechOn] = useState(false);
    const [skipTrigger, setSkipTrigger] = useState(false);
    const [introPage, setIntroPage] = useState(true);

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
                speechAction({
                    text: `Selamat datang di ji muk fordi, ${userName}`,
                });
                speechAction({
                    text: 'Perkenalkan saya Uli, saya akan memandu Anda untuk belajar. ucapkan hai atau hello uli agar saya dapat mendengar Anda',
                });
                speechAction({
                    text: `Halaman ini dinamakan halaman beranda. Pada halaman ini adalah halaman pertama kali di aplikasi ini.`,
                });
                speechAction({
                    text: 'Pada halaman ini terdapat berbagai perintah untuk pergi ke halaman lain, contohnya halaman kelas, raport, dan peringkat.',
                });
                speechAction({
                    text: 'Untuk masuk halaman tersebut Anda bisa mengucapkan pergi ke halaman yang Anda tuju, misalnya, pergi ke kelas',
                });
                speechAction({
                    text: 'Jangan lupa ucapkan hi Uli atau hallo uli agar saya bisa mendengar Anda. Jika tidak ada perintah apapun saya akan diam dalam 10 detik.',
                });
                speechAction({
                    text: `Saya juga akan diam, jika perintah sudah dilakukan. Tapi Anda jangan khawatir, panggil saja saya lagi dengan hi Uli atau hallo uli agar saya dapat mendengar Anda.`,
                });
                speechAction({
                    text: 'Jika Anda masih bingung, Anda bisa ucapkan intruksi agar mendapatkan penjelasan lebih banyak.',
                    actionOnEnd: () => {
                        setIntroPage(false);
                    },
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
                        speechAction({
                            text: 'Anda akan menuju halaman Daftar Kelas',
                            actionOnEnd: () => {
                                setSpeechOn(false);
                                router.push('/kelas');
                            },
                        });
                    } else if (cleanCommand.includes('rapor')) {
                        speechAction({
                            text: 'Anda akan menuju halaman Rapor',
                            actionOnEnd: () => {
                                setSpeechOn(false);
                                router.push('/rapor');
                            },
                        });
                    } else if (cleanCommand.includes('peringkat')) {
                        speechAction({
                            text: 'Anda akan menuju halaman Peringkat',
                            actionOnEnd: () => {
                                setSpeechOn(false);
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
                    speechAction({
                        text: `Kita sedang di halaman utama`,
                        actionOnEnd: () => {
                            setSpeechOn(false);
                        },
                    });
                }
            }

            if (!skipTrigger) {
                if (cleanCommand.includes('muat')) {
                    if (cleanCommand.includes('ulang')) {
                        if (cleanCommand.includes('halaman')) {
                            speechAction({
                                text: `Anda akan load ulang halaman!`,
                                actionOnEnd: () => {
                                    setSpeechOn(false);
                                },
                            });
                        }
                    }
                } else if (cleanCommand.includes('hallo') || cleanCommand.includes('halo') || cleanCommand.includes('hai')) {
                    if (cleanCommand.includes('uli')) {
                        speechAction({
                            text: `Hai ${userName}, saya mendengarkan Anda!`,
                            actionOnEnd: () => {
                                setSpeechOn(true);
                            },
                        });
                    }
                }
            }

            if (!introPage) {
                if (cleanCommand.includes('intruksi')) {
                    speechAction({
                        text: `Hai ${userName}, sekarang Anda mendengarkan intruksi.`,
                        actionOnEnd: () => {
                            if (speechOn) {
                                setSpeechOn(false);
                            }
                            setSkipTrigger(true);
                        },
                    });
                    speechAction({
                        text: `Halaman ini dinamakan halaman beranda. Pada halaman ini adalah halaman pertama kali di aplikasi ini.`,
                    });
                    speechAction({
                        text: 'Pada halaman ini terdapat berbagai perintah untuk pergi ke halaman lain, contohnya halaman kelas, raport, dan peringkat.',
                    });
                    speechAction({
                        text: 'Untuk masuk halaman tersebut Anda bisa mengucapkan pergi ke halaman yang Anda tuju, misalnya, pergi ke kelas',
                    });
                    speechAction({
                        text: 'Jangan lupa ucapkan hi Uli atau hallo uli agar saya bisa mendengar Anda. Jika tidak ada perintah apapun saya akan diam dalam 10 detik.',
                    });
                    speechAction({
                        text: `Saya juga akan diam, jika perintah sudah dilakukan. Tapi Anda jangan khawatir, panggil saja saya lagi dengan hi Uli atau hallo uli agar saya dapat mendengar Anda.`,
                        actionOnEnd: () => {
                            setSkipTrigger(false);
                        },
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
            <Transkrip transcript={transcript} isTrigger={speechOn} />
            <CheckPermission />
        </main>
    );
}
