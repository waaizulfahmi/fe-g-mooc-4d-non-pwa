export const buttonAction = ({ event, key, keyCode = null, action }) => {
    if (typeof window !== 'undefined') {
        if (event instanceof Event) {
            if (!keyCode) {
                if (event.key === key) {
                    if (action && typeof action === 'function') {
                        action();
                    }
                }
            } else {
                if (event.keyCode === keyCode || event.key === key) {
                    if (action && typeof action === 'function') {
                        action();
                    }
                }
            }
        }
    }
};
