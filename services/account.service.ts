import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import axiosClient from "@/lib/axiosClient";

export async function register(userData: {
    name: string;
    email: string;
    password: string;
}) {
    try {
        console.log("Creating account with data:", userData);
        const response = await axiosClient.post(`/api/auth/register`, userData);
        console.log("Register response:", response.data)
        console.log("AccessToken in response:", response.data.accessToken)
        return {
            ...response.data.user,
            accessToken: response.data.accessToken
        };
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error creating account:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while creating account.");
    }
}

export async function login(userData: {
    email: string;
    password: string;
}) {
    try {
        const response = await axiosClient.post(`/api/auth/login`, userData)
        console.log("Login response:", response.data)
        console.log("AccessToken in response:", response.data.accessToken)
        return {
            ...response.data.user,
            accessToken: response.data.accessToken
        }
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error logging in: ", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while logging in.");
    }
}

export async function logout() {
    try {
        localStorage.removeItem("userId");
        localStorage.removeItem("authToken");
        const response = await axiosClient.post(`/api/auth/logout`)
        return response.data
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error logging out: ", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while logging out.");
    }
}

export async function refresh() {
    try {
        const response = await axiosClient.post(`/api/auth/refresh`) 
        return response.data.accessToken
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error refreshing token: ", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while refreshing token.");
    }
}
