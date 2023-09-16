//core
import PropTypes from "prop-types";

const Label = ({
    className = "mb-1 font-normal text-body-3",
    htmlFor,
    children,
    ...props
}) => {
    return (
        <label
            {...props}
            htmlFor={htmlFor}
            className={`${className} font-monsterrat`}
        >
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
