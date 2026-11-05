import { ApiClient, RouteSearchResult, ReplanResult, NetworkEntitiesResult } from './client';
import { JourneySearchRequest, DisruptionEvent } from '../../types';

export class AwsApiClient implements ApiClient {
  private baseUrl: string;
  private region: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.accesspath.transit.aws.internal';
    this.region = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('accesspath_cognito_token');
    return {
      'Content-Type': 'application/json',
      'X-Aws-Region': this.region,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async searchRoutes(request: JourneySearchRequest): Promise<RouteSearchResult> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/v1/routes/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      throw new Error(`AWS Route Search failed with status: ${response.status}`);
    }
    return response.json();
  }

  async replanRoute(routeId: string, request: JourneySearchRequest): Promise<ReplanResult> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/v1/routes/${encodeURIComponent(routeId)}/replan`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      throw new Error(`AWS Route Replanning failed with status: ${response.status}`);
    }
    return response.json();
  }

  async getNetworkEntities(): Promise<NetworkEntitiesResult> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/v1/network/entities`, {
      method: 'GET',
      headers
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch AWS network entities: ${response.status}`);
    }
    return response.json();
  }

  async getActiveEvents(): Promise<DisruptionEvent[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/v1/events/active`, {
      method: 'GET',
      headers
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch AWS active events: ${response.status}`);
    }
    return response.json();
  }

  async createEvent(event: Omit<DisruptionEvent, 'id'>): Promise<DisruptionEvent> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/v1/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(event)
    });
    if (!response.ok) {
      throw new Error(`Failed to create disruption event on AWS: ${response.status}`);
    }
    return response.json();
  }

  async resolveEvent(eventId: string): Promise<boolean> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/v1/events/${encodeURIComponent(eventId)}/resolve`, {
      method: 'POST',
      headers
    });
    return response.ok;
  }

  async resetDemo(): Promise<boolean> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/v1/demo/reset`, {
      method: 'POST',
      headers
    });
    return response.ok;
  }

  async getHealth(): Promise<{ status: string; mode: 'demo' | 'aws'; version: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        return { status: 'healthy', mode: 'aws', version: '1.0.0-aws' };
      }
    } catch {
      // Fallback
    }
    return { status: 'unreachable', mode: 'aws', version: '1.0.0-aws' };
  }
}

