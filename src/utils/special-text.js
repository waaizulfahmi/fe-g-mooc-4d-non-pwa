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
    a: 'aaa',
    b: 'bbb',
    c: 'ccc',
    // 'halaman beranda': '',
    'pergi beranda': 'beranda',
    'pergi kelas': 'kelas',
    'pergi rapor': 'rapor',
    'pergi peringkat': 'peringkat',
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
    hentikan: 'henti',
    berjalan: 'jalan',
    ulangi: 'ulang',
    pertanyaan: 'tanya',
    merefresh: 'refresh',
    sebutkan: 'sebut',
    jelaskan: 'jelas',
    // tambahkan aturan khusus lainnya di sini jika diperlukan
};

export const stemming = (text) => {
    const stemmer = new Stemmer();

    // Handle special cases
    Object.keys(specialStemmingRules).forEach((rule) => {
        const regex = new RegExp(`\\b${rule}\\b`, 'gi');
        text = text.replace(regex, specialStemmingRules[rule]);
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
