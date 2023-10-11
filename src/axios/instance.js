import axios from 'axios';

const BASE_URl = 'https://nurz.site/api';
// const BASE_ML_URl = 'https://face.nurz.site';
const BASE_ML_URl = 'http://127.0.0.1:5000';

const BASE_URl_SANCTUM = 'https://nurz.site/sanctum/csrf-cookie';

export const apiInstance = axios.create({
    baseURL: BASE_URl,
    withCredentials: true,
});

export const apiMlInstance = axios.create({
    baseURL: BASE_ML_URl,
});

export const sanctumApiInstance = axios.create({
    baseURL: BASE_URl_SANCTUM,
    withCredentials: true,
});
