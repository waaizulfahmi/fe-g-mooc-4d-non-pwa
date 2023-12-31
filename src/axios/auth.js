import axios, { AxiosError } from 'axios';
import { apiInstance, apiMlInstance, sanctumApiInstance } from './instance';
import { ApiResponseError } from '@/utils/error-handling';
import * as https from 'https';
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

/* 
@ROUTE : /register 
*/
export const authRegister = async ({ name, email, password, konfirmasi_password, images, host, faceMode = true }) => {
    try {
        if (!name && !email && !password && !konfirmasi_password && !host) throw new Error('Please insert all input form!');
        if (!password) throw new Error('Password must be submitted!');
        if (!konfirmasi_password) throw new Error('Konfirmasi Password must be submitted!');
        if (!password !== !konfirmasi_password) throw new Error('Password & Konfirmasi Password must same!');
        if (!name) throw new Error('Name must be submitted!');
        if (!email) throw new Error('Email must be submitted!');
        if (!host) throw new Error('Host must be submitted!');
        if (!images) throw new Error('images must be submitted!');

        if (!faceMode) {
            await sanctumApiInstance.get();
        }

        const response = await apiMlInstance.post(
            '/register',
            {
                name,
                email,
                password,
                konfirmasi_password,
                images,
                host,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorMsg = error?.response?.data?.metadata?.message;
            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

/* 
@ROUTE : /login 
*/
export const authLogin = async ({ email, password }) => {
    try {
        if (!email && !password) throw new Error('Email & Password must be submitted!');
        if (!email) throw new Error('Email must be submitted!');
        if (!password) throw new Error('Password must be submitted!');

        const response = await apiInstance.post(
            '/login',
            {
                email,
                password,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorMsg = error?.response?.data?.metadata?.message;
            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

/* 
@ROUTE : /login-face 
*/

export const authLoginWithFace = async ({ image }) => {
    try {
        if (!image) throw Error('Image must submitted!');

        const response = await apiMlInstance.post(
            '/login-face',
            {
                image,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                httpsAgent,
            },
        );
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorMsg = error?.response?.data?.metadata?.message;
            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
    }
};

/* 
@ROUTE : /logout 
*/
export const authLogout = async ({ token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        const response = await apiInstance.get('/logout', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorMsg = error?.response?.data?.metadata?.message;
            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

/* 
@ROUTE : /verify 
*/
export const authVerify = async ({ url }) => {
    try {
        if (!url) throw new Error('url must be submitted!');
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorMsg = error?.response?.data?.metadata?.message;
            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

/* 
@ROUTE : /email/verification-notification
*/
export const authResendVerify = async ({ token, host }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!host) throw new Error('Host must be submitted!');

        const response = await apiInstance.post(
            '/email/verification-notification',
            {
                host,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorMsg = error?.response?.data?.metadata?.message;
            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

/* 
@ROUTE : '/forgot-password'
*/
export const authForgotPassword = async ({ email, host }) => {
    try {
        if (!email) throw new Error('Email must be submitted!');
        if (!host) throw new Error('Host must be submitted!');

        const response = await apiInstance.post(
            '/forgot-password',
            {
                email,
                host: `${host}/reset-password`,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorMsg = error?.response?.data?.metadata?.message;
            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

/* 
@ROUTE : '/reset-password'
*/
export const authResetPassword = async ({ email, password, password_confirmation, token }) => {
    try {
        if (!password) throw new Error('Password must be submitted!');
        if (!password_confirmation) throw new Error('Password Confirmation must be submitted!');
        if (!password !== !password_confirmation) throw new Error('Password & Password Confirmation must same!');
        if (!email) throw new Error('Email must be submitted!');
        if (!token) throw new Error('token must be submitted!');
        if (!email && !password && !password_confirmation && !token) throw new Error('Please insert all input form!');

        const response = await apiInstance.post(
            '/reset-password',
            {
                email,
                password,
                password_confirmation,
                token,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorMsg = error?.response?.data?.metadata?.message;
            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

/* 
@ROUTE : /logout 
*/
export const authCheckUser = async ({ token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        const response = await apiInstance.get('/user', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorMsg = error?.response?.data?.metadata?.message;
            const errorData = error?.response;

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};
