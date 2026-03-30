import apiClient from './client';

export async function login(email: string, password: string) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.user;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data.user;
}
