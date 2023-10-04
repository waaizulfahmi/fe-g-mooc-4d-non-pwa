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
import PropTypes from 'prop-types';

// third party
import { useSession } from 'next-auth/react';

// redux
// --

// components
// ---

// datas
// ---

// apis
// ---

// utils
// ---

const Transkrip = ({ transcript = '', isTrigger = false }) => {
    const { data } = useSession();
    const userName = data?.user?.name;

    return (
        <>
            {isTrigger && (
                <div className='absolute bottom-[20px] left-[50%] z-30  flex h-[65px] w-[80%] translate-x-[-50%] items-center justify-center rounded-[20px] bg-slate-600  text-center text-[24px] font-bold text-white opacity-80'>
                    <p>{transcript.includes('uli') ? `Hai, ${userName}` : transcript}</p>
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
