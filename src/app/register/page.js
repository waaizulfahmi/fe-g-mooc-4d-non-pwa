'use client';

// core
import { useRef, useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// third parties
import { useForm } from 'react-hook-form';
import Webcam from 'react-webcam';
import Popup from 'reactjs-popup';

// axios
import { authRegister } from '@/axios/auth';

// hooks
import { useCheckReloadPage, useMovePage, useNotification, useCheckScreenOrientation } from '@/hooks';

//

import BorderedButton from '@/components/BorderedButton';
import FillButton from '@/components/FillButton';
import InputRef from '@/components/InputRef';
import PasswordInputRef from '@/components/PasswordInputRef';
import Label from '@/components/Label';
import Notification from '@/components/Notification';

import { ApiResponseError } from '@/utils/error-handling';
import { stopSpeech } from '@/utils/text-to-speech';
import { usePathname } from 'next/navigation';
import CheckPermission from '@/components/CheckPermission';
import { useDispatch } from 'react-redux';
import { checkPermissionSlice } from '@/redux/check-permission';

const Register = () => {
    const webcamRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImages, setCapturedImages] = useState([]);
    const [isDaftar, setIsDaftar] = useState(false);
    const maxImages = 20;
    const interval = 500; // Ubah sesuai kebutuhan

    const pathname = usePathname();
    const { sessioName } = useCheckReloadPage({ name: pathname });
    const { handleMovePage } = useMovePage(sessioName);
    const { windowSize } = useCheckScreenOrientation();
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const { setIsPermit } = checkPermissionSlice.actions;

    useEffect(() => {
        const deleteSessionReload = () => {
            console.log('it worked register');
            dispatch(setIsPermit(false));
            sessionStorage.removeItem(sessioName);
        };

        window.addEventListener('pageshow', deleteSessionReload);

        return () => {
            window.removeEventListener('pageshow', deleteSessionReload);
        };
    }, [sessioName, dispatch, setIsPermit]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            // console.log(imageSrc);
            setCapturedImages((prevImages) => [...prevImages, imageSrc]);
        }
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
                // console.log(capturedImages); // Tampilkan hasil pengambilan gambar
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
        setIsLoading(true);

        if (typeof window !== 'undefined') {
            try {
                setIsDaftar(true);
                await authRegister({
                    name: data.name,
                    email: data.email,
                    host: window?.location?.origin,
                    password: data.password,
                    konfirmasi_password: data.password_confirmation,
                    images: capturedImages,
                });
                handleNotifAction('success', 'Yeay ! Registrasi Berhasil.\nCheck Email Anda untuk verifikasi Akun!');
                setIsLoading(false);

                if (!notifData?.isVisible) {
                    setTimeout(() => {
                        setIsDaftar(false);
                        router.refresh();
                        // router.replace('/login', { scroll: false });
                        handleMovePage('/login', 'replace', false);
                    }, 1000);
                }
            } catch (error) {
                setIsDaftar(false);
                setIsLoading(false);
                if (error instanceof ApiResponseError) {
                    // console.log(`ERR REGISTER MESSAGE: `, error.message);
                    // console.log(error.data); // data
                    handleNotifAction('error', error.message);
                    return;
                }
                // console.log(`MESSAGE: `, error.message);
                handleNotifAction('error', error?.message);
            }
        }
    };

    if (windowSize.innerWidth < 640) {
        return (
            <div className='relative flex h-screen items-center justify-center gap-2'>
                <Image
                    alt='white icon gmooc'
                    src={'/small-images/monitor-size.webp'}
                    width={200}
                    height={80}
                    className='absolute left-1/2 top-1/4 z-10 -translate-x-1/2 -translate-y-1/3 transform'
                />
                <h1 className='z-0 px-3 pt-2 text-center'>
                    <b>Maaf</b>, Aplikasi tidak dapat berjalan dengan baik pada layar {windowSize.innerWidth}px atau{' '}
                    <b>
                        <i>smartphone</i>
                    </b>
                    . Buka di layar lebih dari 640px atau gunakan
                    <b> laptop</b>.
                </h1>
            </div>
        );
    }
    return (
        <section className='grid h-screen grid-cols-12'>
            <div className={`relative  col-span-4 hidden h-full md:block`}>
                <Image priority src={'/small-images/left-auth.webp'} alt='left auth background' fill />
                <Image
                    alt='white icon gmooc'
                    src={'/small-images/icon-white.webp'}
                    width={166}
                    height={60}
                    className='absolute left-[24px] top-[24px]'
                />
                <div
                    className={`absolute bottom-[30%] left-1/2 flex translate-x-[-50%] flex-col items-center justify-center gap-5 text-white`}>
                    <h1 className='text-[40px] font-bold leading-[20px]'>Hallo !</h1>
                    <p className='text-center '>Masukkan Detail Pribadi Anda dan Mulailah Pembelajaran Anda</p>
                    <BorderedButton
                        theme='light'
                        onClick={() => {
                            stopSpeech();
                            router.refresh();
                            handleMovePage('/login', 'replace', false);
                        }}>
                        Masuk
                    </BorderedButton>
                </div>
            </div>
            <div className='col-span-12 flex items-center justify-center bg-neutral-7 md:col-span-8'>
                <div className='flex w-[646px] flex-col gap-[34px]'>
                    <div className='text-center'>
                        <h1 className='text-xl font-bold md:text-title-2'>Buat Akun Baru</h1>
                        <p className='text-body-2'>Buktikan Sekarang Semua Bisa Belajar</p>
                    </div>
                    <form className='mx-4 flex flex-col items-center gap-[16px] md:mx-0 ' onSubmit={handleSubmit(onSubmit)}>
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
                            <button
                                onClick={openCamera}
                                className='my-[14px] cursor-pointer appearance-none rounded-rad-5 border-2 border-primary-1 bg-white px-[52px] py-[16px] text-center font-monsterrat text-base font-bold text-primary-1 outline-none hover:bg-primary-1 hover:text-white'>
                                Tambahkan Data Gambar Anda
                            </button>
                        )}
                        {isLoading ? (
                            <>
                                <div className='flex items-center pt-4'>
                                    <div className='mr-2'>
                                        <svg
                                            aria-hidden='true'
                                            className='inline h-10 w-10 animate-spin fill-green-500 text-gray-200 dark:text-gray-600'
                                            viewBox='0 0 100 101'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'>
                                            <path
                                                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                                fill='currentColor'
                                            />
                                            <path
                                                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                                fill='currentfill'
                                            />
                                        </svg>
                                    </div>
                                    <div className='text-center'>Mohon Tunggu, Registrasi Akun Sedang Diproses...</div>
                                </div>
                            </>
                        ) : null}
                        <FillButton
                            style={{ backgroundColor: isDaftar ? '#00ff00' : '' }}
                            disabled={isDaftar}
                            type='submit'
                            className={`w-max px-[52px] py-[16px]`}>
                            Daftar
                        </FillButton>
                        <div
                            className='block text-center text-base font-semibold md:hidden'
                            onClick={() => handleMovePage('/login', 'replace', false)}>
                            Login
                        </div>
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
            <CheckPermission />
        </section>
    );
};

export default Register;
