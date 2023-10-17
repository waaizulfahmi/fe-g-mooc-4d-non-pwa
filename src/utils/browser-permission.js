export const browserPermission = async (type, callback) => {
    if (typeof window !== 'undefined') {
        try {
            const permitObj = {};
            const typeOfPermission = type === 'camera' || type === 'microphone';
            if (!typeOfPermission) {
                permitObj.state = '';
                permitObj.error = 'Perizinan hanya untuk camera atau microhone';
                callback(permitObj);
            } else {
                const permitState = await navigator.permissions.query({ name: type });
                if (permitState.state === 'granted') {
                    permitObj.state = permitState.state;
                    permitObj.error = '';
                    callback(permitObj);
                } else if (permitState.state === 'prompt') {
                    permitObj.state = permitState.state;
                    permitObj.error = '';
                    callback(permitObj);
                } else if (permitState.state === 'denied') {
                    permitObj.state = permitState.state;
                    permitObj.error = '';
                    callback(permitObj);
                }
                permitState.onchange = () => {
                    permitObj.state = permitState.state;
                    permitObj.error = '';
                    callback(permitObj);
                };
            }
        } catch (error) {
            callback({
                state: '',
                error: error.message,
            });
            console.log(error.message);
        }
    }
};
