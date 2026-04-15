import axios from "axios";

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    withCredentials: true
})

axiosClient.interceptors.response.use(
    (response) => response,
    async(error) => {
        const originalRequest = error.config

        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                await axios.post(`/api/auth/refresh`, {}, {
                    withCredentials: true
                })
                return axiosClient(originalRequest)

            } catch (refreshError) {
                window.location.href = "/sign-in"
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default axiosClient;