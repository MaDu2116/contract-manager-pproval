import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/summary');
      return data;
    },
  });
}

export function useDashboardByType() {
  return useQuery({
    queryKey: ['dashboard', 'by-type'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/by-type');
      return data;
    },
  });
}

export function useDashboardByStatus() {
  return useQuery({
    queryKey: ['dashboard', 'by-status'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/by-status');
      return data;
    },
  });
}

export function useDashboardExpiring() {
  return useQuery({
    queryKey: ['dashboard', 'expiring'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/expiring');
      return data;
    },
  });
}
