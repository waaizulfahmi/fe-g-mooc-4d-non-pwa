"use client";

/* 
@DOCS :
1. core
    -> package from react / next
2. third party
    -> package from third party
3. redux
    -> redux global state management
4. component
    -> reusable component
5. data
    -> handle data model or application static data
6. api
    -> api functions
7. util
    -> utility functions
*/

// core
import { useEffect } from "react";
import PropTypes from "prop-types";
import { usePathname } from "next/navigation";

// third party
import { MdKeyboardVoice } from "react-icons/md";

// redux
import { useSelector, useDispatch } from "react-redux";
import {
    getMicrophoneStatus,
    checkPermissionSlice,
} from "@/redux/check-permission";

// component
// ---

// data
// ---

// api
// ---

// util
// ---

const LabelPermission = ({ className = "px-3 py-1" }) => {
    //redux
    const dispatch = useDispatch();
    const micprohoneStatus = useSelector(getMicrophoneStatus);
    const path = usePathname();
    const { setMicrophoneStatus } = checkPermissionSlice.actions;

    //effects
    useEffect(() => {
        const checkPermission = () => {
            navigator.permissions
                .query(
                    // { name: 'camera' }
                    { name: "microphone" }
                    // { name: 'geolocation' }
                    // { name: 'notifications' }
                    // { name: 'midi', sysex: false }
                    // { name: 'midi', sysex: true }
                    // { name: 'push', userVisibleOnly: true }
                    // { name: 'push' } // without userVisibleOnly isn't supported in chrome M45, yet
                )
                .then(function (permissionStatus) {
                    // setPermissionMic(permissionStatus?.state); // granted, denied, prompt
                    dispatch(setMicrophoneStatus(permissionStatus?.state));
                    permissionStatus.onchange = function () {
                        dispatch(setMicrophoneStatus(permissionStatus?.state)); // granted, denied, prompt
                    };
                });
        };
        checkPermission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [micprohoneStatus]);

    if (micprohoneStatus === "granted") {
        return (
            <div
                className={`${className} ${
                    path === "/rapor" || path === "/peringkat"
                        ? " text-white"
                        : " text-primary-1"
                } flex h-max  items-center gap-1  text-center`}
            >
                <MdKeyboardVoice className="h-[24px] w-[24px]" />
                <h1 className="font-bold">Mikrofon Aktif</h1>
            </div>
        );
    }

    return (
        <div
            className={`${className} rounded-rad-3 flex h-max items-center gap-1 text-center text-red-600 `}
        >
            <MdKeyboardVoice className="h-[24px] w-[24px]" />
            <h1 className="font-bold">Mikrofon Mati</h1>
        </div>
    );
};

LabelPermission.propTypes = {
    className: PropTypes.string,
};

export default LabelPermission;
