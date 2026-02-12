import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import React from 'react'

export default async function searchService(params: {
    name?: string;
    skill?: string;
    limit?: number;
    cursor?: string;
}) {
    try {
        const query = new URLSearchParams()

        if (params.name) {
            query.append("name", params.name)
        }
        if (params.skill) {
            query.append("skill", params.skill)
        }
        if (params.limit) {
            query.append("limit", params.limit.toString())
        }
        if (params.cursor) {
            query.append("cursor", params.cursor)
        }

        console.log("searching for user with required skill or username...", { name: params.name, skill: params.skill, limit: params.limit, cursor: params.cursor })
        const response = await axios.get(`/api/users?${query.toString()}`)
        return response.data.data

    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        console.error("Error searching users:", axiosError.response?.data.message || axiosError.message)
        throw new Error(axiosError.response?.data.message || "An error occurred while creating account.");
    }
}
