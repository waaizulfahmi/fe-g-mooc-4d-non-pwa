'use client';

// core
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useCallback, useState } from 'react';

// third parties
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Webcam from 'react-webcam';
import Popup from 'reactjs-popup';

// hooks
import { useNotification } from '@/hooks';

// component
import BorderedButton from '@/components/BorderedButton';
import FillButton from '@/components/FillButton';
import InputRef from '@/components/InputRef';
import PasswordInputRef from '@/components/PasswordInputRef';
import Label from '@/components/Label';
import Notification from '@/components/Notification';

const Login = () => {
    const router = useRouter();
    const { notifData, handleNotifAction, handleNotifVisible } = useNotification();
    const webcamRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isDaftar, setIsDaftar] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const openCamera = () => {
        setIsCameraOpen(true);

        const waitForCamera = setInterval(() => {
            if (webcamRef.current?.video.readyState === 4) {
                clearInterval(waitForCamera);
                capture();
            }
        }, 5000);
    };

    const closeCamera = () => {
        setIsCameraOpen(false);
    };

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current.getScreenshot();

        console.log(imageSrc);

        const onSubmitImage = async (data) => {
            closeCamera();
            setIsDaftar(true);
            const response = await signIn('face-login', {
                image: data,
                redirect: false,
            });

            console.log('DATA: ', response);

            if (!response?.error) {
                setIsDaftar(false);
                router.refresh();
                router.replace('/', { scroll: false });
            } else if (response?.error) {
                setIsDaftar(false);
                handleNotifAction('error', response.error);
            }
        };

        if (imageSrc) {
            await onSubmitImage(imageSrc);
        }
    }, [handleNotifAction, router]);

    const onSubmit = async (data) => {
        const email = data.email;
        const password = data.password;

        setIsDaftar(true);
        const response = await signIn('common-login', {
            email,
            password,
            redirect: false,
        });

        if (!response?.error) {
            setIsDaftar(false);
            router.refresh();
            router.replace('/', { scroll: false });
        } else if (response?.error) {
            setIsDaftar(false);
            handleNotifAction('error', response.error);
        }
    };

    return (
        <section className='grid h-screen grid-cols-12'>
            <div className={`relative  col-span-4 h-full`}>
                <Image priority src={'/images/left-auth.png'} alt='' fill sizes='100vh' />
                <Image
                    alt=''
                    src={'/images/icon-white.svg'}
                    width={166}
                    height={60}
                    className='absolute left-[24px] top-[24px]'
                />
                <div
                    className={`absolute bottom-[30%] left-1/2 flex translate-x-[-50%] flex-col items-center justify-center gap-5 text-white`}>
                    <h1 className='text-[40px] font-bold leading-[20px]'>Hallo !</h1>
                    <p className='text-center '>Masukkan Detail Pribadi Anda dan Mulailah Pembelajaran Anda</p>
                    <BorderedButton theme='light' onClick={() => router.replace('/register', { scroll: false })}>
                        Daftar
                    </BorderedButton>
                </div>
            </div>
            <div className='col-span-8 flex items-center justify-center bg-neutral-7'>
                <div className='flex w-[646px] flex-col gap-[42px]'>
                    <div className='text-center'>
                        <h1 className='text-title-2 font-bold'>Masuk G-MOOC 4D</h1>
                        <p className='text-body-2'>Buktikan Sekarang Semua Bisa Belajar</p>
                    </div>
                    <form className='flex flex-col items-center gap-[24px]' onSubmit={handleSubmit(onSubmit)}>
                        <div className='w-full'>
                            <Label htmlFor='email' className={`${errors.email?.message ? 'text-alert-1' : 'text-black'}`}>
                                {errors.email?.message || <span className='invisible'>.</span>}
                            </Label>
                            <InputRef
                                id='email'
                                placeholder='Email'
                                type='text'
                                {...register('email', {
                                    required: 'Email tidak boleh kosong!',
                                    pattern: {
                                        value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                        message: 'Format email tidak sesuai!',
                                    },
                                })}
                                className={`${
                                    errors.email?.message
                                        ? 'border-alert-1 focus:border-alert-1'
                                        : 'border-neutral-6 focus:border-primary-1'
                                }   bg-neutral-6 px-6 py-[17px] text-body-2 font-normal `}
                            />
                        </div>
                        <div className='w-full'>
                            <Label htmlFor='password' className={`${errors.password?.message ? 'text-alert-1' : 'text-black'}`}>
                                {errors.password?.message || <span className='invisible'>.</span>}
                            </Label>
                            <PasswordInputRef
                                id='password'
                                placeholder='Kata Sandi'
                                isError={errors.password?.message ? true : false}
                                {...register('password', {
                                    required: 'Password tidak boleh kosong!',
                                    minLength: {
                                        value: 8,
                                        message: 'Jumlah Karaktek tidak boleh kurang dari 8!',
                                    },
                                })}
                                className={`${
                                    errors.password?.message
                                        ? 'border-alert-1 focus:border-alert-1'
                                        : 'border-neutral-6 focus:border-primary-1'
                                }   bg-neutral-6 px-6 py-[17px] text-body-2 font-normal `}
                            />
                        </div>
                        {isCameraOpen ? (
                            <Popup
                                closeBtn={true}
                                closePopup={closeCamera}
                                open={isCameraOpen}
                                modal
                                nested
                                className='rounded-lg bg-gray-100 p-4'>
                                <div className='fixed inset-0 bg-opacity-50 backdrop-blur-md backdrop-filter'></div>
                                <div className='relative rounded-lg bg-white p-5 shadow-lg'>
                                    <h1 className='pb-4 text-2xl font-semibold'>Face Recognition Technology</h1>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        mirrored={true}
                                        screenshotFormat='image/jpeg'
                                        className='w-full rounded-lg shadow-lg'
                                    />
                                    <div className='mt-4 flex flex-col items-center'>
                                        <h3 className='text-xl font-semibold'>Memindai Wajah Anda</h3>
                                        <button
                                            onClick={closeCamera}
                                            className='mt-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600'>
                                            Keluar
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        ) : (
                            <FillButton onClick={openCamera} className='w-max px-[52px] py-[16px]'>
                                Face Recognition
                            </FillButton>
                        )}
                        <FillButton
                            style={{ backgroundColor: isDaftar ? '#00ff00' : '' }}
                            disabled={isDaftar}
                            type='submit'
                            className='w-max px-[52px] py-[16px]'>
                            Masuk
                        </FillButton>
                    </form>
                </div>
            </div>
            <Notification
                isVisible={notifData.isVisible}
                time={notifData.time}
                handleVisible={handleNotifVisible}
                text={notifData.text}
                type={notifData.type}
            />
        </section>
    );
};

export default Login;
