export class Kelas {
    constructor({ name, description, image, materi, quiz, progress, nilai, poin, status, id_enrollment, quiz_count }) {
        this.id_enrollment = id_enrollment;
        this.name = name;
        this.description = description;
        this.image = image;
        this.materi = materi;
        this.quiz = quiz;
        this.progress = progress;
        this.nilai = nilai;
        this.poin = poin;
        this.status = status;
        this.quiz_count = quiz_count;
    }

    getQuizCount() {
        return this.quiz_count;
    }

    getStatusKelas() {
        return this.status;
    }
    getIdxEnrollment() {
        return this.id_enrollment;
    }

    getProgress() {
        return this.progress;
    }

    getNilai() {
        return this.nilai;
    }

    getPoin() {
        return this.poin;
    }

    getName() {
        return this.name;
    }

    getDescription() {
        return this.description;
    }

    getImage() {
        return this.image;
    }
    getMateri() {
        return this.materi;
    }

    getQuiz(idx) {
        if (typeof idx === 'number') {
            return this.quiz[idx];
        }

        return this.quiz;
    }
    getQuizLength() {
        return this.quiz.length;
    }

    getMateriLength() {
        return this.materi.length;
    }

    firstPlaybackMateri() {
        return Number(this.materi[0].playback);
    }

    firstStatusQuiz() {
        return this.quiz[0].status;
    }

    isQuizEnded() {
        return this.quiz[this.quiz.length - 1].status === 'selesai';
    }

    idxQuizBerjalan() {
        return this.quiz.findIndex((mt) => mt.status === 'jalan');
    }

    materiBerjalan() {
        return this.materi.find((mt) => mt.status === 'jalan');
    }

    idxMateriBerjalan() {
        return this.materi.findIndex((mt) => mt.status === 'jalan');
    }

    lastMateri(selectedData) {
        const lastMateri = this.materi[this.materi.length - 1];
        switch (selectedData) {
            case 'id_kelas':
                return Number(lastMateri.id_kelas);
            case 'id_materi':
                return Number(lastMateri.id_materi);
            case 'id_materi_history':
                return Number(lastMateri.id_materi_history);
            case 'name':
                return lastMateri.name;
            case 'status':
                return lastMateri.status;
            case 'poin':
                return lastMateri.poin;
            case 'materi':
                return lastMateri.materi;
            case 'url':
                return lastMateri.url;
            case 'playback':
                return Number(lastMateri.playback);
            default:
                return lastMateri;
        }
    }
}
