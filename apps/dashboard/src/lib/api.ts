const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getDashboard: () => fetchAPI('/api/v1/dashboard'),
  getAgents: () => fetchAPI<{ agents: unknown[] }>('/api/v1/agents'),
  getAlerts: () => fetchAPI<{ alerts: unknown[] }>('/api/v1/alerts'),
  getAlertHistory: () => fetchAPI<{ alerts: unknown[] }>('/api/v1/alerts/history'),
  acknowledgeAlert: (id: string) => fetchAPI(`/api/v1/alerts/${id}/acknowledge`, { method: 'POST' }),
  resolveAlert: (id: string) => fetchAPI(`/api/v1/alerts/${id}/resolve`, { method: 'POST' }),
  getTasks: (params?: { agentId?: string; status?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchAPI<{ tasks: unknown[] }>(`/api/v1/tasks${query ? `?${query}` : ''}`);
  },
  submitTask: (agentId: string, description: string) =>
    fetchAPI('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify({ agentId, description }),
    }),
};
