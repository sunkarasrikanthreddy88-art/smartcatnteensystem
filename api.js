// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('adminToken');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
};

// Admin API
const adminAPI = {
    // Login
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await handleResponse(response);
        if (data.token) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminData', JSON.stringify(data.admin));
        }
        return data;
    },

    // Signup
    signup: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/admin/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await handleResponse(response);
        if (data.token) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminData', JSON.stringify(data.admin));
        }
        return data;
    },

    // Get profile
    getProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/profile`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return handleResponse(response);
    },

    // Update profile
    updateProfile: async (formData) => {
        const response = await fetch(`${API_BASE_URL}/admin/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData // FormData for file upload
        });
        return handleResponse(response);
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return handleResponse(response);
    },

    // Logout
    logout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = '/admin';
    },

    // Check if logged in
    isLoggedIn: () => {
        return !!getAuthToken();
    },

    // Get admin data
    getAdminData: () => {
        const data = localStorage.getItem('adminData');
        return data ? JSON.parse(data) : null;
    }
};

// Menu API
const menuAPI = {
    // Get all menu items (public)
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/menu?${params}`);
        return handleResponse(response);
    },

    // Get admin's menu items
    getMyMenu: async () => {
        const response = await fetch(`${API_BASE_URL}/menu/my-menu`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return handleResponse(response);
    },

    // Get single menu item
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`);
        return handleResponse(response);
    },

    // Create menu item
    create: async (formData) => {
        const response = await fetch(`${API_BASE_URL}/menu`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData // FormData for file upload
        });
        return handleResponse(response);
    },

    // Update menu item
    update: async (id, formData) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });
        return handleResponse(response);
    },

    // Delete menu item
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return handleResponse(response);
    },

    // Toggle availability
    toggleAvailability: async (id) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}/toggle-availability`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return handleResponse(response);
    }
};

// Orders API
const ordersAPI = {
    // Create order (public)
    create: async (orderData) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return handleResponse(response);
    },

    // Get admin orders
    getAdminOrders: async (status = '') => {
        const params = status ? `?status=${status}` : '';
        const response = await fetch(`${API_BASE_URL}/orders/admin/orders${params}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return handleResponse(response);
    },

    // Get single order
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`);
        return handleResponse(response);
    },

    // Update order status
    updateStatus: async (id, status) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ status })
        });
        return handleResponse(response);
    },

    // Update payment status
    updatePayment: async (id, paymentStatus, paymentMethod) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/payment`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ paymentStatus, paymentMethod })
        });
        return handleResponse(response);
    },

    // Get statistics
    getStatistics: async () => {
        const response = await fetch(`${API_BASE_URL}/orders/admin/statistics`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return handleResponse(response);
    }
};

// Export APIs
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { adminAPI, menuAPI, ordersAPI };
}
