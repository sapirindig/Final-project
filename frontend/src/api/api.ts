import axiosInstance from "./axiosInstance";
import { LoginResponse } from "./types/Responses/LoginResponse";
import { RegisterResponse } from "./types/Responses/RegisterResponse";
import { User } from "./types/User";
import axios, { AxiosResponse } from "axios";

const getData = async <T>(
    request: Promise<AxiosResponse<T, unknown>>
): Promise<AxiosResponse<T, unknown> | null> => {
    try {
        const response = await request;
        return response;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response as AxiosResponse<T, unknown>;
        }
        console.error(error);
        return null;
    }
};

export default {
    login(email: string, password: string): Promise<AxiosResponse<LoginResponse, unknown> | null> {
        return getData<LoginResponse>(axiosInstance.post<LoginResponse>('/auth/login', { email, password }));
    },
    googleLogin(token: string): Promise<AxiosResponse<LoginResponse, unknown> | null> {
        return getData<LoginResponse>(axiosInstance.post<LoginResponse>('/auth/google-login', {token }));
    },
    register(username: string, email: string, password: string): Promise<AxiosResponse<RegisterResponse, unknown> | null> {
        return getData<RegisterResponse>(axiosInstance.post<RegisterResponse>('/auth/register', { username, email, password }));
    },
    getUser(id: number): Promise<AxiosResponse<User, unknown> | null> {
        return getData<User>(axiosInstance.get<User>(`/user/${id}`));
    },
    getLoggedInUser(): Promise<AxiosResponse<User, unknown> | null> {
        return getData<User>(axiosInstance.get<User>('/user/me'));
    },
    updateUser(id: number, data: FormData): Promise<AxiosResponse<User, unknown> | null> {
        return getData<User>(axiosInstance.put<User>(`/user/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }));
    },
};