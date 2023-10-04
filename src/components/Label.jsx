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

const Label = ({ className = 'mb-1 font-normal text-body-3', htmlFor, children, ...props }) => {
    return (
        <label {...props} htmlFor={htmlFor} className={`${className} font-monsterrat`}>
            {children}
        </label>
    );
};

Label.propTypes = {
    className: PropTypes.string,
    htmlFor: PropTypes.string,
    children: PropTypes.node,
};

export default Label;
