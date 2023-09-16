export const convertStringToNum = (str) => {
    if (str === 'satu' || str === '1') {
        return 1;
    } else if (str === 'dua' || str === '2') {
        return 2;
    } else if (str === 'tiga' || str === '3') {
        return 3;
    } else if (str === 'empat' || str === '4') {
        return 4;
    } else if (str === 'lima' || str === '5') {
        return 5;
    } else if (str === 'enam' || str === '6') {
        return 6;
    } else if (str === 'tujuh' || str === '7') {
        return 7;
    } else if (str === 'delapan' || str === '8') {
        return 8;
    } else if (str === 'sembilan' || str === '9') {
        return 9;
    } else if (str === 'sepuluh' || str === '10') {
        return 10;
    }

    return null;
};
