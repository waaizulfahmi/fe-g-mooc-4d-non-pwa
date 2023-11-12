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
// third party
// redux
// components
// data
// apis
// utils
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';

// third parties
import { getSession, signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Webcam from 'react-webcam';
// import Popup from 'reactjs-popup';

// hooks
import { useCheckReloadPage, useNotification, useMovePage, useCheckScreenOrientation } from '@/hooks';

// component
import BorderedButton from '@/components/BorderedButton';
import FillButton from '@/components/FillButton';
import InputRef from '@/components/InputRef';
import PasswordInputRef from '@/components/PasswordInputRef';
import Label from '@/components/Label';
import Notification from '@/components/Notification';
import { speechWithBatch, speechAction, stopSpeech } from '@/utils/text-to-speech';
import CheckPermission from '@/components/CheckPermission';
import { recognition } from '@/utils/speech-recognition';

import { useSelector, useDispatch } from 'react-redux';
import { getIsPermit, checkPermissionSlice, getCameraStatus } from '@/redux/check-permission';

import { browserPermission } from '@/utils/browserPermission';

const Login = () => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const router = useRouter();
    const { notifData, handleNotifAction, handleNotifVisible } = useNotification();
    const webcamRef = useRef();
    const [isCameraOpen, setIsCameraOpen] = useState(true);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCapturing, setIsCapturing] = useState(true);
    // const [speechOn, setSpeechOn] = useState(false); // state untuk  speech recognition

    const [isFaceSuccess, setIsFaceSuccess] = useState(false);
    const isPermit = useSelector(getIsPermit);
    const { setCameraStatus, setMicrophoneStatus, setIsPermit } = checkPermissionSlice.actions;
    const { windowSize } = useCheckScreenOrientation();
    // const cameraStatus = useSelector(getCameraStatus);
    // console.log('Camera status in UI: ', cameraStatus);

    // ACCESSIBILITY STATE
    const [speechOn, setSpeechOn] = useState(false); // state untuk  speech recognition
    const [transcript, setTrancript] = useState(''); // state untuk menyimpan transcript hasil speech recognition
    const [skipSpeech, setSkipSpeech] = useState(false); // state untuk  mengatasi speech recogniton ter-trigger
    const [displayTranscript, setDisplayTranscript] = useState(false); // state untuk  menampilkan transcript
    const [isClickButton, setIsClickButton] = useState(false); // state untuk aksi tombol
    const [isPlayIntruction, setIsPlayIntruction] = useState(false); // state  ketika intruksi berjalan

    const { sessioName } = useCheckReloadPage({ name: pathname });
    const { handleMovePage } = useMovePage(sessioName);

    useEffect(() => {
        const deleteSessionReload = () => {
            console.log('it worked login');
            sessionStorage.removeItem(sessioName);
            dispatch(setIsPermit(false));
        };

        window.addEventListener('pageshow', deleteSessionReload);

        return () => {
            window.removeEventListener('pageshow', deleteSessionReload);
        };
    }, [sessioName, dispatch, setIsPermit]);

    const waitForCamera = () => {
        const cameraCheckInterval = setInterval(() => {
            if (webcamRef.current?.video.readyState === 4) {
                clearInterval(cameraCheckInterval);

                capture();
            }
        }, 5000);

        setTimeout(() => {
            clearInterval(cameraCheckInterval);
        }, 5000);
    };

    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js') // Sesuaikan dengan lokasi service worker Anda
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const toggleMode = () => {
        stopSpeech();
        if (isCameraOpen) {
            setIsCameraOpen(false);
            // await capture();
        } else {
            setIsCameraOpen(true);
            setIsCapturing(true);
            // resetStateCount();
            // console.log(captureCount);
            // setTokenFalse();
            const waitForCameraForToggle = setInterval(async () => {
                if (webcamRef.current?.video?.readyState === 4) {
                    clearInterval(waitForCameraForToggle);
                    // faceMyDetect();
                    await capture();
                }
            }, 5000);
        }
    };

    const isFaceSuccessFunct = () => {
        setIsFaceSuccess(true);
    };

    const capture = async () => {
        if (isCapturing) {
            const imageSrc = webcamRef.current?.getScreenshot();
            // console.log(imageSrc);
            if (imageSrc) {
                await submitCapturedImage(imageSrc);
            }
        }
    };

    let captureCount = 0;

    const submitCapturedImage = async (imageSrc) => {
        setIsLoading(true);

        const response = await signIn('face-login', {
            image: imageSrc,
            redirect: false,
        });

        const session = await getSession();
        // console.log(captureCount);

        if (!session && captureCount < 10) {
            captureCount++;
            await capture();
        } else if (!session && captureCount === 10) {
            speechAction({
                text: 'Maaf, kami tidak mengenali wajah anda, anda dapat meminta bantuan orang lain untuk pengisian form login, atau dapat mengulangi pengenalan wajah dengan memanggil hai uli, dan diteruskan dengan ulangi pengenalan wajah',
                actionOnEnd: () => {
                    setIsCameraOpen(false);
                    captureCount = 0;
                    setSpeechOn(false);
                },
            });
        } else if (!response?.error) {
            isFaceSuccessFunct();
            speechAction({
                text: 'Kami Berhasil Mengenali Anda, tunggu beberapa saat,   anda akan diarahkan ke halaman beranda',
                actionOnEnd: () => {
                    router.refresh();
                    // router.replace('/', { scroll: false });
                    handleMovePage('/', 'replace', false);
                },
            });
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
            // router.replace('/', { scroll: false });
            handleMovePage('/', 'replace', false);
        } else if (response?.error) {
            handleNotifAction('error', response.error);
        }
    };

    // camera permission
    useEffect(() => {
        browserPermission('camera', (browserPermit) => {
            if (browserPermit.error && !browserPermit.state) {
                // console.log('Error perizinan: ', browserPermit.error);
            } else {
                dispatch(setCameraStatus(browserPermit.state));
            }
        });
        browserPermission('microphone', (browserPermit) => {
            if (browserPermit.error && !browserPermit.state) {
                // console.log('Error perizinan: ', browserPermit.error);
            } else {
                dispatch(setMicrophoneStatus(browserPermit.state));
            }
        });
    }, [dispatch, setCameraStatus, setMicrophoneStatus]);

    useEffect(() => {
        try {
            recognition.start();
            // console.log('recognition berhasil');
        } catch (error) {
            recognition.stop();
        }
    }, []);

    useEffect(() => {
        registerServiceWorker();
    }, []);

    useEffect(() => {
        if (isCameraReady) {
            waitForCamera();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCameraReady]);

    useEffect(() => {
        if (isPermit) {
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
                        actionOnEnd: () => {
                            // KAMERA CONDITION
                            setIsCameraReady(true);
                        },
                    },
                ],
            });
        }
    }, [isPermit]);

    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event?.results[0][0]?.transcript?.toLowerCase();
            const cleanCommand = command?.replace('.', '');
            // console.log(cleanCommand);

            if (speechOn && !skipSpeech) {
                if (cleanCommand.includes('ulangi')) {
                    if (cleanCommand.includes('pengenalan')) {
                        if (cleanCommand.includes('wajah')) {
                            // console.log('saya disini');
                            setSpeechOn(false);
                            speechAction({
                                text: 'Kami akan mengenali anda lagi',
                                actionOnEnd: () => {
                                    setIsCameraOpen(true);
                                    waitForCamera();
                                    setIsCapturing(true);
                                },
                            });
                        }
                    }
                }
            }

            if (!skipSpeech) {
                if (cleanCommand.includes('hallo') || cleanCommand.includes('halo') || cleanCommand.includes('hai')) {
                    if (cleanCommand.includes('uli')) {
                        setTrancript(cleanCommand);
                        stopSpeech();
                        speechAction({
                            text: `Hai Calon Pengguna, saya mendengarkan Anda!`,
                            actionOnStart: () => {
                                setDisplayTranscript(true);
                            },
                            actionOnEnd: () => {
                                setSpeechOn(true);
                            },
                        });
                    }
                }
            }
        };

        recognition.onend = () => {
            recognition.start();
        };

        // console.log('TRIGGER CONDITION: ', speechOn);

        if (speechOn) {
            const timer = setTimeout(() => {
                speechAction({
                    text: 'saya diam',
                    actionOnEnd: () => {
                        // console.log('speech diclear');
                        // setDisplayTranscript(false);
                        setSpeechOn(false);
                    },
                });
            }, 10000);

            return () => {
                clearTimeout(timer);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speechOn, isCameraOpen, skipSpeech]);

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
                <h1 className='z-0 px-3 pt-4 text-center'>
                    <b>Maaf</b>, Aplikasi tidak dapat berjalan dengan baik pada layar {windowSize.innerWidth}px. Buka di layar
                    lebih dari 640px atau gunakan
                    <b> laptop</b>.
                </h1>
            </div>
        );
    }

    return (
        <section className='grid h-screen grid-cols-12'>
            <div className='relative col-span-4 hidden h-full md:block'>
                <Image priority src={'/small-images/left-auth.webp'} alt='left auth background' fill sizes='100vh' />
                <Image
                    alt='white icon gmooc'
                    src={'/small-images/icon-white.webp'}
                    width={166}
                    height={60}
                    className='absolute left-[24px] top-[24px] '
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
                            handleMovePage('/register', 'replace', false);
                        }}>
                        Daftar
                    </BorderedButton>
                </div>
            </div>
            <div className='col-span-12 flex items-center justify-center bg-neutral-7 md:col-span-8'>
                <div className='flex w-[646px] flex-col gap-[20px]'>
                    <div className='text-center'>
                        <h1 className='text-xl font-bold md:text-title-2'>Masuk G-MOOC 4D</h1>
                        <p className='text-body-2'>Buktikan Sekarang Semua Bisa Belajar</p>
                    </div>
                    {isCameraOpen ? (
                        <div open={isCameraOpen} className='flex flex-col items-center justify-center rounded-lg p-4'>
                            {/* <div className='fixed inset-0 bg-opacity-50 backdrop-blur-md backdrop-filter'></div> */}
                            <div className='relative'>
                                {/* <h1 className='pb-4 text-base font-semibold text-center'>Face Recognition Technology</h1> */}
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    mirrored={true}
                                    width={500}
                                    height={500}
                                    screenshotFormat='image/jpeg'
                                    className='mx-auto flex w-3/4 rounded-lg text-center shadow-lg'
                                />

                                {isLoading ? (
                                    <>
                                        <div className='pt-3 text-center'>
                                            <svg
                                                aria-hidden='true'
                                                className='mr-2 inline h-10 w-10 animate-spin fill-green-500 text-gray-200 dark:text-gray-600'
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
                                    <div>
                                        <h1 className='pt-5 text-center'>Mohon Tunggu...</h1>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form className='mx-4 flex flex-col items-center gap-[20px] md:mx-0' onSubmit={handleSubmit(onSubmit)}>
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
                                    }     bg-neutral-6 px-6 py-[17px] text-body-2 font-normal`}
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
                    )}
                    <button className='text-center text-base font-semibold' onClick={toggleMode}>
                        {isCameraOpen ? 'Masuk dengan Email' : 'Masuk dengan Wajah'}
                    </button>
                    <button
                        className='relative text-center text-base font-semibold md:hidden'
                        onClick={() => handleMovePage('/register', 'replace', false)}>
                        Daftar Akun
                    </button>
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

export default Login;
