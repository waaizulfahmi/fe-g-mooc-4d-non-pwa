const SpeechRecognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition);

export const recognition = typeof window !== 'undefined' && new SpeechRecognition();

if (typeof window !== 'undefined') {
    recognition.lang = 'id';
}
