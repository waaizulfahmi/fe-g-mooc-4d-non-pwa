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

const HeroIcon = ({ alt, imgUrl, width, height, className, onClick }) => {
    return (
        <div onClick={onClick} className={`${className} cursor-pointer`}>
            <Image alt={alt} src={imgUrl} width={width} height={height} />
        </div>
    );
};

HeroIcon.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    alt: PropTypes.string,
    imgUrl: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
    onClick: PropTypes.func,
};

export default HeroIcon;
