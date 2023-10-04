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
import { AiOutlineCloseCircle, AiOutlineCheckCircle } from 'react-icons/ai';

// redux
// ---

// components
// ---

// data
// ---

// apis
// ---

// utils
// ---

//core

const Notification = ({ isVisible, handleVisible, time, type, text }) => {
    const notifType = {
        error: {
            style: 'text-alert-1',
            icon: <AiOutlineCloseCircle className='h-[40px] w-[40px] text-alert-1' />,
        },
        success: {
            style: 'text-primary-1',
            icon: <AiOutlineCheckCircle className='h-[40px] w-[40px] text-primary-1' />,
        },
    };

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                handleVisible();
            }, time);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [isVisible, handleVisible, time]);

    if (isVisible) {
        return (
            <div className={`fixed  inset-0 z-30 flex items-center  justify-center bg-black bg-opacity-60 font-monsterrat`}>
                <div className='flex h-[173px] w-[585px] flex-col items-center justify-center gap-[27px] rounded-rad-7 bg-white'>
                    {notifType[type].icon}
                    <p className={`${notifType[type].style} text-body-[12px] font-bold`}>{text}</p>
                </div>
            </div>
        );
    }
};

Notification.propTypes = {
    isVisible: PropTypes.bool,
    handleVisible: PropTypes.func,
    time: PropTypes.number,
    type: PropTypes.string,
    text: PropTypes.string,
};

export default Notification;
