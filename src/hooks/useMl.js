import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function useMl() {
    const [model, setModel] = useState(null);
    const [vocab, setVocab] = useState(null);
    const [labelEncoder, setLabelEncoder] = useState(null);

    const loadModel = async () => {
        try {
            const loadedModel = await tf.loadLayersModel('/model.json');
            setModel(loadedModel);
        } catch (error) {
            console.error('Gagal memuat model:', error.message);
        }
    };

    // Fungsi untuk memuat vocab.json
    const loadVocab = async () => {
        try {
            const response = await fetch('/vocab.json');
            const data = await response.json();
            setVocab(data);
        } catch (error) {
            console.error('Gagal memuat vocab:', error.message);
        }
    };

    // Fungsi untuk memuat label_encoder.json
    const loadLabelEncoder = async () => {
        try {
            const response = await fetch('/label_encoder.json');
            const data = await response.json();
            setLabelEncoder(data);
        } catch (error) {
            console.error('Gagal memuat label encoder:', error.message);
        }
    };

    useEffect(() => {
        loadModel();
        loadVocab();
        loadLabelEncoder();
    }, []);

    return { model, vocab, labelEncoder };
}
