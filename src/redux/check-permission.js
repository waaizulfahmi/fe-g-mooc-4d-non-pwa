import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isPermit: false,
    isPause: false,
    isTranscriptOn: false,
    microphoneStatus: 'denied', // granted, denied, prompt
    cameraStatus: 'denied', // granted, denied, prompt
};

export const checkPermissionSlice = createSlice({
    name: 'check-permission',
    initialState,
    reducers: {
        setIsPermit: (state, action) => {
            state.isPermit = action.payload;
        },
        setIsPause: (state, action) => {
            state.isPause = action.payload;
        },
        setMicrophoneStatus: (state, action) => {
            state.microphoneStatus = action.payload;
        },
        setCameraStatus: (state, action) => {
            state.cameraStatus = action.payload;
        },
        setTanscriptOn: (state, action) => {
            state.isTranscriptOn = action.payload;
        },
    },
});

export const getIsPermit = (state) => state.checkPermission.isPermit;
export const getIsPause = (state) => state.checkPermission.isPause;
export const getIsTranscriptOn = (state) => state.checkPermission.isTranscriptOn;
export const getMicrophoneStatus = (state) => state.checkPermission.microphoneStatus;
export const getCameraStatus = (state) => state.checkPermission.cameraStatus;

export default checkPermissionSlice.reducer;
