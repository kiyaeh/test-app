import type { Song, SongFormData, StatsResponse } from '../types/song';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? 'Request failed');
  }

  // 204 No Content — return undefined cast to T
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

export function getSongs(): Promise<Song[]> {
  return request<Song[]>('/api/songs');
}

export function createSong(data: SongFormData): Promise<Song> {
  return request<Song>('/api/songs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSong(id: string, data: Partial<SongFormData>): Promise<Song> {
  return request<Song>(`/api/songs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteSong(id: string): Promise<void> {
  return request<void>(`/api/songs/${id}`, { method: 'DELETE' });
}

export function getStats(): Promise<StatsResponse> {
  return request<StatsResponse>('/api/stats');
}
