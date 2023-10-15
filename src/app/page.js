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

// third party
import { useSession } from 'next-auth/react';
import * as tf from '@tensorflow/tfjs';

// redux
import { useSelector } from 'react-redux';
import { getIsPermit } from '@/redux/check-permission';

// components
import Navbar from '@/components/Navbar';
import CheckPermission from '@/components/CheckPermission';
import Transkrip from '@/components/Transkrip';
import Hero from '@/components/Hero';

// datas
// ---

// apis
// ---

// utils
import { speechAction, speechWithBatch, stopSpeech } from '@/utils/text-to-speech';
import { recognition } from '@/utils/speech-recognition';
import { buttonAction } from '@/utils/space-button-action';
import { punctuationRemoval, stemming, removeStopwords } from '@/utils/special-text';
import { calculateTFIDFWithWeights } from '@/utils/tfidf';

export default function Beranda() {
    const router = useRouter();
    const { data } = useSession();
    const userName = data?.user?.name;
    const isPermit = useSelector(getIsPermit);

    // COMMON STATE
    // --

    // TENSORFLOW STATE
    const [model, setModel] = useState(null);
    const [vocab, setVocab] = useState(null);
    const [labelEncoder, setLabelEncoder] = useState(null);

    // ACCESSIBILITY STATE
    const [speechOn, setSpeechOn] = useState(false); // state untuk  speech recognition
    const [transcript, setTrancript] = useState(''); // state untuk menyimpan transcript hasil speech recognition
    const [skipSpeech, setSkipSpeech] = useState(false); // state untuk  mengatasi speech recogniton ter-trigger
    const [displayTranscript, setDisplayTranscript] = useState(false); // state untuk  menampilkan transcript
    const [isClickButton, setIsClickButton] = useState(false); // state untuk aksi tombol
    const [isPlayIntruction, setIsPlayIntruction] = useState(false); // state  ketika intruksi berjalan

    // FUNCTION
    // Fungsi untuk memuat model
    const loadModel = async () => {
        try {
            const loadedModel = await tf.loadLayersModel('/model.json');
            setModel(loadedModel);
        } catch (error) {
            console.error('Gagal memuat model:', error);
        }
    };

    // Fungsi untuk memuat vocab.json
    const loadVocab = async () => {
        try {
            const response = await fetch('/vocab.json');
            const data = await response.json();
            setVocab(data);
        } catch (error) {
            console.error('Gagal memuat vocab:', error);
        }
    };

    // Fungsi untuk memuat label_encoder.json
    const loadLabelEncoder = async () => {
        try {
            const response = await fetch('/label_encoder.json');
            const data = await response.json();
            setLabelEncoder(data);
        } catch (error) {
            console.error('Gagal memuat label encoder:', error);
        }
    };

    // EFFECTS
    // init speech recognition
    useEffect(() => {
        try {
            recognition.start();
        } catch (error) {
            recognition.stop();
        }
    }, []);

    useEffect(() => {
        if (userName) {
            if (isPermit) {
                loadModel();
                loadVocab();
                loadLabelEncoder();
                speechWithBatch({
                    speechs: [
                        {
                            text: `Selamat datang di ji muk fordi, ${userName}`,
                            actionOnStart: () => {
                                setSkipSpeech(true);
                            },
                        },
                        {
                            text: 'Perkenalkan saya Uli, saya akan memandu Anda untuk belajar. ucapkan hai atau hello uli agar saya dapat mendengar Anda',
                        },
                        {
                            text: `Halaman ini adalah halaman beranda, pada halaman ini merupakan halaman  pertama kali ketika Anda menggunakan aplikasi.`,
                        },
                        {
                            text: 'Pada halaman ini terdapat berbagai perintah untuk pergi ke halaman lain, contohnya halaman kelas, raport, dan peringkat.',
                        },
                        {
                            text: 'Untuk masuk halaman tersebut Anda bisa mengucapkan pergi ke halaman yang Anda tuju, misalnya, pergi ke kelas',
                        },
                        {
                            text: 'Jangan lupa ucapkan hi Uli atau hallo uli agar saya bisa mendengar Anda. Jika tidak ada perintah apapun saya akan diam dalam 10 detik.',
                        },
                        {
                            text: `Saya juga akan diam, jika perintah sudah dilakukan. Tapi Anda jangan khawatir, panggil saja saya lagi dengan hi Uli atau hallo uli agar saya dapat mendengar Anda.`,
                        },
                        {
                            text: 'Satu lagi, Anda wajib menunggu saya berbicara sampai selesai, agar saya bisa mendengar Anda kembali',
                        },
                        {
                            text: 'Jika Anda masih bingung, Anda bisa ucapkan intruksi agar mendapatkan penjelasan lebih banyak.',
                            actionOnEnd: () => {
                                setIsClickButton(true); // ketika sampai akhir button seolah sudah terclick
                                setSkipSpeech(false);
                            },
                        },
                    ],
                });
            }
        }
    }, [userName, isPermit]);

    useEffect(() => {
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            const cleanCommand = command?.replace('.', '');
            console.log(cleanCommand);

            if (speechOn && !skipSpeech) {
                const removePunctuationWords = punctuationRemoval(cleanCommand);
                const stemmingWords = stemming(removePunctuationWords);
                const removedStopWords = removeStopwords(stemmingWords);
                console.log({
                    removePunc: removePunctuationWords,
                    stem: stemmingWords,
                    removeStop: removedStopWords,
                });

                // Memastikan model dan vocab dimuat sebelum melakukan prediksi
                if (!model || !vocab || !labelEncoder) {
                    console.error('Model, vocab, label encoder  belum dimuat.');
                } else {
                    // Hitung TF-IDF untuk setiap kata dalam inputText dengan bobot dari vocab
                    const tfidfResults = Object.keys(vocab).map((word) => {
                        return {
                            word: word,
                            tfidf: calculateTFIDFWithWeights(word, removedStopWords, [removedStopWords], vocab),
                        };
                    });

                    // Menyusun ulang hasil untuk menyimpan nilai TF-IDF dalam bentuk array
                    const orderedResults = tfidfResults.map((result) => result.tfidf);

                    const inputArray = [orderedResults]; // Sesuaikan dengan bentuk input model
                    const inputTensor = tf.tensor2d(inputArray);
                    const prediction = model.predict(inputTensor);
                    const result = prediction.dataSync();

                    // Temukan indeks kelas dengan nilai tertinggi
                    const predictedClassIndex = result.indexOf(Math.max(...result));
                    const checkValueOfResult = orderedResults.reduce((curr, prev) => curr + prev, 0);

                    // skipping prediction
                    if (cleanCommand.includes('pergi')) {
                        if (cleanCommand.includes('peringkat')) {
                            setTrancript('pergi peringkat');
                            setSpeechOn(false);
                            speechAction({
                                text: 'Anda akan menuju halaman Peringkat',
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                    router.push('/peringkat');
                                },
                            });
                        }
                    } else if (cleanCommand.includes('jelaskan')) {
                        if (cleanCommand.includes('intruksi') || cleanCommand.includes('instruksi')) {
                            setTrancript('jelaskan instruksi');
                            setSpeechOn(false);
                            setIsClickButton(false);
                            setIsPlayIntruction(true);
                            speechWithBatch({
                                speechs: [
                                    {
                                        text: `Hai ${userName}, sekarang Anda mendengarkan intruksi di halaman beranda.`,
                                        actionOnStart: () => {
                                            setSkipSpeech(true);
                                        },
                                        actionOnEnd: () => {
                                            setDisplayTranscript(false);
                                        },
                                    },
                                    {
                                        text: `Jika Anda tersesat, Anda dapat mengucapkan saya dimana`,
                                    },
                                    {
                                        text: `Untuk navigasi halaman, Anda dapat mengucapkan pergi ke halaman yang Anda tuju, misalnya pergi ke kelas, pada halaman ini Anda dapat pergi ke halaman kelas, raport, dan peringkat`,
                                    },
                                    {
                                        text: `jangan lupa, Anda harus ucapkan terlebih dahulu hi Uli atau hallo uli agar saya dapat mendengar Anda. Jika tidak ada perintah apapun saya akan diam dalam 10 detik.`,
                                        actionOnEnd: () => {
                                            setSkipSpeech(false);
                                            setIsPlayIntruction(false);
                                        },
                                    },
                                ],
                            });
                        }
                    }

                    // prediction
                    if (checkValueOfResult !== 0) {
                        const predictedCommand = labelEncoder[predictedClassIndex];
                        console.log('Check value result: ', checkValueOfResult);
                        console.log('Predicted command : ', predictedCommand);
                        if (predictedCommand.includes('pergi')) {
                            if (predictedCommand.includes('kelas')) {
                                setTrancript(predictedCommand);
                                setSpeechOn(false);
                                speechAction({
                                    text: 'Anda akan menuju halaman Daftar Kelas',
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                        router.push('/kelas');
                                    },
                                });
                            } else if (predictedCommand.includes('rapor')) {
                                setTrancript(predictedCommand);
                                setSpeechOn(false);
                                speechAction({
                                    text: 'Anda akan menuju halaman Rapor',
                                    actionOnEnd: () => {
                                        setDisplayTranscript(false);
                                        router.push('/rapor');
                                    },
                                });
                            }
                        } else if (
                            predictedCommand.includes('saya sekarang dimana') ||
                            predictedCommand.includes('saya sekarang di mana') ||
                            predictedCommand.includes('saya di mana') ||
                            predictedCommand.includes('saya dimana')
                        ) {
                            setTrancript(predictedCommand);
                            setSpeechOn(false);
                            speechAction({
                                text: `Kita sedang di halaman utama`,
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                },
                            });
                        } else if (predictedCommand.includes('muat')) {
                            if (predictedCommand.includes('ulang')) {
                                if (predictedCommand.includes('halaman')) {
                                    setTrancript(predictedCommand);
                                    setSpeechOn(false);
                                    speechAction({
                                        text: `Anda akan load ulang halaman!`,
                                        actionOnEnd: () => {
                                            setIsClickButton(false);
                                            setDisplayTranscript(false);
                                        },
                                    });
                                }
                            }
                        }
                    } else {
                        // USE CASE IF DYNAMIC SPEECH
                        if (
                            cleanCommand.includes('pergi peringkat') ||
                            cleanCommand.includes('pergi ke peringkat') ||
                            cleanCommand.includes('jelaskan intruksi') ||
                            cleanCommand.includes('jelaskan instruksi')
                        ) {
                            return;
                        }
                        setTrancript('Perintah tidak ditemukan di halaman ini!');
                        setSpeechOn(false);
                        speechAction({
                            text: 'Perintah tidak ditemukan di halaman ini!',
                            actionOnEnd: () => {
                                setDisplayTranscript(false);
                            },
                        });
                    }
                }
            }

            if (!skipSpeech) {
                if (cleanCommand.includes('hallo') || cleanCommand.includes('halo') || cleanCommand.includes('hai')) {
                    if (cleanCommand.includes('uli')) {
                        setTrancript(cleanCommand);
                        stopSpeech();
                        speechAction({
                            text: `Hai ${userName}, saya mendengarkan Anda!`,
                            actionOnStart: () => {
                                setDisplayTranscript(true);
                            },
                            actionOnEnd: () => {
                                setSpeechOn(true);
                            },
                        });
                    }
                }
            }
        };

        recognition.onend = () => {
            recognition.start();
        };

        console.log('TRIGGER CONDITION: ', speechOn);

        if (speechOn) {
            const timer = setTimeout(() => {
                speechAction({
                    text: 'saya diam',
                    actionOnEnd: () => {
                        console.log('speech diclear');
                        setDisplayTranscript(false);
                        setSpeechOn(false);
                    },
                });
            }, 10000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [router, speechOn, userName, skipSpeech, labelEncoder, model, vocab]);

    //effects
    useEffect(() => {
        const spaceButtonIntroAction = (event) => {
            buttonAction({
                event: event,
                key: ' ',
                keyCode: 32,
                action: () => {
                    if (!isClickButton && isPermit) {
                        setSpeechOn(false);
                        stopSpeech();
                        if (isPlayIntruction) {
                            speechAction({
                                text: 'Anda mematikan intruksi',
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                    setSkipSpeech(false);
                                    setIsClickButton(true);
                                    setIsPlayIntruction(false); // skipping intruksi
                                },
                            });
                        } else {
                            speechAction({
                                text: 'Anda melewati Intro Halaman',
                                actionOnEnd: () => {
                                    setDisplayTranscript(false);
                                    setSkipSpeech(false);
                                    setIsClickButton(true);
                                },
                            });
                        }
                    }
                },
            });
        };
        window.addEventListener('keydown', spaceButtonIntroAction);

        return () => {
            window.removeEventListener('keydown', spaceButtonIntroAction);
        };
    }, [isClickButton, isPermit, isPlayIntruction]);

    return (
        <main className='h-screen'>
            <Navbar />
            <Hero />
            <Transkrip transcript={transcript} isTrigger={displayTranscript} />
            <CheckPermission />
        </main>
    );
}
