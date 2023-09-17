import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isPermit: false,
    isTranscriptOn: false,
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
        setTanscriptOn: (state, action) => {
            state.isTranscriptOn = action.payload;
        },
    },
});

export const getIsPermit = (state) => state.checkPermission.isPermit;
export const getIsTranscriptOn = (state) => state.checkPermission.isTranscriptOn;
export const getMicrophoneStatus = (state) => state.checkPermission.microphoneStatus;

export default checkPermissionSlice.reducer;
