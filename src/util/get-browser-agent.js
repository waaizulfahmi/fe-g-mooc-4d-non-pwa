export const browserAgent = () => {
    if (typeof window !== 'undefined') {
        const browserName = (function (agent) {
            switch (true) {
                case agent.indexOf('edge') > -1:
                    return 'edge';
                case agent.indexOf('edg/') > -1:
                    return 'edge';
                case agent.indexOf('opr') > -1 && !!window.opr:
                    return 'opera';
                case agent.indexOf('chrome') > -1 && !!window.chrome:
                    return 'chrome';
                case agent.indexOf('trident') > -1:
                    return 'msie';
                case agent.indexOf('firefox') > -1:
                    return 'firefox';
                case agent.indexOf('safari') > -1:
                    return 'safari';
                default:
                    return 'other';
            }
        })(window.navigator.userAgent.toLowerCase());

        return browserName;
    }
};
