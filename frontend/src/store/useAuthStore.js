//Basically, zustand is a state management library for React applications. It provides a simple and efficient way to manage state in your application without the need for complex boilerplate code. With Zustand, you can create a global store that holds your application's state and allows you to easily access and update it from any component. It uses a hook-based API, making it easy to integrate into your React components and manage state in a more intuitive way. Overall, Zustand is a great choice for managing state in React applications, especially for those looking for a lightweight and straightforward solution. Example is using authentication of a user. You can create a store that holds the user's authentication status and information, and then use that store to manage the user's login state across your application. This way, you can easily check if a user is logged in or not and display the appropriate content based on their authentication status.

import toast from 'react-hot-toast';
import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import {io} from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? 'http://localhost:5001' : "/" ;

export const useAuthStore = create((set, get) => ({ //this takes a function as an argument that returns an object representing the initial state of the store. In this case, we are creating an authentication store with two properties: isAuthenticated and user. The isAuthenticated property is a boolean that indicates whether the user is currently authenticated or not, while the user property is an object that holds information about the authenticated user, such as their name and email. By using this store, you can easily manage the authentication state of your application and access it from any component that needs it.
    authUser: null,
    onlineUsers: [], // New state for online users
    isSigningup: false,
    isLoggingin: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser:res.data});
            get().connectSocket(); // Connect to socket after successful auth check

        } catch (error) {
            console.log("Error in checkAuth:",error);
            set({authUser:null});
        }finally{
            set({isCheckingAuth:false});
        }
    },

    //left to understand
    signup: async (data) => {
        set({isSigningup:true});
        try {
            const res = await axiosInstance.post('/auth/signup',data);
            set({authUser:res.data});
            toast.success("Account created successfully");
            
            get().connectSocket(); // Connect to socket after successful signup
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isSigningup:false});
        }
    },

    login: async (data) => {
        set({isLoggingin:true});
        try {
            const res = await axiosInstance.post('/auth/login',data);
            set({authUser:res.data});
            toast.success("Logged in successfully");

            get().connectSocket(); // Connect to socket after successful login
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isLoggingin:false});
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({authUser:null});
            toast.success("Logged out successfully");
            get().disconnectSocket(); // Disconnect from socket on logout
        } catch (error) {
            toast.error(error.response.data.message || "Logout failed");
        }
    },

    updateProfile: async (data) => {
        set({isUpdatingProfile:true});
        try {
            const res = await axiosInstance.put('/auth/update-profile',data);
            set({authUser:res.data});
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in the updating profile");
            toast.error(error.response?.data?.message || "Failed to update profile");
        }finally{
            set({isUpdatingProfile:false});
        }
    },
    
    connectSocket: () => {
        const {authUser} = get();
        if (!authUser || authUser?.socket?.connected) return; // Ensure user is authenticated before connecting to socket
        const socket = io(BASE_URL, {
            query: { userId: authUser._id }, // Send userId as a query parameter for authentication
        });
        socket.connect();
        set({socket:socket});

        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers:userIds}); // Update the online users state with the received list
        });
    },

    disconnectSocket: () => {
        if(get().socket?.connected){
            get().socket.disconnect();
        }
    },
}));