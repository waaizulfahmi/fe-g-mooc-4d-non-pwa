import axios from 'axios';

export const apiInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URl,
    withCredentials: true,
});

export const apiMlInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_ML_URl,
});

export const sanctumApiInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URl_SANCTUM,
    withCredentials: true,
});
