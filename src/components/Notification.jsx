"use client";

//core
import { useEffect } from "react";
import PropTypes from "prop-types";

// third party
import { AiOutlineCloseCircle, AiOutlineCheckCircle } from "react-icons/ai";

const Notification = ({ isVisible, handleVisible, time, type, text }) => {
    const notifType = {
        error: {
            style: "text-alert-1",
            icon: (
                <AiOutlineCloseCircle className="h-[40px] w-[40px] text-alert-1" />
            ),
        },
        success: {
            style: "text-primary-1",
            icon: (
                <AiOutlineCheckCircle className="h-[40px] w-[40px] text-primary-1" />
            ),
        },
    };

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                handleVisible();
            }, time);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [isVisible, handleVisible, time]);

    if (isVisible) {
        return (
            <div
                className={`fixed  inset-0 z-30 flex items-center  justify-center bg-black bg-opacity-60 font-monsterrat`}
            >
                <div className="rounded-rad-7 flex h-[173px] w-[585px] flex-col items-center justify-center gap-[27px] bg-white">
                    {notifType[type].icon}
                    <p
                        className={`${notifType[type].style} text-body-4 font-bold`}
                    >
                        {text}
                    </p>
                </div>
            </div>
        );
    }
};

Notification.propTypes = {
    isVisible: PropTypes.bool,
    handleVisible: PropTypes.func,
    time: PropTypes.number,
    type: PropTypes.string,
    text: PropTypes.string,
};

export default Notification;
