'use client';

import { useRouter } from 'next/navigation';
import FillButton from '@/components/FillButton';
import Image from 'next/image';

const MustVerify = () => {
    const router = useRouter();

    return (
        // <div className='flex flex-col items-center justify-center w-screen h-screen gap-5'>
        //     <h1 className='text-[50px] font-semibold'>Anda harus verifikasi email!</h1>
        //     <FillButton onClick={() => router.push('/login', { scroll: false })} className='px-[40px] py-[10px] text-[24px]'>
        //         Sudah
        //     </FillButton>
        // </div>
        <div className='flex h-screen w-screen items-center justify-center bg-primary-1'>
            <Image src={'/images/icon-white.svg'} alt='' width={166} height={40} className='absolute left-[20px] top-[20px]' />
            {/* <ArrowButton className='absolute left-[100px] top-[100px] p-[10px]' /> */}
            <div className='mt-[50px] flex h-[400px] w-[540px] flex-col items-center justify-center gap-[30px] rounded-[20px] bg-[#EDF3F3]'>
                <Image alt='' src={'/images/security-failed.png'} width={266} height={133} />
                <p className='font-bold text-alert-1'>Oops ! Email Kamu Belum Terverifikasi</p>
                <FillButton onClick={() => router.push('/login', { scroll: false })} className='px-[60px] py-[18px]'>
                    Check Email Anda
                </FillButton>
            </div>
        </div>
    );
};

export default MustVerify;
