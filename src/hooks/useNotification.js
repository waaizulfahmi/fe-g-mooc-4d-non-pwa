'use client';
import { useState } from 'react';

const useNotification = (time = 2000) => {
    const [isVisible, setVisible] = useState(false);
    const [text, setText] = useState('');
    const [type, setType] = useState('');

    const handleNotifVisible = (visibleArgs) => {
        if (!visibleArgs || typeof visibleArgs !== 'boolean') {
            setVisible(!isVisible);
            return;
        }
        setVisible(visibleArgs);
    };

    const handleNotifAction = (type, text) => {
        setType(type);
        setText(text);
        setVisible(true);
    };

    const notifData = {
        time,
        isVisible,
        text,
        type,
    };

    return { notifData, handleNotifAction, handleNotifVisible };
};

export default useNotification;
