'use client';

// core
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useCallback, useState, useEffect } from 'react';

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
import { authLoginWithFace } from '@/axios/auth';
import { ApiResponseError } from '@/utils/error-handling';
import { speechAction, speechWithBatch, stopSpeech } from '@/utils/text-to-speech';
import { recognition } from '@/utils/speech-recognition';

const Login = () => {
    const router = useRouter();
    const { notifData, handleNotifAction, handleNotifVisible } = useNotification();
    const webcamRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isCapturing, setIsCapturing] = useState(true);
    const [isFaceSuccess, setIsFaceSuccess] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [captureCount, setCaptureCount] = useState(0);

    const isCameraOpenRef = useRef(isCameraOpen);
    isCameraOpenRef.current = isCameraOpen;

    const waitForCamera = () => {
        const cameraCheckInterval = setInterval(() => {
            if (webcamRef.current?.video.readyState === 4) {
                clearInterval(cameraCheckInterval);
                // Menggunakan cameraCheckInterval

                capture();
            }
        }, 5000);

        setTimeout(() => {
            clearInterval(cameraCheckInterval);
        }, 5000);
    };

    useEffect(() => {
        try {
            recognition.start();
        } catch (error) {
            recognition.stop();
        }
    }, []);

    useEffect(() => {
        if (isCameraOpen) {
            waitForCamera();
        }

        speechWithBatch({
            speechs: [
                {
                    text: `Selamat datang di halaman login Aplikasi Jimuk fordi, Pastikan Perizinan Kamera sudah diaktifkan, agar kami dapat mengenali anda`,
                },
                {
                    text: 'Posisikan wajah anda tepat didepan kamera atau webkem yang anda gunakan',
                },
                {
                    text: 'Wajah anda akan kami rekam dan jika kami berhasil mengenali anda, maka Anda dapat masuk ke aplikasi',
                },
                {
                    text: 'Pastikan anda sudah melakukan registrasi, agar anda dapat menggunakan aplikasi ini',
                },
            ],
        });
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const closeCamera = () => {
        setIsCameraOpen(false);
    };

    // const waitForCameraAsync = async () => {
    //     await waitForCamera();
    // };

    const toggleMode = async () => {
        if (isCameraOpen) {
            setIsCameraOpen(false);
            capture();
        } else {
            setIsCameraOpen(true);
            setIsCapturing(true);
            setCaptureCount(0);
            const waitForCameraForToggle = setInterval(() => {
                if (webcamRef.current?.video.readyState === 4) {
                    clearInterval(waitForCameraForToggle);
                    capture();
                }
            }, 5000);

            // await waitForCameraAsync();
        }
    };

    const captureCountFunc = () => {
        setCaptureCount(captureCount + 1);
    };

    // const capture = async () => {
    //     if (isCapturing) {
    //         if (webcamRef.current && webcamRef.current.video.readyState === 4) {
    //             const imageSrc = webcamRef.current.getScreenshot();
    //             console.log(imageSrc);
    //             setCapturedImage(imageSrc);
    //         }
    //     }
    // };

    // const onSubmitImage = async (data) => {
    //     setIsLoading(true);

    //     const response = await signIn('face-login', {
    //         image: data,
    //         redirect: false,
    //     });

    //     setIsLoading(false);
    //     console.log('DATA: ', response);

    //     if (!response || !response.token || response === 'Tidak Terdaftar' || response === 'Tidak Terdeteksi') {
    //         if (isCapturing) {
    //             // Capture again
    //             capture();
    //         }
    //     } else {
    //         // Jika token ditemukan, set isCapturing menjadi false
    //         setIsCapturing(false);
    //     }

    //     if (imageSrc) {
    //         await onSubmitImage(imageSrc);
    //     }
    //     if (!response?.error) {
    //         router.refresh();
    //         router.replace('/', { scroll: false });
    //     } else if (response?.error) {
    //         handleNotifAction('error', response.error);
    //     }
    // };
    // version 2
    const capture = async () => {
        captureCountFunc();
        // setCaptureCount(captureCount + 1);
        if (isCapturing) {
            if (webcamRef.current && webcamRef.current.video.readyState === 4) {
                const imageSrc = webcamRef.current.getScreenshot();

                console.log(imageSrc);

                setCapturedImage(imageSrc);

                if (imageSrc) {
                    submitCapturedImage(imageSrc);
                }
            }
        }
    };

    // let captureCount = 0;

    const submitCapturedImage = async (imageSrc) => {
        setIsLoading(true);

        const response = await signIn('face-login', {
            image: imageSrc,
            redirect: false,
        });

        setIsLoading(false);
        console.log('DATA: ', response);
        console.log(captureCount);

        if (!response || !response.token || response === 'Tidak Terdaftar' || response === 'Tidak Terdeteksi') {
            if (isCapturing && captureCount < 10) {
                capture();
            } else if (captureCount == 10) {
                speechWithBatch({
                    speechs: [
                        {
                            text: `Maaf, Kami sudah berusaha mengenali anda, namun anda belum berhasil kami kenali.`,
                        },
                        {
                            text: `Namun, anda masih tetap bisa login dengan menginputkan email dan password anda`,
                        },
                    ],
                });
                setIsCameraOpen(false);
                setIsCapturing(false);
            }
        } else {
            setIsFaceSuccess(true);
            setIsCapturing(false);
            speechWithBatch({
                speechs: [
                    {
                        text: `Kami Berhasil Mengenali Anda, Selamat datang ${response.name} `,
                    },
                ],
            });
        }

        if (!response?.error) {
            router.refresh();
            router.replace('/', { scroll: false });
        } else if (response?.error) {
            handleNotifAction('error', response.error);
        }
    };

    const onSubmit = async (data) => {
        const email = data.email;
        const password = data.password;

        const response = await signIn('common-login', {
            email,
            password,
            redirect: false,
        });

        if (!response?.error) {
            router.refresh();
            router.replace('/', { scroll: false });
        } else if (response?.error) {
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
                    {isCameraOpen ? (
                        <div closeBtn={true} closePopup={closeCamera} open={isCameraOpen} className='rounded-lg bg-gray-100 p-4'>
                            {/* <div className='fixed inset-0 bg-opacity-50 backdrop-blur-md backdrop-filter'></div> */}
                            <div className='relative '>
                                <h1 className='pb-4 text-base font-semibold'>Face Recognition Technology</h1>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    mirrored={true}
                                    screenshotFormat='image/jpeg'
                                    className='w-full rounded-lg shadow-lg'
                                />
                                {isLoading ? (
                                    <>
                                        <div className='pt-3 text-center'>
                                            <svg
                                                aria-hidden='true'
                                                class='mr-2 inline h-10 w-10 animate-spin fill-green-500 text-gray-200 dark:text-gray-600'
                                                viewBox='0 0 100 101'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'>
                                                <path
                                                    d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                                    fill='currentColor'
                                                />
                                                <path
                                                    d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                                    fill='currentFill'
                                                />
                                            </svg>
                                        </div>
                                        {isFaceSuccess ? (
                                            <div className='text-center'>
                                                Berhasil Mengenali Anda, mengarahkan ke Halaman beranda...
                                            </div>
                                        ) : (
                                            <div className='text-center'>Sedang Mengenali Anda...</div>
                                        )}
                                    </>
                                ) : (
                                    <h1 className='pt-5 text-center'>Silakan Tunggu Hingga Kamera Tampil</h1>
                                )}
                                {/* <p className='mt-2 text-center text-base font-semibold'>{timer} seconds</p> */}
                            </div>
                        </div>
                    ) : (
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
                                <Label
                                    htmlFor='password'
                                    className={`${errors.password?.message ? 'text-alert-1' : 'text-black'}`}>
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
                            <FillButton type='submit' className='w-max px-[52px] py-[16px]'>
                                Masuk
                            </FillButton>
                        </form>
                        // <div onClick={openCamera} className='text-base font-semibold'>
                        //     Masuk dengan wajah
                        // </div>
                    )}
                    <button className='text-center text-base font-semibold' onClick={toggleMode}>
                        {isCameraOpen ? 'Masuk dengan Username' : 'Masuk dengan Wajah'}
                    </button>
                    {/* {checkCameraStatus()} */}
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
