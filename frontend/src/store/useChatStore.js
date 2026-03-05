import {create} from 'zustand';
import toast from 'react-hot-toast';
import {axiosInstance} from '../lib/axios';
import {useAuthStore} from './useAuthStore';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessageLoading: false,

    getUsers: async () => {
        set({isUserLoading: true});
        try {
            const response = await axiosInstance.get('/messages/users');
            // set({users: response.data});
            set({ users: response.data?.users || response.data || [] });
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            set({isUserLoading: false});
        }
    },

    getMessages: async (userId) => {
        set({isMessageLoading: true});
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({messages: response.data});
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load messages');
        } finally {
            set({isMessageLoading: false});
        }   
    },
    
    sendMessage: async (messageData) => {
        const {selectedUser, messages} = get();
        if (!selectedUser?._id) {
            toast.error("No user selected");
            return;
        }
        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData); //  Assuming the API returns the created message and sending user info in response.data 
            set({messages: [...messages, response.data]}); // Append the new message to the existing messages array
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        }
    },

    subscribeToMessages: () => {
        const {selectedUser} = get();
        if (!selectedUser?._id) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (message) => {
            if(message.senderId !== selectedUser._id)return;
            set({
                messages: [...get().messages, message],
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({selectedUser}),
}));