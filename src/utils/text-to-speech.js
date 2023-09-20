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

export const speechWithBatch = ({ speechs }) => {
    for (let i = 0; i < speechs.length; i++) {
        // const lastSpeechIdx = speechs.length - 1;
        const text = speechs[i]?.text;

        if (
            speechs[i]?.actionOnStart &&
            speechs[i]?.actionOnEnd &&
            typeof speechs[i]?.actionOnStart === 'function' &&
            typeof speechs[i]?.actionOnEnd === 'function'
        ) {
            const utterance = speech(text);
            utterance.onstart = () => {
                speechs[i]?.actionOnStart();
            };
            utterance.onend = () => {
                speechs[i]?.actionOnEnd();
            };
            synth.speak(utterance);
        } else if (speechs[i]?.actionOnStart && typeof speechs[i]?.actionOnStart === 'function') {
            const utterance = speech(text);
            utterance.onstart = () => {
                speechs[i]?.actionOnStart();
            };
            synth.speak(utterance);
        } else if (speechs[i]?.actionOnEnd && typeof speechs[i]?.actionOnEnd === 'function') {
            const utterance = speech(text);
            utterance.onend = () => {
                speechs[i]?.actionOnEnd();
            };
            synth.speak(utterance);
        } else {
            const utterance = speech(text);
            synth.speak(utterance);
        }
    }
};
