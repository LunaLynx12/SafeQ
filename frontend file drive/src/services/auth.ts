import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:4000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post('/auth/register', { username, email, password });
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Registration failed'
    };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Login failed'
    };
  }
};