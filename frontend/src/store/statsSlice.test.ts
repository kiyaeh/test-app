/**
 * Unit tests for statsSlice Redux reducer
 * Validates: Requirements 13.1, 13.4
 */

import { describe, it, expect } from 'vitest';
import statsReducer, {
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
} from './statsSlice';
import type { StatsResponse } from '../types/song';

const makeStats = (): StatsResponse => ({
  totalSongs: 10,
  totalArtists: 5,
  totalAlbums: 4,
  totalGenres: 3,
  songsPerGenre: [{ genre: 'Jazz', count: 5 }, { genre: 'Pop', count: 5 }],
  songsAndAlbumsPerArtist: [{ artist: 'Artist A', songCount: 3, albumCount: 2 }],
  songsPerAlbum: [{ album: 'Album X', count: 4 }],
});

describe('statsSlice', () => {
  const initialState = {
    data: null,
    loading: false,
    error: null,
  };

  it('returns initial state', () => {
    expect(statsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('fetchStatsStart', () => {
    it('sets loading to true and clears error', () => {
      const state = statsReducer(
        { ...initialState, error: 'previous error' },
        fetchStatsStart(),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchStatsSuccess', () => {
    it('sets data and clears loading', () => {
      const stats = makeStats();
      const state = statsReducer(
        { ...initialState, loading: true },
        fetchStatsSuccess(stats),
      );
      expect(state.data).toEqual(stats);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchStatsFailure', () => {
    it('sets error and clears loading', () => {
      const state = statsReducer(
        { ...initialState, loading: true },
        fetchStatsFailure('Stats fetch failed'),
      );
      expect(state.error).toBe('Stats fetch failed');
      expect(state.loading).toBe(false);
    });
  });
});
