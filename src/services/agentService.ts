export interface AgentRunResponse<T = any> {
  success: boolean;
  result?: T;
  error?: string;
  agentId?: string;
}

export async function runAgentAPI<T = any>(
  agentId: string,
  prompt: string,
  data: any
): Promise<AgentRunResponse<T>> {
  try {
    const res = await fetch('/api/agent/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        prompt,
        data,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error || `HTTP ${res.status}: Failed to execute agent`,
        agentId,
      };
    }

    return {
      success: true,
      result: json.result as T,
      agentId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error executing agent call',
      agentId,
    };
  }
}
