'use client';

import { useRouter } from 'next/navigation';
import FillButton from '@/components/FillButton';

const MustVerify = () => {
    const router = useRouter();

    return (
        <div className='flex h-screen w-screen flex-col items-center justify-center gap-5'>
            <h1 className='text-[50px] font-semibold'>Anda harus verifikasi email!</h1>
            <FillButton onClick={() => router.push('/login', { scroll: false })} className='px-[40px] py-[10px] text-[24px]'>
                Sudah
            </FillButton>
        </div>
    );
};

export default MustVerify;
