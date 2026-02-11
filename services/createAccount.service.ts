import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

export async function createAccount(userData: {
    name: string;
    email: string;
    clerkUserId: string;
}) {
    try {
        console.log("Creating account with data:", userData);
        const response = await axios.post(`/api/user/create`, userData);
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error("Error creating account:", axiosError.response?.data.message || axiosError.message);
        throw new Error(axiosError.response?.data.message || "An error occurred while creating account.");
    }
}
