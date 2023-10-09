'use client';

// core
import { useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// third parties
import { useForm } from 'react-hook-form';
import Webcam from 'react-webcam';
import Popup from 'reactjs-popup';

// axios
import { authRegister } from '@/axios/auth';

// hooks
import { useNotification } from '@/hooks';

//

import BorderedButton from '@/components/BorderedButton';
import FillButton from '@/components/FillButton';
import InputRef from '@/components/InputRef';
import PasswordInputRef from '@/components/PasswordInputRef';
import Label from '@/components/Label';
import Notification from '@/components/Notification';

import { ApiResponseError } from '@/utils/error-handling';

const Register = () => {
    const webcamRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImages, setCapturedImages] = useState([]);
    const maxImages = 10;
    const interval = 500; // Ubah sesuai kebutuhan

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc);
        setCapturedImages((prevImages) => [...prevImages, imageSrc]);
    }, []);

    const openCamera = () => {
        setIsCameraOpen(true);
        // setTimeout(captureImages, 3000);
        const waitForCamera = setInterval(() => {
            if (webcamRef.current?.video.readyState === 4) {
                clearInterval(waitForCamera);
                captureImages();
            }
        }, 2000);
    };

    const captureImages = () => {
        let imageCount = 0;

        const captureImageInterval = setInterval(() => {
            if (imageCount < maxImages) {
                capture();
                imageCount++;
            } else {
                clearInterval(captureImageInterval); // Hentikan interval setelah 10 gambar diambil
                closeCamera();
                console.log(capturedImages); // Tampilkan hasil pengambilan gambar
            }
        }, interval);
    };

    const closeCamera = () => {
        setIsCameraOpen(false);
    };

    const router = useRouter();

    const { notifData, handleNotifAction, handleNotifVisible } = useNotification();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        if (typeof window !== 'undefined') {
            try {
                await authRegister({
                    name: data.name,
                    email: data.email,
                    host: window?.location?.origin,
                    password: data.password,
                    konfirmasi_password: data.password_confirmation,
                    images: capturedImages,
                });
                handleNotifAction('success', 'Yeay ! Registrasi Berhasil.\nCheck Email Anda untuk verifikasi Akun!');
                if (!notifData?.isVisible) {
                    setTimeout(() => {
                        router.refresh();
                        router.replace('/login', { scroll: false });
                    }, 1000);
                }
            } catch (error) {
                if (error instanceof ApiResponseError) {
                    console.log(`ERR REGISTER MESSAGE: `, error.message);
                    console.log(error.data);
                    handleNotifAction('error', error?.message);
                    return;
                }
                console.log(`MESSAGE: `, error.message);
                handleNotifAction('error', error?.message);
            }
        }
    };

    // const onSubmit = async (data) => {
    //     if (typeof window !== 'undefined') {
    //         try {
    //             await authRegister({
    //                 name: data.name,
    //                 email: data.email,
    //                 host: window?.location?.origin,
    //                 password: data.password,
    //                 konfirmasi_password: data.password_confirmation,
    //             });
    //             handleNotifAction('success', 'Yeay ! Registrasi Berhasil.\nCheck Email Anda untuk verifikasi Akun!');
    //             if (!notifData?.isVisible) {
    //                 setTimeout(() => {
    //                     router.replace('/login', { scroll: false });
    //                 }, 1000);
    //             }
    //         } catch (error) {
    //             if (error instanceof ApiResponseError) {
    //                 console.log(`ERR REGISTER MESSAGE: `, error.message);
    //                 console.log(error.data);
    //                 handleNotifAction('error', error?.message);
    //                 return;
    //             }
    //             console.log(`MESSAGE: `, error.message);
    //             handleNotifAction('error', error?.message);
    //         }
    //     }
    // };

    return (
        <section className='grid h-screen grid-cols-12'>
            <div className={`relative  col-span-4 h-full`}>
                <Image priority src={'/images/left-auth.png'} alt='' fill />
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
                    <BorderedButton theme='light' onClick={() => router.replace('/login', { scroll: false })}>
                        Masuk
                    </BorderedButton>
                </div>
            </div>
            <div className='col-span-8 flex items-center justify-center bg-neutral-7'>
                <div className='flex w-[646px] flex-col gap-[42px]'>
                    <div className='text-center'>
                        <h1 className='text-title-2 font-bold'>Buat Akun Baru</h1>
                        <p className='text-body-2'>Buktikan Sekarang Semua Bisa Belajar</p>
                    </div>
                    <form className='flex flex-col items-center gap-[24px]' onSubmit={handleSubmit(onSubmit)}>
                        <div className='w-full'>
                            <Label htmlFor='name' className={`${errors.name?.message ? 'text-alert-1' : 'text-black'}`}>
                                {errors.name?.message || <span className='invisible'>.</span>}
                            </Label>
                            <InputRef
                                id='name'
                                placeholder='Nama'
                                type='text'
                                {...register('name', {
                                    required: 'Nama tidak boleh kosong!',
                                })}
                            />
                        </div>
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
                            />
                        </div>
                        <div className='w-full'>
                            <Label htmlFor='password' className={`${errors.password?.message ? 'text-alert-1' : 'text-black'}`}>
                                {errors.password?.message || <span className='invisible'>.</span>}
                            </Label>
                            <PasswordInputRef
                                id='password'
                                placeholder='Kata Sandi'
                                {...register('password', {
                                    required: 'Password tidak boleh kosong!',
                                    minLength: {
                                        value: 8,
                                        message: 'Jumlah Karaktek tidak boleh kurang dari 8!',
                                    },
                                })}
                            />
                        </div>
                        <div className='w-full'>
                            <Label
                                htmlFor='password_confirmation'
                                className={`${errors.password_confirmation?.message ? 'text-alert-1' : 'text-black'}`}>
                                {errors.password_confirmation?.message || <span className='invisible'>.</span>}
                            </Label>
                            <PasswordInputRef
                                id='password_confirmation'
                                placeholder='Ulang Kata Sandi'
                                {...register('password_confirmation', {
                                    required: 'Password tidak boleh kosong!',
                                    minLength: {
                                        value: 8,
                                        message: 'Jumlah Karaktek tidak boleh kurang dari 8!',
                                    },
                                })}
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
                        <FillButton type='submit' className='w-max px-[52px] py-[16px]'>
                            Daftar
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

export default Register;
