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
5. data
    -> handle data model or application static data
6. apis
    -> api functions
7. utils
    -> utility functions
*/

// core
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// third party
import { useSession } from "next-auth/react";
import axios from "axios";

//redux
//---

// components
import Navbar from "@/components/Navbar";
import ArrowButton from "@/components/ArrowButton";

// datas
// ---

// apis
import { userGetAllClassApi, userGetClassByLevel } from "@/axios/user";

// utils
import { getImageFile } from "@/utils/get-server-storage";
import { synth, speech, speechAction } from "@/utils/text-to-speech";
import { formatDotString } from "@/utils/format-dot-string";
import { recognition } from "@/utils/speech-recognition";
import { ApiResponseError } from "@/utils/error-handling";

const fetchKelasByLevel = async (idLevel, token) => {
    try {
        const kelasLevel = {
            1: "mudah",
            2: "normal",
            3: "sulit",
            4: "semua",
        };

        let response;
        if (kelasLevel[idLevel] === "semua") {
            response = await userGetAllClassApi({ token });

            if (!response?.data?.length) {
                speechAction({
                    text: `Tidak ada kelas.`,
                });
                return [];
            }

            speechAction({
                text: `Ditemukan ${response?.data?.length} kelas tersedia dari semua kelas.`,
            });

            return response?.data;
        } else {
            response = await userGetClassByLevel({ idLevel, token });

            if (!response?.data?.kelas?.length) {
                speechAction({
                    text: `Kelas dengan level ${kelasLevel[idLevel]} tidak ditemukan`,
                });
                return [];
            }

            speechAction({
                text: `Ditemukan ${response?.data?.kelas?.length} kelas tersedia dengan level ${kelasLevel[idLevel]}.`,
            });

            return response?.data?.kelas;
        }
    } catch (error) {
        if (error instanceof ApiResponseError) {
            console.log(`ERR API MESSAGE: `, error.message);
            console.log(error.data);
            speechAction({
                text: "Kelas tidak ditemukan",
            });
            return;
        }
        console.log(`MESSAGE: `, error.message);
        speechAction({
            text: "Kelas tidak ditemukan",
        });
    }
};

const Kelas = () => {
    const { data } = useSession();
    const router = useRouter();
    const token = data?.user?.token;
    const [kelas, setKelas] = useState([]);
    const [isCari, setCari] = useState(false);
    const [isChecked, setIsChecked] = useState({
        mudah: false,
        normal: false,
        sulit: false,
        semua: true,
    });
    const [loadData, setLoadData] = useState(true);

    //FUNC
    const handlePilihKelas = (namaKelas) => {
        router.push(`/kelas/${namaKelas}`);
    };

    const handleCheckBoxChange = (level) => {
        switch (level) {
            case "mudah":
                setIsChecked({
                    mudah: true,
                    normal: false,
                    sulit: false,
                    semua: false,
                });
                break;
            case "normal":
                setIsChecked({
                    mudah: false,
                    normal: true,
                    sulit: false,
                    semua: false,
                });
                break;
            case "sulit":
                setIsChecked({
                    mudah: false,
                    normal: false,
                    sulit: true,
                    semua: false,
                });
                break;
            case "semua":
                setIsChecked({
                    mudah: false,
                    normal: false,
                    sulit: false,
                    semua: true,
                });
                break;

            default:
                setIsChecked({
                    mudah: false,
                    normal: false,
                    sulit: false,
                    semua: true,
                });
                break;
        }
    };

    // Prevent for react exhaust hook warning, using usecallback wrapper
    const handleFetchKelasByLevelName = useCallback(
        async (level) => {
            if (token) {
                switch (level) {
                    case "mudah": {
                        const kelasMudah = await fetchKelasByLevel(1, token);
                        setKelas(kelasMudah);
                        handleCheckBoxChange("mudah");
                        break;
                    }
                    case "normal": {
                        const kelasNormal = await fetchKelasByLevel(2, token);
                        setKelas(kelasNormal);
                        handleCheckBoxChange("normal");
                        break;
                    }
                    case "sulit": {
                        const kelasSulit = await fetchKelasByLevel(3, token);
                        setKelas(kelasSulit);
                        handleCheckBoxChange("sulit");
                        break;
                    }
                    case "semua": {
                        const semuaKelas = await fetchKelasByLevel(4, token);
                        setKelas(semuaKelas);
                        handleCheckBoxChange("semua");
                        break;
                    }
                    default: {
                        const semuaKelas = await fetchKelasByLevel(4, token);
                        setKelas(semuaKelas);
                        handleCheckBoxChange("semua");
                        break;
                    }
                }
            }
        },
        [token]
    );

    // EFFECTS
    //  INIT SPEECT RECOGNITION
    useEffect(() => {
        try {
            recognition.start();
        } catch (error) {
            recognition.stop();
        }
    }, []);

    useEffect(() => {
        if (token) {
            if (loadData) {
                const fetchApiAllClass = async () => {
                    try {
                        const response = await userGetAllClassApi({ token });
                        setKelas(response.data);

                        console.log("data halaman kelas:", response.data);
                        handleCheckBoxChange("semua");
                        speechAction({
                            text: `Selamat datang di Kelas. Ditemukan ${response.data.length} kelas tersedia.`,
                        });
                    } catch (error) {
                        if (error instanceof ApiResponseError) {
                            console.log(`ERR API MESSAGE: `, error.message);
                            console.log(error.data);
                            speechAction({
                                text: "Kelas tidak ditemukan",
                            });
                            return;
                        }
                        console.log(`MESSAGE: `, error.message);
                        speechAction({
                            text: "Kelas tidak ditemukan",
                        });
                    }
                };
                fetchApiAllClass();
            }
            setLoadData(false);
        }
    }, [token, loadData]);

    useEffect(() => {
        // SPEECH RECOGNITION RESULT
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            const cleanCommand = command?.replace(".", "");

            if (isCari) {
                if (token) {
                    synth.speak(speech(`Mencari ${command}`));
                    const fetchApiClassByName = async () => {
                        try {
                            const response = await axios.get(
                                `https://nurz.site/api/user/kelasByName/${cleanCommand}`,
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            console.log(response.data);

                            if (!response.data.data.length) {
                                synth.speak(speech(`Kelas tidak ditemukan`));
                                setCari(false);
                                return;
                            }

                            if (response.data.data.length > 0) {
                                setKelas(response.data.data);
                                synth.speak(speech("Ditemukan kelas"));
                                for (
                                    let i = 0;
                                    i < response.data.data.length;
                                    i++
                                ) {
                                    synth.speak(
                                        speech(` ${response.data.data[i].name}`)
                                    );
                                }
                                setCari(false);
                            }
                        } catch (error) {
                            setCari(false);
                            synth.speak(`Kelas tidak ditemukan`);
                        }
                    };
                    fetchApiClassByName();
                }
            }

            if (cleanCommand.includes("cari")) {
                //search class by level
                const level = cleanCommand
                    .replace("cari", "")
                    .trim()
                    .toLowerCase();
                if (level.includes("semua kelas")) {
                    // semua
                    handleFetchKelasByLevelName("semua");
                } else if (level.includes("mudah")) {
                    // mudah
                    handleFetchKelasByLevelName("mudah");
                } else if (level.includes("normal")) {
                    // normal
                    handleFetchKelasByLevelName("normal");
                } else if (level.includes("sulit")) {
                    // sulit
                    handleFetchKelasByLevelName("sulit");
                }
            } else if (cleanCommand.includes("belajar")) {
                //enroll the class
                const kelasCommand = cleanCommand.replace("belajar", "").trim();
                const findKelas = kelas.find(
                    (k) => k.name.toLowerCase() === kelasCommand
                );
                if (!findKelas) {
                    // kelas not found
                    console.log(cleanCommand);
                    speechAction({
                        text: "Kelas tidak ditemukan",
                    });
                    return;
                }
                speechAction({
                    text: `Anda akan memasuki ruangan kelas ${findKelas.name}`,
                    actionOnEnd: () => {
                        recognition.stop();
                        router.push(`/kelas/${findKelas.name.toLowerCase()}`);
                    },
                });
            } else if (cleanCommand.includes("mode")) {
                if (cleanCommand.includes("cari")) {
                    //enter mode cari
                    speechAction({
                        text: `Sedang dalam mode cari`,
                        actionOnEnd: () => {
                            setCari(true);
                        },
                    });
                }
            } else if (cleanCommand.includes("pergi")) {
                // moving page with speech
                if (cleanCommand.includes("beranda")) {
                    // moving to /beranda
                    speechAction({
                        text: "Anda akan menuju halaman Beranda",
                        actionOnEnd: () => {
                            router.push("/");
                        },
                    });
                } else if (cleanCommand.includes("rapor")) {
                    // moving to /rapot
                    speechAction({
                        text: "Anda akan menuju halaman Rapor",
                        actionOnEnd: () => {
                            router.push("/rapor");
                        },
                    });
                } else if (cleanCommand.includes("peringkat")) {
                    // moving to /peringkat
                    speechAction({
                        text: "Anda akan menuju halaman Peringkat",
                        actionOnEnd: () => {
                            router.push("/peringkat");
                        },
                    });
                }
            } else if (cleanCommand.includes("sebutkan")) {
                if (cleanCommand.includes("kelas")) {
                    // sebutkan kelas yang tersedia berdasarkan level
                    if (kelas.length > 0) {
                        let typeClass;
                        if (isChecked.mudah) {
                            typeClass = "mudah";
                        } else if (isChecked.normal) {
                            typeClass = "normal";
                        } else if (isChecked.sulit) {
                            typeClass = "sulit";
                        } else if (isChecked.semua) {
                            typeClass = "semua";
                        }
                        speechAction({
                            text: `Daftar kelas ${
                                typeClass === "semua"
                                    ? "pada semua level"
                                    : `pada level ${typeClass}`
                            } yaitu : `,
                            actionOnEnd: () => {
                                for (let i = 0; i < kelas.length; i++) {
                                    speechAction({
                                        text: ` ${kelas[i].name}`,
                                    });
                                }
                            },
                        });
                    }
                }
            } else if (cleanCommand.includes("jumlah kelas")) {
                if (kelas.length) {
                    speechAction({
                        text: `Terdapat ${kelas.length} kelas.`,
                    });
                }
            } else if (cleanCommand.includes("muat")) {
                if (cleanCommand.includes("ulang")) {
                    if (cleanCommand.includes("halaman")) {
                        speechAction({
                            text: `Anda akan load ulang halaman!`,
                            actionOnEnd: () => {
                                setLoadData(true);
                            },
                        });
                    }
                }
            } else if (
                cleanCommand.includes("saya sekarang dimana") ||
                cleanCommand.includes("saya sekarang di mana") ||
                cleanCommand.includes("saya di mana") ||
                cleanCommand.includes("saya dimana")
            ) {
                speechAction({
                    text: `Kita sedang di halaman kelas`,
                });
            }

            console.log(cleanCommand);
        };

        // HANDLING SPEECH RECOGNITION FROM DEATH
        recognition.onend = () => {
            recognition.start();
        };
    }, [router, kelas, isCari, token, isChecked, handleFetchKelasByLevelName]);

    return (
        <div className="h-screen bg-[#EDF3F3]">
            <Navbar />
            <main
                style={{ height: "calc(100vh - 90px)" }}
                className="w-screen bg-[#EDF3F3] pt-[90px] "
            >
                <div className="grid max-w-screen-xl grid-cols-12 mx-auto">
                    <div className="col-span-2">
                        <h1 className="font-bold text-title-2 ">Level</h1>
                        <div className="mt-[30px] flex flex-col gap-[18px] ">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="check"
                                    checked={isChecked.mudah}
                                    onChange={() => {
                                        handleFetchKelasByLevelName("mudah");
                                    }}
                                    className="h-[28px] w-[28px] rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                                />
                                <label
                                    htmlFor="check"
                                    className="font-medium text-body-4"
                                >
                                    Mudah
                                </label>
                            </div>
                            <div className="flex items-center gap-2 ">
                                <input
                                    type="checkbox"
                                    id="check"
                                    onChange={() => {
                                        handleFetchKelasByLevelName("normal");
                                    }}
                                    checked={isChecked.normal}
                                    className="h-[28px] w-[28px] rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                                />
                                <label
                                    htmlFor="check"
                                    className="font-medium text-body-4"
                                >
                                    Normal
                                </label>
                            </div>
                            <div className="flex items-center gap-2 ">
                                <input
                                    type="checkbox"
                                    id="check"
                                    onChange={() => {
                                        handleFetchKelasByLevelName("sulit");
                                    }}
                                    checked={isChecked.sulit}
                                    className="h-[28px] w-[28px] rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                                />
                                <label
                                    htmlFor="check"
                                    className="font-medium text-body-4"
                                >
                                    Sulit
                                </label>
                            </div>
                            <div className="flex items-center gap-2 ">
                                <input
                                    type="checkbox"
                                    id="check"
                                    onChange={() => {
                                        handleFetchKelasByLevelName("semua");
                                    }}
                                    checked={isChecked.semua}
                                    className="h-[28px] w-[28px] rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                                />
                                <label
                                    htmlFor="check"
                                    className="font-medium text-body-4"
                                >
                                    Semua
                                </label>
                            </div>
                        </div>
                    </div>
                    <div
                        style={{ height: "calc(100vh - 100px)" }}
                        className="col-span-10 grid grid-cols-4 gap-[24px] overflow-y-scroll "
                    >
                        {kelas?.length
                            ? kelas.map((kelasData, index) => {
                                  return (
                                      <div
                                          key={index}
                                          className="relative h-[400px] rounded-rad-7  bg-white  p-[14px] shadow-lg lg:col-span-1"
                                      >
                                          <div className="relative  h-[200px] w-full overflow-hidden rounded-rad-7">
                                              <Image
                                                  alt=""
                                                  src={getImageFile(
                                                      kelasData.image
                                                  )}
                                                  fill
                                                  style={{ objectFit: "cover" }}
                                              />
                                          </div>
                                          <h1 className="mt-[14px] text-body-1 font-bold">
                                              {kelasData.name}
                                          </h1>
                                          <p className="mt-[6px]">
                                              {formatDotString(
                                                  kelasData.description,
                                                  40
                                              )}
                                          </p>
                                          {kelasData.status === "jalan" ? (
                                              <div className="absolute bottom-[16px] right-[16px] flex items-center gap-5  rounded-[20px] bg-neutral-2  p-[10px]">
                                                  <span className="font-bold text-white">
                                                      Lanjutkan belajar
                                                  </span>
                                                  <ArrowButton
                                                      onClick={() =>
                                                          handlePilihKelas(
                                                              kelasData.name.toLowerCase()
                                                          )
                                                      }
                                                      directionIcon={"right"}
                                                  />
                                              </div>
                                          ) : kelasData.status === "selesai" ? (
                                              <div className=" absolute bottom-[16px] right-[16px] flex items-center gap-5  rounded-[20px] bg-secondary-1 p-[10px]">
                                                  <span className="font-bold text-white">
                                                      Belajar kembali
                                                  </span>
                                                  <ArrowButton
                                                      onClick={() =>
                                                          handlePilihKelas(
                                                              kelasData.name.toLowerCase()
                                                          )
                                                      }
                                                      directionIcon={"right"}
                                                  />
                                              </div>
                                          ) : (
                                              <div className="absolute bottom-[16px] right-[16px] flex items-center gap-5  rounded-[20px] border-2 bg-primary-1  p-[10px] shadow-low">
                                                  <span className="font-bold text-white">
                                                      Enroll Kelas
                                                  </span>
                                                  <ArrowButton
                                                      onClick={() =>
                                                          handlePilihKelas(
                                                              kelasData.name.toLowerCase()
                                                          )
                                                      }
                                                      directionIcon={"right"}
                                                  />
                                              </div>
                                          )}
                                      </div>
                                  );
                              })
                            : null}
                    </div>
                </div>
            </main>
        </div>
    );
};

Kelas.propTypes = {};

export default Kelas;
