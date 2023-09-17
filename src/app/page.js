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

    const [transcript, setTrancript] = useState('');

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
            }
        }
    }, [userName, isPermit]);

    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            const cleanCommand = command?.replace('.', '');

            if (cleanCommand.includes('pergi')) {
                if (cleanCommand.includes('kelas')) {
                    speechAction({
                        text: 'Anda akan menuju halaman Daftar Kelas',
                        actionOnEnd: () => {
                            router.push('/kelas');
                        },
                    });
                } else if (cleanCommand.includes('rapor')) {
                    speechAction({
                        text: 'Anda akan menuju halaman Rapor',
                        actionOnEnd: () => {
                            router.push('/rapor');
                        },
                    });
                } else if (cleanCommand.includes('peringkat')) {
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
                        speechAction({
                            text: `Anda akan load ulang halaman!`,
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
                    text: `Kita sedang di halaman utama`,
                });
            }

            setTrancript(cleanCommand);
            console.log(cleanCommand);
        };

        recognition.onend = () => {
            recognition.start();
        };
    }, [router]);

    return (
        <main className='h-screen '>
            <Navbar />
            <Hero />
            <Transkrip transcript={transcript} />
            <CheckPermission />
        </main>
    );
}
