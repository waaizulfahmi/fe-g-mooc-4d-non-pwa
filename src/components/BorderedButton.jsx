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

const BorderedButton = ({ theme = 'light', className = 'sm:max-md:px-[100] py-[20px] px-[130px]', children, ...props }) => {
    const borderTheme = {
        light: 'bg-none border-neutral-5 text-neutral-5',
        dark: 'text-primary-1 border-primary-1 bg-neutral-5',
    };

    return (
        <button
            {...props}
            className={`${className} ${borderTheme[theme]} cursor-pointer appearance-none rounded-rad-5 border-2 font-monsterrat font-bold outline-none`}>
            {children}
        </button>
    );
};

BorderedButton.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    theme: PropTypes.string,
};

export default BorderedButton;
