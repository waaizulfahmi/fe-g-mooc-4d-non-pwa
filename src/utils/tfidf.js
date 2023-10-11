// tfidfUtils.js

// Fungsi untuk menghitung Term Frequency (TF)
export function calculateTF(word, document) {
    const words = document.split(' ');
    const wordCount = words.length;
    const termCount = words.filter((w) => w === word).length;
    return termCount / wordCount;
}

// Fungsi untuk menghitung Inverse Document Frequency (IDF)
export function calculateIDF(word, documents) {
    const documentCount = documents.length;
    const documentWithTermCount = documents.filter((doc) => doc.split(' ').includes(word)).length;
    return Math.log(documentCount / (1 + documentWithTermCount));
}

// Fungsi untuk menghitung TF-IDF
export function calculateTFIDF(word, document, documents) {
    const tf = calculateTF(word, document);
    const idf = calculateIDF(word, documents);
    return tf * idf;
}

// Fungsi untuk menghitung TF-IDF dengan bobot khusus
export function calculateTFIDFWithWeights(word, document, documents, weights) {
    const tf = calculateTF(word, document);
    const idf = calculateIDF(word, Object.keys(weights));
    return tf * idf * (weights[word] || 1);
}
