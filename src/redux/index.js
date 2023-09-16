/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import checkPermissionSlice from './check-permission';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';

//noop storage for SSR
const createNoopStorage = () => {
    return {
        getItem(_key) {
            return Promise.resolve(null);
        },
        setItem(_key, value) {
            return Promise.resolve(value);
        },
        removeItem(_key) {
            return Promise.resolve();
        },
    };
};

//storage configure
const storage = typeof window !== 'undefined' ? createWebStorage('session') : createNoopStorage();

//config for persist
const persistConfig = {
    key: 'g-mooc-4d',
    storage,
};

const rootReducer = combineReducers({
    checkPermission: checkPermissionSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    devTools: process.env.NODE_ENV !== 'production',
    reducer: persistedReducer,
    middleware: [thunk],
});

export const persistor = persistStore(store);
