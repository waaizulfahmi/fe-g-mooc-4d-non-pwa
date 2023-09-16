export class ListQuiz {
    constructor({ listQuiz }) {
        this.listQuiz = listQuiz;
    }

    getIdxQuizBerjalan() {
        return this.listQuiz.findIndex((q) => q.status.toLowerCase() === 'jalan');
    }
}
