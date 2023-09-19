export const convertStringToNum = (str) => {
    if (str === 'satu' || str === '1' || str === 'kesatu' || str === 'ke satu' || str === 'ke-satu') {
        return 1;
    } else if (str === 'dua' || str === '2' || str === 'kedua' || str === 'ke dua' || str === 'ke-dua') {
        return 2;
    } else if (str === 'tiga' || str === '3' || str === 'ketiga' || str === 'ke tiga' || str === 'ke-tiga') {
        return 3;
    } else if (str === 'empat' || str === '4' || str === 'keempat' || str === 'ke empat' || str === 'ke-empat') {
        return 4;
    } else if (str === 'lima' || str === '5' || str === 'kelima' || str === 'ke lima' || str === 'ke-lima') {
        return 5;
    } else if (str === 'enam' || str === '6' || str === 'keenam' || str === 'ke enam' || str === 'ke-enam') {
        return 6;
    } else if (str === 'tujuh' || str === '7' || str === 'ketujuh' || str === 'ke tujuh' || str === 'ke-tujuh') {
        return 7;
    } else if (str === 'delapan' || str === '8' || str === 'kedelapan' || str === 'ke delapan' || str === 'ke-delapan') {
        return 8;
    } else if (str === 'sembilan' || str === '9' || str === 'kesembilan' || str === 'ke sembilan' || str === 'ke-sembilan') {
        return 9;
    } else if (str === 'sepuluh' || str === '10' || str === 'kesepuluh' || str === 'ke sepuluh' || str === 'ke-sepuluh') {
        return 10;
    }

    return null;
};
