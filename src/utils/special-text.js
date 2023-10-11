// utils/textUtils.js
import { Stemmer } from 'sastrawijs';
import stopwordsIndonesia from '../data/ml/stopwords_indonesia.json';

export const punctuationRemoval = (text) => {
    // Menghapus URL
    text = text.replace(/https?:\/\/\S+|www\.\S+/gi, '');

    // Menghapus angka
    text = text.replace(/[-+]?[0-9]+/g, '');

    // Menghapus karakter non-alphanumerik dan non-spasi
    text = text.replace(/[^\w\s]/g, '');

    // Menghapus spasi di awal dan akhir
    text = text.trim();

    return text;
};
// Definisikan kata-kata yang perlu di-handle secara spesifik
const specialStemmingRules = {
    'di mana': 'dimana',
    dimana: 'mana',
    home: 'beranda',
    awal: 'beranda',
    utama: 'beranda',
    depan: 'beranda',
    course: 'kelas',
    raport: 'rapor',
    rapot: 'rapor',
    leaderboard: 'peringkat',
    'load ulang': 'refresh',
    perbarui: 'refresh',
    'muat ulang': 'refresh',
    reload: 'refresh',
    segarkan: 'refresh',
    // tambahkan aturan khusus lainnya di sini jika diperlukan
};

export const stemming = (text) => {
    const stemmer = new Stemmer();

    // Handle special cases
    Object.keys(specialStemmingRules).forEach((rule) => {
        text = text.replace(new RegExp(rule, 'gi'), specialStemmingRules[rule]);
    });

    // Gunakan Sastrawi untuk stemming sisa kata-kata
    text = stemmer.stem(text);

    return text;
};

export const removeStopwords = (text) => {
    // Memecah teks menjadi array kata
    const words = text.split(' ');

    // Menghapus stopword dari array kata
    const filteredWords = words.filter((word) => !stopwordsIndonesia.includes(word.toLowerCase()));

    // Menggabungkan array kata yang tersaring kembali menjadi teks
    const filteredText = filteredWords.join(' ');

    return filteredText;
};
