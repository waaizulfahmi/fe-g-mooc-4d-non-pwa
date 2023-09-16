export class ListMateri {
    constructor({ listMateri }) {
        this.listMateri = listMateri;
    }

    getList() {
        return this.listMateri;
    }

    getLengthList() {
        return this.listMateri.length;
    }

    getIdxMateriBerjalan() {
        return this.listMateri.findIndex((q) => q.status.toLowerCase() === 'jalan');
    }

    getMateriBerjalan() {
        return this.listMateri.find((m) => m.status === 'jalan');
    }

    getMateriByIdx(idx) {
        return this.listMateri.find((_, index) => index === idx);
    }

    getMateriSelesai() {
        return this.listMateri.filter((m) => m.status === 'selesai');
    }
}
