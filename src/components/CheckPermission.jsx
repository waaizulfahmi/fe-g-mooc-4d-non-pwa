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
import { useEffect, useState } from 'react';
import Image from 'next/image';

// third party
// ---

// redux
import { useSelector, useDispatch } from 'react-redux';
import { getMicrophoneStatus, checkPermissionSlice, getIsPermit, getCameraStatus } from '@/redux/check-permission';

// components
// import LabelPermission from './LabelPermission';
import FillButton from './FillButton';

// data
// ---

// apis
// ---

// utils
import { speechAction } from '@/utils/text-to-speech';
import { buttonAction } from '@/utils/space-button-action';

const CheckPermission = () => {
    const dispatch = useDispatch();
    const isPermit = useSelector(getIsPermit);
    const micprohoneStatus = useSelector(getMicrophoneStatus);
    const cameraStatus = useSelector(getCameraStatus);
    const { setIsPermit } = checkPermissionSlice.actions;

    //states
    const [status, setStatus] = useState(false);
    const [statusBtn, setStatusBtn] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    //effects
    useEffect(() => {
        const spaceButtonAction = (event) => {
            buttonAction({
                event: event,
                key: ' ',
                keyCode: 32,
                action: () => {
                    if (!isPermit) {
                        // console.log({
                        //     micprohoneStatus,
                        //     cameraStatus,
                        // });
                        if (micprohoneStatus !== 'granted' || cameraStatus !== 'granted') {
                            speechAction({
                                text: 'Mohon berikan akses terhadap Mikrofon, Speaker dan Camera',
                            });
                        } else {
                            speechAction({
                                text: 'Mikrofon Speaker dan Camera  sudah berjalan!',
                                actionOnEnd: () => {
                                    setStatusBtn(true);
                                    dispatch(setIsPermit(true));
                                },
                            });
                        }
                    }
                },
            });
        };
        window.addEventListener('keydown', spaceButtonAction);

        return () => {
            window.removeEventListener('keydown', spaceButtonAction);
        };
    }, [dispatch, isPermit, setIsPermit, cameraStatus, micprohoneStatus]);

    useEffect(() => {
        if (micprohoneStatus === 'denied') {
            setStatus(false);
            setStatusMsg('Hidupkan mikrofon!');
        } else if (micprohoneStatus === 'granted' && !statusBtn) {
            setStatus(false);
            setStatusMsg('Tekan tombol Spasi!');
        } else if (micprohoneStatus === 'granted' && statusBtn) {
            setStatus(true);
            setStatusMsg('Ayo Belajar!');
        }
    }, [micprohoneStatus, statusBtn]);

    return (
        <>
            {!isPermit && (
                <section className='fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-60'>
                    <div className='flex h-[500px] w-[800px] flex-col gap-10 overflow-hidden rounded-rad-6 bg-white p-5'>
                        <h1 className='text-head-5 text-center font-bold'>Yuk kita atur dulu Aplikasinya</h1>
                        <div className='col-span-12 grid h-full grid-cols-12 '>
                            <div className='col-span-10 flex flex-col gap-3 md:col-span-5 '>
                                <h1 className='text-body-2 font-bold'>1. Izinkan perizinan untuk mikrofon </h1>
                                <Image alt='' src={'/images/permission-check.jpg'} width={400} height={400} />
                                <h1 className='text-body-2 font-bold'>2. Izinkan perizinan untuk kamera</h1>
                                <Image alt='' src={'/images/camera.jpg'} width={400} height={400} />
                            </div>
                            {/* divider */}
                            <div className='col-span-10 flex flex-col items-center justify-center md:col-span-2 '>
                                <div className='h-full border border-black'></div>
                            </div>
                            {/* divider */}
                            <div className='flex flex-col gap-3 md:col-span-5 '>
                                <h1 className='text-body-2 font-bold'>3. Kita cek Mikrofon dan Kameranya</h1>
                                <p>
                                    Untuk cek mikrofon tekan tombol <span className='text-body-3 font-bold'>Spasi</span>
                                </p>

                                <Image alt='' src={'/images/space-key.png'} width={400} height={400} />
                                <p>
                                    <span className='font-bold text-red-600'>NOTE :</span> <br />
                                    Cek mikrofon di browser Anda <br /> sampai terdengar suara!
                                </p>

                                <div className='flex flex-col gap-2'>
                                    <p className='text-[12px] font-bold text-black text-opacity-50'>
                                        Klik tombol ini jika mikrofon sudah bekerja!
                                    </p>
                                    <FillButton
                                        disabled={!status}
                                        // onClick={() => dispatch(setIsPermit(!isPermit))}
                                        className={`${
                                            status ? ' opacity-100' : ' opacity-50'
                                        } bg-color-1 border-color-1 rounded-rad-3 border px-5 py-2  text-[20px] font-semibold text-white`}>
                                        {statusMsg}
                                    </FillButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default CheckPermission;
