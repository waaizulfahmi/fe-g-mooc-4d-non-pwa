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

// third party
import { useSession } from 'next-auth/react';

// redux
import { useSelector, useDispatch } from 'react-redux';
import { getIsTranscriptOn, checkPermissionSlice } from '@/redux/check-permission';

// components
// ---

// datas
// ---

// apis
// ---

// utils
import { speechAction } from '@/utils/text-to-speech';

const Transkrip = ({ transcript = '', isTrigger = false }) => {
    const isTranscriptOn = useSelector(getIsTranscriptOn);
    const { setTanscriptOn } = checkPermissionSlice.actions;
    const dispatch = useDispatch();
    const { data } = useSession();
    const userName = data?.user?.name;

    useEffect(() => {
        const handleTranskrip = (e) => {
            if (e.keyCode === 84) {
                if (!isTranscriptOn) {
                    //T key clicked
                    speechAction({
                        text: 'Anda menyalakan transkrip',
                        actionOnEnd: () => {
                            dispatch(setTanscriptOn(true));
                        },
                    });
                } else {
                    //T key clicked
                    speechAction({
                        text: 'Anda mematikan transkrip',
                        actionOnEnd: () => {
                            dispatch(setTanscriptOn(false));
                        },
                    });
                }
            }
        };

        window.addEventListener('keydown', handleTranskrip);

        return () => {
            window.removeEventListener('keydown', handleTranskrip);
        };
    }, [dispatch, isTranscriptOn, setTanscriptOn]);

    return (
        <>
            {isTrigger && isTranscriptOn && (
                <div className='absolute bottom-[20px] left-[50%] z-30  flex h-[65px] w-[80%] translate-x-[-50%] items-center justify-center rounded-[20px] bg-slate-600  text-center text-[24px] font-bold text-white opacity-80'>
                    <p>{transcript.includes('uli') ? transcript.replace('uli', userName).trim().toLowerCase() : transcript}</p>
                </div>
            )}
        </>
    );
};

Transkrip.propTypes = {
    transcript: PropTypes.string,
    isTrigger: PropTypes.bool,
};

export default Transkrip;
