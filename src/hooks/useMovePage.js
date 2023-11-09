import { useRouter } from 'next/navigation';
// import { useSelector } from 'react-redux';
// import { getIsCheckLightHouseMode } from '@/redux/check-permission';

const useMovePage = (sessioName) => {
    const router = useRouter();
    // const isCheckLightHouseMode = useSelector(getIsCheckLightHouseMode);

    const handleMovePage = (link, type = 'push', isScroll = true) => {
        // if (!isCheckLightHouseMode) {
        //     sessionStorage.removeItem(sessioName);
        //     if (sessionStorage.getItem(sessioName) == null) {
        //         if (type === 'push') {
        //             router.push(link, { scroll: isScroll });
        //         } else if (type === 'replace') {
        //             router.replace(link, { scroll: isScroll });
        //         }
        //     }
        // } else {
        //     console.log('NOW checking lightouse mode');
        //     if (type === 'push') {
        //         router.push(link, { scroll: isScroll });
        //     } else if (type === 'replace') {
        //         router.replace(link, { scroll: isScroll });
        //     }
        // }
        sessionStorage.removeItem(sessioName);
        if (sessionStorage.getItem(sessioName) == null) {
            if (type === 'push') {
                router.push(link, { scroll: isScroll });
            } else if (type === 'replace') {
                router.replace(link, { scroll: isScroll });
            }
        }
    };

    return { handleMovePage };
};

export default useMovePage;
