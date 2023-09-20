export const synth = typeof window !== 'undefined' && window.speechSynthesis;

export const speech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id';
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 2;
    return utterance;
};

export const speechAction = ({ text, actionOnStart, actionOnEnd }) => {
    const utterance = speech(text);

    if (actionOnStart && typeof actionOnStart === 'function') {
        utterance.onstart = () => {
            actionOnStart();
        };
    }

    if (actionOnEnd && typeof actionOnEnd === 'function') {
        utterance.onend = () => {
            actionOnEnd();
        };
    }
    synth.speak(utterance);
};
