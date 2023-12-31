'use client';

//core
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

//  api
import { authVerify } from '@/axios/auth';

import FillButton from '@/components/FillButton';
// import ArrowButton from '@/components/ArrowButton';

const VerifyEmail = () => {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const router = useRouter();

    // state
    // const [loading, setLoading] = useState(true);
    const [verifyStatus, setVerifyStatus] = useState('loading'); // loading | success | failed
    // const [verifyMsg, setVerifyMsg] = useState('');

    useEffect(() => {
        if (url) {
            const fetchApi = async () => {
                try {
                    await authVerify({ url });
                    setVerifyStatus('success');
                    //console.log('TESSS', response);
                    // setVerifyMsg(response?.metadata?.message);
                } catch (error) {
                    setVerifyStatus('failed');
                    // setVerifyMsg(error?.message);
                }
            };
            fetchApi();
        }
    }, [url]);

    // if (loading) {
    //     return <h1>Loading...</h1>;
    // }

    switch (verifyStatus) {
        case 'failed':
            return (
                <div className='flex h-screen w-screen items-center justify-center bg-primary-1'>
                    <Image
                        src={'/small-images/icon-white.webp'}
                        alt='gmooc icon white'
                        width={166}
                        height={40}
                        className='absolute left-[20px] top-[20px]'
                    />
                    {/* <ArrowButton className='absolute left-[100px] top-[100px] p-[10px]' /> */}
                    <div className='mt-[50px] flex h-[400px] w-[540px] flex-col items-center justify-center gap-[30px] rounded-[20px] bg-[#EDF3F3]'>
                        <Image alt='security failed' src={'/small-images/security-failed.webp'} width={266} height={133} />
                        <p className='font-bold text-alert-1'>Oops ! Email Kamu Belum Terverifikasi</p>
                        <FillButton onClick={() => router.push('/login', { scroll: false })} className='px-[60px] py-[18px]'>
                            Check Email Anda
                        </FillButton>
                    </div>
                </div>
            );
        default:
            return (
                <div className='flex h-screen w-screen items-center justify-center bg-primary-1'>
                    <Image
                        src={'/small-images/icon-white.webp'}
                        alt='gmooc white icon'
                        width={166}
                        height={40}
                        className='absolute left-[20px] top-[20px]'
                    />
                    {/* <ArrowButton className='absolute left-[100px] top-[100px] p-[10px]' /> */}
                    <div className='mt-[50px] flex h-[400px] w-[540px] flex-col items-center justify-center gap-[30px] rounded-[20px] bg-[#EDF3F3]'>
                        <Image alt='security success' src={'/small-images/security-success.webp'} width={266} height={133} />
                        <p className='font-bold'>Yeay ! Email Kamu Sudah Terverifikasi</p>
                        <FillButton onClick={() => router.push('/login', { scroll: false })} className='px-[100px] py-[18px]'>
                            Ke Login
                        </FillButton>
                    </div>
                </div>
            );
    }
};

export default VerifyEmail;
