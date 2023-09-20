'use client';

//core
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import Image from 'next/image';

//components
import FillButton from './FillButton';
import MicButton from './MicButton';

const Hero = ({ className }) => {
    const router = useRouter();

    return (
        <main style={{ height: 'calc(100vh - 81px)' }} className={`${className} mx-auto max-w-screen-xl pt-[150px]`}>
            <div className='grid grid-cols-12'>
                <div className='col-span-6 flex items-center justify-start '>
                    <div className='flex flex-col gap-[28px]'>
                        <h1 className='text-head-1 font-bold'>
                            <span className='text-secondary-1'>Semua</span> Berhak <br /> untuk bisa belajar
                        </h1>
                        <p className='leading-tight '>
                            Buktikan bahwa semua bisa dilakukan <br /> jika kita mempunyai niat yang kuat
                        </p>
                        <FillButton
                            onClick={() => router.push('/kelas')}
                            className='bg-color-1 border-color-1  rounded-rad-3 border px-[98px] py-[12px] text-body-1 font-semibold text-white'>
                            Get Started
                        </FillButton>
                    </div>
                </div>
                <div className='col-span-6 flex items-center justify-center '>
                    <div className='flex  justify-center gap-3 '>
                        <Image src={'/images/blind.svg'} width={353} height={442} alt='' />
                        <MicButton className='mt-[50px] h-max' />
                    </div>
                </div>
            </div>
        </main>
    );
};

Hero.propTypes = {
    className: PropTypes.string,
};

export default Hero;
