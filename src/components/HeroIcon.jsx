//core
import Image from "next/image";
import PropTypes from "prop-types";

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
