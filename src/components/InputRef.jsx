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
import { forwardRef } from 'react';
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

const InputRef = forwardRef(function InputRef(
    {
        id,
        className = 'bg-neutral-6  border-neutral-6 px-6 py-[17px] text-body-2 font-normal focus:border-primary-1 ',
        type = 'text',
        placeholder = 'Your placeholder',
        ...props
    },
    ref,
) {
    return (
        <input
            {...props}
            ref={ref}
            id={id}
            type={type}
            placeholder={placeholder}
            className={`${className}  w-full cursor-pointer  appearance-none border-2 font-monsterrat outline-none`}
        />
    );
});

InputRef.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
};

export default InputRef;
