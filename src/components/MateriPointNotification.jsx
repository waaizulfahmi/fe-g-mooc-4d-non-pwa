// 'use client';

// /*
// @DOCS :
// 1. core
//     -> package from react / next
// 2. third party
//     -> package from third party
// 3. redux
//     -> redux global state management
// 4. components
//     -> reusable component
// 5. data
//     -> handle data model or application static data
// 6. apis
//     -> api functions
// 7. utils
//     -> utility functions
// */

// // core
// import { useEffect } from 'react';
// import PropTypes from 'prop-types';

// // third party
// import { AiOutlineCloseCircle, AiOutlineCheckCircle } from 'react-icons/ai';

// // redux
// // ---

// // components
// // ---

// // data
// // ---

// // apis
// // ---

// // utils
// // ---

// const MateriPoinNotification = ({ isVisible, handleVisible, time, type, text }) => {
//     useEffect(() => {
//         if (isVisible) {
//             const timer = setTimeout(() => {
//                 handleVisible();
//             }, time);

//             return () => {
//                 clearTimeout(timer);
//             };
//         }
//     }, [isVisible, handleVisible, time]);

//     if (isVisible) {
//         return (
//             <div className={`fixed  inset-0 z-30 flex items-center  justify-center bg-black bg-opacity-60 font-monsterrat`}>
//                 <div className='flex h-[173px] w-[585px] flex-col items-center justify-center gap-[27px] rounded-rad-7 bg-white'>
//                     {notifType[type].icon}
//                     <p className={`${notifType[type].style} text-body-[12px] font-bold`}>{text}</p>
//                 </div>
//             </div>
//         );
//     }
// };

// export default MateriPoinNotification;

import Image from 'next/image';
import { useEffect } from 'react';
// import { speechAction } from '@/utils/text-to-speech';

const MateriPoinNotification = ({ isVisible, poin, handleVisible, time }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                handleVisible();
            }, time);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [isVisible, handleVisible, time, poin]);

    if (isVisible) {
        return (
            <div className={`fixed  inset-0 z-30 flex items-center  justify-center bg-black bg-opacity-60 font-monsterrat`}>
                <div className='relative flex h-[173px] w-[585px] flex-col items-center justify-center gap-[27px] rounded-rad-7 bg-white'>
                    <Image
                        src={'/images/award-new.png'}
                        alt=''
                        width={120}
                        height={120}
                        className='absolute left-[50%] top-[-60px] translate-x-[-50%]'
                    />
                    <h1 className='pt-[20px] font-bold'>Selamat Kamu Mendapat {poin} Poin !</h1>
                </div>
            </div>
        );
    }
};

export default MateriPoinNotification;
