//core
import PropTypes from "prop-types";

const BorderedButton = ({
    theme = "light",
    className = "py-[20px] px-[130px]",
    children,
    ...props
}) => {
    const borderTheme = {
        light: "bg-none border-neutral-5 text-neutral-5",
        dark: "text-primary-1 border-primary-1 bg-neutral-5",
    };

    return (
        <button
            {...props}
            className={`${className} ${borderTheme[theme]} cursor-pointer appearance-none rounded-rad-5 border-2 font-monsterrat font-bold outline-none`}
        >
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
