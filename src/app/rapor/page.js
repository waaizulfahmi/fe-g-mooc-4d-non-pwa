'use client';

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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// third party
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';

// redux
// import { useSelector, useDispatch } from 'react-redux';
// import { getListening, speechRecognitionSlice } from '@/redux/speech-recognition';

// components
import FillButton from '@/components/FillButton';
import Navbar from '@/components/Navbar';
import BorderedButton from '@/components/BorderedButton';
import Transkrip from '@/components/Transkrip';

// datas
import { Rapot } from '@/data/model';

// apis
//---

// utils
import { speechAction } from '@/utils/text-to-speech';
import { recognition } from '@/utils/speech-recognition';
import { ApiResponseError } from '@/utils/error-handling';
import { getImageFile } from '@/utils/get-server-storage';
import { apiInstance } from '@/axios/instance';

const userGetRapotApi = async ({ token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');

        const response = await apiInstance.get(`/user/rapor`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            //custom from backend

            // const errorMsgGJadi = error?.response?.data?.metadata?.message; // yg g jadi
            const errorMsg = error?.response?.data?.message; // yg jadi

            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

const Rapor = () => {
    const { data } = useSession();
    const token = data?.user?.token;
    const userName = data?.user?.name;
    const router = useRouter();

    // STATE
    const [loadData, setLoadData] = useState(true);
    const [countFinishedClass, setCountFinishedClass] = useState(0);
    const [rataProgress, setRataProgress] = useState('');
    const [totalPoin, setTotalPoin] = useState(0);
    const [nilai, setNilai] = useState(0);
    const [runningClass, setRunningClass] = useState([]);
    const [totalPelajaran, setTotalPelajaran] = useState([]);
    const [transcript, setTrancript] = useState('');

    // FUNC
    //---

    // EFFECTS
    // init recognition
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
                const fetchApiRapot = async () => {
                    try {
                        const response = await userGetRapotApi({ token });

                        const rapot = new Rapot({
                            totalPoin: response.total_poin,
                            nilai: response.nilai,
                            jumlahSelesai: response.jumlah_selesai,
                            kelasProgress: response.kelas_progress,
                            kelasSelesai: response.kelas_selesai,
                            rataProgress: response.rata_progress,
                        });

                        setTotalPoin(rapot.getTotalPoin());
                        setCountFinishedClass(rapot.getJumlahSelesai());
                        setRataProgress(rapot.getRataProgress());
                        setRunningClass(rapot.getKelasProgress());
                        setNilai(rapot.getNilai());
                        setTotalPelajaran(rapot.getSemuaPelajaran());

                        console.log('semua peljara:', rapot.getSemuaPelajaran());
                        console.log(response);
                        console.log(rapot);
                    } catch (error) {
                        if (error instanceof ApiResponseError) {
                            console.log(`ERR RAPOT API MESSAGE: `, error.message);
                            console.log(error.data);
                            return;
                        }
                        console.log(`MESSAGE: `, error.message);
                    }
                };
                fetchApiRapot();
            }
            setLoadData(false);
        }
    }, [token, loadData]);

    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            const cleanCommand = command?.replace('.', '');

            if (cleanCommand.includes('pergi')) {
                if (cleanCommand.includes('beranda')) {
                    speechAction({
                        text: 'Anda akan menuju halaman Beranda',
                        actionOnEnd: () => {
                            router.push('/');
                        },
                    });
                } else if (cleanCommand.includes('kelas')) {
                    speechAction({
                        text: 'Anda akan menuju halaman Kelas',
                        actionOnEnd: () => {
                            router.push('/kelas');
                        },
                    });
                } else if (cleanCommand.includes('peringkat')) {
                    speechAction({
                        text: 'Anda akan menuju halaman Peringkat',
                        actionOnEnd: () => {
                            router.push('/peringkat');
                        },
                    });
                }
            } else if (cleanCommand.includes('muat')) {
                if (cleanCommand.includes('ulang')) {
                    if (cleanCommand.includes('halaman')) {
                        speechAction({
                            text: `Anda akan load halaman ini!`,
                            actionOnEnd: () => {
                                setLoadData(true);
                            },
                        });
                    }
                }
            } else if (
                command.includes('saya sekarang dimana') ||
                command.includes('saya sekarang di mana') ||
                command.includes('saya di mana') ||
                command.includes('saya dimana')
            ) {
                speechAction({
                    text: `Kita sedang di halaman rapot`,
                });
            }

            setTrancript(cleanCommand);
            console.log(cleanCommand);
        };
        recognition.onend = () => {
            recognition.start();
        };
    }, [router]);

    return (
        <div className='h-screen bg-primary-1'>
            <Navbar />
            <main style={{ height: 'calc(100vh - 90px)' }} className='w-screen bg-primary-1 pt-[90px] '>
                <section className='mx-auto grid max-w-screen-xl grid-cols-12 gap-[78px] '>
                    <div className='col-span-8 pt-[10px]'>
                        <div className='mb-[16px] flex items-center justify-between rounded-rad-7 bg-[#F5F5F5] py-[20px] '>
                            <div className='ml-[39px]'>
                                <h1 className='text-[32px] font-bold leading-[60px]'>Hallo, {userName}!</h1>
                                <p className='text-[16px]  leading-[20px]'>Senang bertemu denganmu lagi</p>
                            </div>
                            <Image alt='' src={'/images/avatar.svg'} width={117} height={159} className='mr-[95px]' />
                        </div>

                        <div style={{ height: 'calc(100vh - 324px)' }} className=''>
                            <div>
                                <h1 className='py-[16px] text-3xl font-bold text-white'>Semua Pembelajaran</h1>
                            </div>
                            <div style={{ height: 'calc(100vh - 394px)' }} className='flex flex-col gap-3 overflow-y-scroll'>
                                {totalPelajaran?.length
                                    ? totalPelajaran.map((rClass, idx) => (
                                          <div
                                              key={idx + 1}
                                              className='flex items-center justify-between rounded-rad-7 bg-[#F5F5F5] px-[24px] py-[14px]'>
                                              <div className='flex items-center gap-[34px]'>
                                                  <Image alt='' src={getImageFile(rClass.image)} width={54} height={54} />
                                                  <p className='text-[18px] font-bold leading-[24px]'>{rClass.name}</p>
                                              </div>
                                              <div className='flex items-center gap-[16px]'>
                                                  <div className='flex flex-col rounded-rad-3 bg-secondary-1 px-[21px] py-[8px]'>
                                                      <span className='text-[24px] font-bold text-white'>{rClass.max_poin}</span>
                                                      <span className='text-[12px] font-bold text-white '>Nilai</span>
                                                  </div>
                                                  <div className='flex flex-col rounded-rad-3 bg-secondary-1 px-[21px] py-[8px]'>
                                                      <span className='text-[24px] font-bold text-white '>{rClass.progress}</span>
                                                      <span className='text-[12px] font-bold text-white'>Progress</span>
                                                  </div>
                                                  {rClass.progress === '100%' ? (
                                                      //   <FillButton className=px-[58px] py-[18px] text-[24px]'>
                                                      //       Selesai'
                                                      //   </FillButton>
                                                      <BorderedButton className='border-primary-1 px-[58px] py-[18px] text-[24px] text-primary-1'>
                                                          Selesai
                                                      </BorderedButton>
                                                  ) : (
                                                      <FillButton className=' px-[58px] py-[18px] text-[24px]'>Lanjut</FillButton>
                                                  )}
                                              </div>
                                          </div>
                                      ))
                                    : null}
                            </div>
                        </div>
                    </div>
                    <div className='col-span-4 pt-[10px]'>
                        <div className='mb-[50px] flex justify-between gap-[30px]'>
                            <div className='rounded-rad-7 bg-secondary-1 px-[18px] py-[20px]'>
                                <h1 className='text-[48px] font-bold  leading-[60px] text-white'>{rataProgress}</h1>
                                <span className='font-bold text-white'>Rata Rata Progress</span>
                            </div>
                            <div className='rounded-rad-7 bg-secondary-1 px-[18px] py-[20px]'>
                                <h1 className='text-[48px] font-bold  leading-[60px] text-white'>{countFinishedClass}</h1>
                                <span className='font-bold text-white '>Kelas di selesaikan</span>
                            </div>
                        </div>
                        <div className='flex items-center justify-center gap-[77px] rounded-rad-7 bg-[#F5F5F5] px-[100px] py-[50px]'>
                            <div className='flex flex-col'>
                                <h1 className=' mb-[12px] text-[56px] font-bold leading-[60px] text-secondary-1'>{totalPoin}</h1>
                                <p className='font-bold'> poin</p>
                            </div>
                            <Image alt='' src={'/images/trophy.svg'} width={130} height={130} />
                        </div>
                    </div>
                </section>
            </main>
            <Transkrip transcript={transcript} />
        </div>
    );
};

export default Rapor;
