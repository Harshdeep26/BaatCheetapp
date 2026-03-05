import axios from 'axios';

export const axiosInstance = axios.create({   //we created an instance of axios to set the baseURL and withCredentials for all requests
    baseURL: import.meta.env.MODE === "development" ? 'http://localhost:5001/api' : "/api" ,
    withCredentials: true,
});