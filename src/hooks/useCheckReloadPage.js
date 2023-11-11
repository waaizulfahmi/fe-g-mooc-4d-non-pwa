'use client';
import { useEffect } from 'react';
// redux
import { useDispatch } from 'react-redux';
import { checkPermissionSlice } from '@/redux/check-permission';

const useCheckReloadPage = ({ name = '' }) => {
    const dispatch = useDispatch();
    const { setIsPermit } = checkPermissionSlice.actions;
    const sessioName = name;

    useEffect(() => {
        if (sessionStorage.getItem(name) != null) {
            dispatch(setIsPermit(false));
            sessionStorage.removeItem(name);
        } else {
            console.log('page main was not reloaded');
        }

        sessionStorage.setItem(name, 'yes'); // could be anything
    }, [name, dispatch, setIsPermit]);

    return { sessioName };
};

export default useCheckReloadPage;
