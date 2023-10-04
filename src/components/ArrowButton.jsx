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
import { AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

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

const IconButton = ({ direction = 'left', width = 20, height = 20 }) => {
    switch (direction) {
        case 'left':
            return <AiOutlineArrowLeft className={`w-[${width}px] h-[${height}px]`} />;
        case 'right':
            return <AiOutlineArrowRight className={`w-[${width}px] h-[${height}px]`} />;
        case 'top':
            return <AiOutlineArrowUp className={`w-[${width}px] h-[${height}px]`} />;
        case 'bottom':
            return <AiOutlineArrowDown className={`w-[${width}px] h-[${height}px]`} />;
        default:
            return <AiOutlineArrowLeft className={`w-[${width}px] h-[${height}px]`} />;
    }
};

IconButton.propTypes = {
    direction: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
};

const ArrowButton = ({ directionIcon, widthIcon, heightIcon, className = 'p-[10px]', ...props }) => {
    return (
        <button
            {...props}
            className={`${className} cursor-pointer appearance-none rounded-full bg-neutral-5 font-monsterrat drop-shadow-high`}>
            <IconButton direction={directionIcon} width={widthIcon} height={heightIcon} />
        </button>
    );
};

ArrowButton.propTypes = {
    className: PropTypes.string,
    directionIcon: PropTypes.string,
    widthIcon: PropTypes.number,
    heightIcon: PropTypes.number,
};

export default ArrowButton;
