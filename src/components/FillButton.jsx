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

const FillButton = ({ className = 'py-[20px] px-[130px]', children, ...props }) => {
    return (
        <button
            {...props}
            className={`${className} cursor-pointer appearance-none rounded-rad-5 border-primary-1 bg-primary-1 font-monsterrat font-bold text-neutral-5 outline-none`}>
            {children}
        </button>
    );
};

FillButton.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

export default FillButton;
