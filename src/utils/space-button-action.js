export const buttonAction = ({ event, key, keyCode = null, action }) => {
    if (typeof window !== 'undefined') {
        if (keyCode !== null) {
            if (event.keyCode === keyCode || event.key === key) {
                if (action && typeof action === 'function') {
                    action();
                }
            }
        } else {
            if (event.key === key) {
                if (action && typeof action === 'function') {
                    action();
                }
            }
        }
    }
};
