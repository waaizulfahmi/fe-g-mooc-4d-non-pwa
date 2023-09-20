//core
import Image from 'next/image';
import PropTypes from 'prop-types';

const MicButton = ({ className, ...props }) => {
    return (
        <button
            {...props}
            className={`${className} flex w-max cursor-pointer flex-col items-center gap-[14px] rounded-rad-6 bg-neutral-5 p-[10px] shadow-low hover:shadow-high`}>
            <Image alt='mic icon' src={'/images/mic.svg'} width={56} height={56} />
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
