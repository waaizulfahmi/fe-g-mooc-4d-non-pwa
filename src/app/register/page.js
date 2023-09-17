'use client';

// core
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// third parties
import { useForm } from 'react-hook-form';

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
                });
                handleNotifAction('success', 'Yeay ! Registrasi Berhasil.\nCheck Email Anda untuk verifikasi Akun!');
                if (!notifData?.isVisible) {
                    setTimeout(() => {
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
