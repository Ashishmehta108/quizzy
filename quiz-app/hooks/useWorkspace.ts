/**
 * @layer hook
 * @owner agent-1
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/workspaces`, {
        withCredentials: true,
      });
      return data.data;
    },
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await axios.post(`${API_BASE}/workspaces`, { name }, {
        withCredentials: true,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useWorkspaceDetail(id: string) {
  return useQuery({
    queryKey: ["workspace", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/workspaces/${id}`, {
        withCredentials: true,
      });
      return data.data;
    },
    enabled: !!id,
  });
}

export function useWorkspaceMembers(id: string) {
  return useQuery({
    queryKey: ["workspace-members", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/workspaces/${id}/members`, {
        withCredentials: true,
      });
      return data.data;
    },
    enabled: !!id,
  });
}
