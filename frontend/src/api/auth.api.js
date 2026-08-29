import client from './client';

export const loginApi = async (credentials) => {
  const res = await client.post('/api/auth/login', credentials);
  return res.data;
};

export const registerApi = async (userData) => {
  const res = await client.post('/api/auth/register', userData);
  return res.data;
};


export const logoutApi = async () => {
  const res = await client.post('/api/auth/logout');
  return res.data;
};

export const googleAuthApi = async (token) => {
  const res = await client.post('/api/auth/google', { token });
  return res.data;
};

export const forgotPasswordApi = async (email) => {
  const res = await client.post('/api/auth/forgot-password', { email });
  return res.data;
};

export const resetPasswordApi = async ({ token, password }) => {
  const res = await client.post(`/api/auth/reset-password/${token}`, { password });
  return res.data;
};

