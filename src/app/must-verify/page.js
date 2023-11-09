'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FillButton from '@/components/FillButton';
import Image from 'next/image';
import { useEffect } from 'react';
import { authResendVerify } from '@/axios/auth';

const MustVerify = () => {
    const { data } = useSession();
    const router = useRouter();
    const token = data?.user?.token;

    useEffect(() => {
        if (token) {
            const fetchApi = async () => {
                try {
                    await authResendVerify({ host: window?.location?.origin, token });

                    //console.log('VERIFIY LAGIII', response);
                } catch (error) {
                    // setVerifyStatus('failed');
                    // setVerifyMsg(error?.message);
                    //console.log(error.message);
                }
            };
            fetchApi();
        }
    }, [token]);

    return (
        <div className='flex h-screen w-screen items-center justify-center bg-primary-1'>
            <Image
                src={'/small-images/icon-white.webp'}
                alt='gmooc icons'
                width={166}
                height={40}
                className='absolute left-[20px] top-[20px]'
            />
            <div className='mt-[50px] flex h-[400px] w-[540px] flex-col items-center justify-center gap-[30px] rounded-[20px] bg-[#EDF3F3]'>
                <Image alt='security failed' src={'/small-images/security-failed.webp'} width={266} height={133} />
                <p className='font-bold text-alert-1'>Oops ! Email Kamu Belum Terverifikasi</p>
                <FillButton onClick={() => router.push('/login', { scroll: false })} className='px-[60px] py-[18px]'>
                    Check Email Anda
                </FillButton>
            </div>
        </div>
    );
};

export default MustVerify;
