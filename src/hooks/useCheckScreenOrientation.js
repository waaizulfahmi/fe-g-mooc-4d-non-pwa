/* eslint-disable no-useless-escape */
import { useEffect, useState } from 'react';

function getWindowSize() {
    const { innerWidth, innerHeight } = window;
    return { innerWidth, innerHeight };
}

export default function useCheckScreenOrientation() {
    const [windowSize, setWindowSize] = useState(getWindowSize());
    // const [isMobile, setIsMobile] = useState(null);

    useEffect(() => {
        function handleWindowResize() {
            setWindowSize(getWindowSize());
        }

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return { windowSize };
}
