import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

interface ContractFilters {
  partner?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useContracts(filters: ContractFilters = {}) {
  return useQuery({
    queryKey: ['contracts', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/contracts', { params: filters });
      return data;
    },
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contracts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useContractVersions(id: string) {
  return useQuery({
    queryKey: ['contract-versions', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contracts/${id}/versions`);
      return data;
    },
    enabled: !!id,
  });
}

export function useContractHistory(id: string) {
  return useQuery({
    queryKey: ['contract-history', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contracts/${id}/history`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contractData: Record<string, unknown>) => {
      const { data } = await apiClient.post('/contracts', contractData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...contractData }: Record<string, unknown> & { id: string }) => {
      const { data } = await apiClient.put(`/contracts/${id}`, contractData);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
    },
  });
}

export function useContractAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, comment }: { id: string; action: string; comment?: string }) => {
      const { data } = await apiClient.post(`/contracts/${id}/${action}`, { comment });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['contract-history', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRenewContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/contracts/${id}/renew`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractId, file }: { contractId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post(`/contracts/${contractId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract', variables.contractId] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/attachments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
  });
}
