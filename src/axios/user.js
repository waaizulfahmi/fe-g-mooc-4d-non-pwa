import { AxiosError } from 'axios';
import { apiInstance } from './instance';
import { ApiResponseError } from '@/utils/error-handling';

/* 
@ROUTE : /user 
*/
export const userGetData = async ({ token }) => {
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

/* 
@ROUTE : /user/update 
*/
export const userUpdateData = async ({ name, email, host, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!name) throw new Error('Name must be submitted!');
        if (!email) throw new Error('Email must be submitted!');
        if (!host) throw new Error('Host must be submitted!');

        const response = await apiInstance.put(
            '/user/update',
            {
                name,
                email,
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
@ROUTE : /user/updateImage 
*/
export const userUpdateImage = async ({ image, token }) => {
    try {
        if (!image) throw new Error('Image must be submitted!');
        if (!token) throw new Error('Token must be submitted!');

        const response = await apiInstance.put(
            '/user/updateImage',
            {
                image,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
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
@ROUTE : /user/kelas/all 
*/
export const userGetAllClassApi = async ({ token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');

        const response = await apiInstance.get('/user/kelas/all', {
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
            console.log('AXIOS KELAS ALL:+', error?.response);

            throw new ApiResponseError({
                data: errorData,
                message: errorMsg,
            });
        }
        throw new Error(error.message); //throw custom error
    }
};

/* 
@ROUTE : /user/kelas/${id} 
*/
export const userGetClassById = async ({ id, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!id) throw new Error('id must be submitted!');

        const response = await apiInstance.get(`/user/kelas/${id}`, {
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
@ROUTE : /user/kelasByLevel/${idLevel} 
*/
export const userGetClassByLevel = async ({ idLevel, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!idLevel) throw new Error('id level must be submitted!');

        const response = await apiInstance.get(`/user/kelasByLevel/${idLevel}`, {
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
@ROUTE : /user/enrollment/${namaKelas} 
*/
export const userGetEnroll = async ({ namaKelas, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!namaKelas) throw new Error('nama kelas must be submitted!');

        const response = await apiInstance.get(`/user/enrollment/${namaKelas}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
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
@ROUTE : /user/materi/${id} 
*/
export const userGetMateriById = async ({ id, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!id) throw new Error('id must be submitted!');

        const response = await apiInstance.get(`/user/materi/${id}`, {
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
@ROUTE : /user/quiz/${id}
*/
export const userGetQuiz = async ({ id, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!id) throw new Error('id must be submitted!');

        const response = await apiInstance.get(`/user/quiz/${id}`, {
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
@ROUTE : /user/history/getOrCreate
*/
export const userGetOrCreateHistory = async ({ id_kelas, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!id_kelas) throw new Error('id kelas must be submitted!');

        const response = await apiInstance.post(
            `/user/history/getOrCreate`,
            {
                id_kelas,
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
@ROUTE : /user/history/createOrUpdate
*/
export const userCreateOrUpdateHistory = async ({ id_kelas, id_materi, playback, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!id_kelas) throw new Error('id kelas must be submitted!');
        if (!id_materi) throw new Error('id materi must be submitted!');
        if (!playback) throw new Error('playback must be submitted!');

        const response = await apiInstance.post(
            `/user/history/createOrUpdate`,
            {
                id_kelas,
                id_materi,
                playback,
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
@ROUTE : /user/answer
*/
export const userGetAnswer = async ({ token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');

        const response = await apiInstance.get(`/user/answer`, {
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
@ROUTE : /user/answer/send
*/
export const userSendAnswer = async ({ id_quiz_history, id_option, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!id_quiz_history) throw new Error('id_quiz_history must be submitted!');
        if (!id_option) throw new Error('id option must be submitted!');

        const response = await apiInstance.put(
            `/user/enrollment/quiz/update/${id_quiz_history}`,
            {
                id_option,
                status: 'selesai',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return response;
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
@ROUTE : /user/enrollment/update/${id_materi}
*/
export const userUpdateVideoMateri = async ({ id_materi_history, playback, is_end = false, token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');
        if (!id_materi_history) throw new Error('id_materi_history must be submitted!');
        if (!playback) throw new Error('playback must be submitted!');

        let response;
        if (is_end) {
            response = await apiInstance.put(
                `/user/enrollment/materi/update/${id_materi_history}`,
                { playback, status: 'selesai' },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        } else {
            response = await apiInstance.put(
                `/user/enrollment/materi/update/${id_materi_history}`,
                { playback },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        }

        return response;
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
@ROUTE : /user/leaderboard
*/
export const userGetPeringkatApi = async ({ token }) => {
    try {
        if (!token) throw new Error('Token must be submitted!');

        const response = await apiInstance.get(`/user/leaderboard`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            //custom from backend
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
