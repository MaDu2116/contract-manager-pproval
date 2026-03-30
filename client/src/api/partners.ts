import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export function usePartners(params: { search?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['partners', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/partners', { params });
      return data;
    },
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/partners/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partnerData: Record<string, unknown>) => {
      const { data } = await apiClient.post('/partners', partnerData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...partnerData }: Record<string, unknown> & { id: string }) => {
      const { data } = await apiClient.put(`/partners/${id}`, partnerData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });
}
