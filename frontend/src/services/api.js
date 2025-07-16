import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Bible Study API
export const bibleAPI = {
    getBooks: async () => {
        const response = await api.get('/bible/books');
        return response.data;
    },

    getHighlights: async () => {
        const response = await api.get('/highlights');
        return response.data;
    },

    createHighlight: async (highlight) => {
        const response = await api.post('/highlights', highlight);
        return response.data;
    },

    deleteHighlight: async (highlightId) => {
        const response = await api.delete(`/highlights/${highlightId}`);
        return response.data;
    },

    getBookmarks: async () => {
        const response = await api.get('/bookmarks');
        return response.data;
    },

    createBookmark: async (bookmark) => {
        const response = await api.post('/bookmarks', bookmark);
        return response.data;
    },

    deleteBookmark: async (bookmarkId) => {
        const response = await api.delete(`/bookmarks/${bookmarkId}`);
        return response.data;
    },
};

// Notes API
export const notesAPI = {
    getNotes: async () => {
        const response = await api.get('/notes');
        return response.data;
    },

    createNote: async (note) => {
        const response = await api.post('/notes', note);
        return response.data;
    },

    updateNote: async (noteId, note) => {
        const response = await api.put(`/notes/${noteId}`, note);
        return response.data;
    },

    deleteNote: async (noteId) => {
        const response = await api.delete(`/notes/${noteId}`);
        return response.data;
    },
};

// Friends API
export const friendsAPI = {
    getFriends: async () => {
        const response = await api.get('/friends');
        return response.data;
    },

    sendFriendRequest: async (email) => {
        const response = await api.post('/friends/request', { friend_email: email });
        return response.data;
    },

    getFriendRequests: async () => {
        const response = await api.get('/friends/requests');
        return response.data;
    },

    acceptFriendRequest: async (requestId) => {
        const response = await api.post(`/friends/accept/${requestId}`);
        return response.data;
    },

    rejectFriendRequest: async (requestId) => {
        const response = await api.post(`/friends/reject/${requestId}`);
        return response.data;
    },
};

// Reminders API
export const remindersAPI = {
    getReminders: async () => {
        const response = await api.get('/reminders');
        return response.data;
    },

    createReminder: async (reminder) => {
        const response = await api.post('/reminders', reminder);
        return response.data;
    },

    updateReminder: async (reminderId, reminder) => {
        const response = await api.put(`/reminders/${reminderId}`, reminder);
        return response.data;
    },

    deleteReminder: async (reminderId) => {
        const response = await api.delete(`/reminders/${reminderId}`);
        return response.data;
    },

    completeReminder: async (reminderId) => {
        const response = await api.post(`/reminders/${reminderId}/complete`);
        return response.data;
    },
};

// Chat API
export const chatAPI = {
    getChats: async () => {
        const response = await api.get('/chats');
        return response.data;
    },

    createChat: async (chat) => {
        const response = await api.post('/chats', chat);
        return response.data;
    },

    getChatMessages: async (chatId) => {
        const response = await api.get(`/chats/${chatId}/messages`);
        return response.data;
    },

    sendMessage: async (chatId, message) => {
        const response = await api.post(`/chats/${chatId}/messages`, { content: message });
        return response.data;
    },
};

// ChatBot API
export const chatbotAPI = {
    askQuestion: async (message, context = '') => {
        const response = await api.post('/chatbot/ask', { message, context });
        return response.data;
    },

    explainVerse: async (book, chapter, verse, text) => {
        const response = await api.post('/chatbot/explain-verse', {
            book,
            chapter,
            verse,
            text
        });
        return response.data;
    },
};

export default api;