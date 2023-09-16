import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isPermit: false,
    microphoneStatus: 'denied', // granted, denied, prompt
};

export const checkPermissionSlice = createSlice({
    name: 'check-permission',
    initialState,
    reducers: {
        setIsPermit: (state, action) => {
            state.isPermit = action.payload;
        },
        setMicrophoneStatus: (state, action) => {
            state.microphoneStatus = action.payload;
        },
    },
});

export const getIsPermit = (state) => state.checkPermission.isPermit;
export const getMicrophoneStatus = (state) => state.checkPermission.microphoneStatus;

export default checkPermissionSlice.reducer;
