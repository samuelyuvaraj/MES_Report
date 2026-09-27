import { api } from "../lib/api";

export interface HealthResponse {
    success: boolean;
    message: string;
    environment: string;
}

export async function getApiHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>("/health");
    return response.data;
}