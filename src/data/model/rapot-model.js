export class Rapot {
    constructor({ totalPoin, rataProgress, nilai, kelasSelesai, kelasProgress, jumlahSelesai }) {
        this.totalPoin = totalPoin;
        this.rataProgress = rataProgress;
        this.nilai = nilai;
        this.kelasSelesai = kelasSelesai;
        this.kelasProgress = kelasProgress;
        this.jumlahSelesai = jumlahSelesai;
    }

    getTotalPoin() {
        return this.totalPoin;
    }
    getRataProgress() {
        return this.rataProgress;
    }
    getNilai() {
        return this.nilai;
    }
    getKelasSelesai() {
        return this.kelasSelesai;
    }
    getKelasProgress() {
        return this.kelasProgress;
    }
    getJumlahSelesai() {
        return this.jumlahSelesai;
    }

    getSemuaPelajaran() {
        const semuaPelajaran = [...this.kelasProgress, ...this.kelasSelesai];
        return semuaPelajaran;
    }
}
