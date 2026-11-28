import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosClient = axios.create({
    withCredentials: true
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean
}

let refreshRequest: Promise<void> | null = null

function refreshAccessToken(): Promise<void> {
    if (!refreshRequest) {
        refreshRequest = axios.post(`/api/auth/refresh`, {}, {
            withCredentials: true
        }).then(() => undefined).finally(() => {
            refreshRequest = null
        })
    }

    return refreshRequest
}

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined
        const isAuthRequest = originalRequest?.url?.includes("/api/auth/")

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true

            try {
                await refreshAccessToken()
                return axiosClient(originalRequest)

            } catch (refreshError) {
                if (
                    axios.isAxiosError(refreshError) &&
                    refreshError.response?.status === 401 &&
                    typeof window !== "undefined"
                ) {
                    window.location.href = "/sign-in"
                }
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default axiosClient;