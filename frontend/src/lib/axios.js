import axios from "axios";

export const axiosInstance = axios.create({
    baseURL : "http://localhost:5000/api",
    withCredentials : true, // send cookies with request
});