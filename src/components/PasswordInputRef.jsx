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
import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';

// third party
import { FiEye, FiEyeOff } from 'react-icons/fi';

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

const PasswordInputRef = forwardRef(function PasswordInputRef(
    {
        id,
        isError = false,
        placeholder = 'Your placeholder',
        className = 'bg-neutral-6  border-neutral-6 px-6 py-[17px] text-body-2 font-normal focus:border-primary-1 ',
        ...props
    },
    ref,
) {
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <div className='relative w-full'>
            <input
                autoComplete='on'
                {...props}
                ref={ref}
                id={id}
                placeholder={placeholder}
                type={showPassword ? 'text' : 'password'}
                className={`${className} font-poppins w-full appearance-none  border-2 outline-none`}
            />
            {showPassword ? (
                <FiEye
                    onClick={togglePassword}
                    className={`${
                        isError ? 'text-alert-1' : 'text-primary-1'
                    } absolute right-1 top-[50%] mr-3 h-5 w-5 translate-y-[-50%] cursor-pointer `}
                />
            ) : (
                <FiEyeOff
                    onClick={togglePassword}
                    className={`${
                        isError ? 'text-alert-1' : 'text-neutral-3'
                    } absolute right-1 top-[50%] mr-3 h-5 w-5 translate-y-[-50%] cursor-pointer `}
                />
            )}
        </div>
    );
});

PasswordInputRef.propTypes = {
    id: PropTypes.string,
    isError: PropTypes.bool,
    className: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
};

export default PasswordInputRef;
