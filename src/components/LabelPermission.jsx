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
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePathname } from 'next/navigation';

// third party
import { MdCamera, MdKeyboardVoice } from 'react-icons/md';

// redux
import { useSelector, useDispatch } from 'react-redux';
import { getMicrophoneStatus, checkPermissionSlice, getCameraStatus } from '@/redux/check-permission';

// components
// ---

// data
// ---

// apis
// ---

// utils
import { browserPermission } from '@/utils/browserPermission';

const LabelPermission = ({ className = 'px-3 py-1' }) => {
    //redux
    const dispatch = useDispatch();
    const micprohoneStatus = useSelector(getMicrophoneStatus);
    const path = usePathname();
    const { setMicrophoneStatus } = checkPermissionSlice.actions;
    const cameraStatus = useSelector(getCameraStatus);

    //effects
    useEffect(() => {
        browserPermission('microphone', (browserPermit) => {
            if (browserPermit.error && !browserPermit.state) {
                console.log('Error perizinan: ', browserPermit.error);
            } else {
                dispatch(setMicrophoneStatus(browserPermit.state));
            }
        });
    }, [dispatch, setMicrophoneStatus]);

    if (micprohoneStatus === 'granted') {
        return (
            <div
                className={`${className} ${
                    path === '/rapor' || path === '/peringkat' ? ' text-white' : ' text-primary-1'
                } flex h-max  items-center gap-1  text-center`}>
                <MdKeyboardVoice className='h-[24px] w-[24px]' />
                <h1 className='font-bold'>Mikrofon Aktif</h1>
            </div>
        );
    }
    if (cameraStatus === 'granted') {
        return (
            <div
                // className={`${className} ${
                //     path === '/rapor' || path === '/peringkat' ? ' text-white' : ' text-primary-1'
                // } `}>
                className='flex items-center gap-1 text-center h-max'>
                <MdCamera className='h-[24px] w-[24px]' />
                <h1 className='font-bold'>Kamera Aktif</h1>
            </div>
        );
    }

    return (
        <div className={`${className} flex h-max items-center gap-1 rounded-rad-3 text-center text-red-600 `}>
            <MdKeyboardVoice className='h-[24px] w-[24px]' />
            <h1 className='font-bold'>Mikrofon Mati</h1>
        </div>
    );
};

LabelPermission.propTypes = {
    className: PropTypes.string,
};

export default LabelPermission;
