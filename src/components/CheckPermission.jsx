"use client";

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
5. apis
    -> api functions
6. utils
    -> utility functions
*/

// core
import { useEffect, useState } from "react";
import Image from "next/image";

// third party
// ---

// redux
import { useSelector, useDispatch } from "react-redux";
import {
    getMicrophoneStatus,
    checkPermissionSlice,
    getIsPermit,
} from "@/redux/check-permission";

// components
import LabelPermission from "./LabelPermission";
import FillButton from "./FillButton";

// datas
// ---

// apis
// ---

// utils
import { synth, speech } from "@/utils/text-to-speech";

const CheckPermission = () => {
    const dispatch = useDispatch();
    const isPermit = useSelector(getIsPermit);
    const micprohoneStatus = useSelector(getMicrophoneStatus);
    const { setIsPermit } = checkPermissionSlice.actions;

    //states
    const [status, setStatus] = useState(false);
    const [statusBtn, setStatusBtn] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    //effects
    useEffect(() => {
        const detectKeyDownNew = (e) => {
            if (e.keyCode === 69) {
                if (!isPermit) {
                    //E key clicked
                    let utterance = speech(
                        "Mikrofon dan Speaker sudah berjalan, Anda dapat mengikuti pembelajaran!"
                    );
                    utterance.onend = () => {
                        setStatusBtn(true);
                        dispatch(setIsPermit(true));
                    };
                    synth.speak(utterance);
                }
            }
        };

        window.addEventListener("keydown", detectKeyDownNew);

        return () => window.removeEventListener("keydown", detectKeyDownNew);
    }, [dispatch, isPermit, setIsPermit]);

    useEffect(() => {
        if (micprohoneStatus === "denied") {
            setStatus(false);
            setStatusMsg("Hidupkan mikrofon!");
        } else if (micprohoneStatus === "granted" && !statusBtn) {
            setStatus(false);
            setStatusMsg("Tekan tombol Q!");
        } else if (micprohoneStatus === "granted" && statusBtn) {
            setStatus(true);
            setStatusMsg("Ayo Belajar!");
        }
    }, [micprohoneStatus, statusBtn]);

    return (
        <>
            {!isPermit && (
                <section className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="flex h-[500px] w-[800px] flex-col gap-10 overflow-hidden rounded-rad-6 bg-white p-5">
                        <h1 className="font-bold text-center text-head-5">
                            Yuk kita atur dulu Aplikasinya
                        </h1>
                        <div className="grid h-full grid-cols-12 col-span-12 ">
                            <div className="flex flex-col col-span-5 gap-3 ">
                                <h1 className="font-bold text-body-2">
                                    1. Izinkan perizinan untuk mikrofon
                                </h1>
                                <Image
                                    alt=""
                                    src={"/images/permission-check.png"}
                                    width={400}
                                    height={400}
                                />

                                <div className="flex flex-col gap-3 mt-5">
                                    <h1 className="font-bold text-black text-opacity-50">
                                        Status Mikrofon :
                                    </h1>
                                    <LabelPermission className="px-5 py-3 text-[20px] font-bold" />
                                </div>
                            </div>
                            {/* divider */}
                            <div className="flex flex-col items-center justify-center col-span-2 ">
                                <div className="h-full border border-black"></div>
                            </div>
                            {/* divider */}
                            <div className="flex flex-col col-span-5 gap-3 ">
                                <h1 className="font-bold text-body-2">
                                    2. Kita check mikrofon
                                </h1>
                                <p>
                                    Untuk cek mikrofon tekan tombol{" "}
                                    <span className="font-bold">Q</span>
                                </p>

                                <Image
                                    alt=""
                                    src={"/images/q-key.png"}
                                    width={400}
                                    height={400}
                                />
                                <p>
                                    <span className="font-bold text-red-600">
                                        NOTE :
                                    </span>{" "}
                                    <br />
                                    Cek mikrofon di browser Anda <br /> sampai
                                    terdengar suara!
                                </p>

                                <div className="flex flex-col gap-2">
                                    <p className="text-[12px] font-bold text-black text-opacity-50">
                                        Klik tombol ini jika mikrofon sudah
                                        bekerja!
                                    </p>
                                    <FillButton
                                        disabled={!status}
                                        // onClick={() => dispatch(setIsPermit(!isPermit))}
                                        className={`${
                                            status
                                                ? " opacity-100"
                                                : " opacity-50"
                                        } bg-color-1 border-color-1 rounded-rad-3 border px-5 py-2  text-[20px] font-semibold text-white`}
                                    >
                                        {statusMsg}
                                    </FillButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default CheckPermission;
