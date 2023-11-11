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
import Image from 'next/image';
import PropTypes from 'prop-types';

// third party
// ---

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

const MicButton = ({ className, ...props }) => {
    return (
        <button
            {...props}
            className={`${className} flex w-max cursor-pointer flex-col items-center gap-[14px] rounded-rad-6 bg-neutral-5 p-[10px] shadow-low hover:shadow-high`}>
            <Image alt='mic icon' src={'/small-images/mic.webp'} width={56} height={56} />
            <h1 className='text-center font-bold text-secondary-1 '>
                Voice Recogniton <br /> Technology
            </h1>
        </button>
    );
};

MicButton.propTypes = {
    className: PropTypes.string,
};

export default MicButton;
