//core
import PropTypes from "prop-types";

const FillButton = ({
    className = "py-[20px] px-[130px]",
    children,
    ...props
}) => {
    return (
        <button
            {...props}
            className={`${className} cursor-pointer appearance-none rounded-rad-5 border-primary-1 bg-primary-1 font-monsterrat font-bold text-neutral-5 outline-none`}
        >
            {children}
        </button>
    );
};

FillButton.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

export default FillButton;
