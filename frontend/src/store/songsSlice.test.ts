/**
 * Unit tests for songsSlice Redux reducer
 * Validates: Requirements 13.1, 13.4
 */

import { describe, it, expect } from 'vitest';
import songsReducer, {
  fetchSongsStart,
  fetchSongsSuccess,
  fetchSongsFailure,
  addSong,
  updateSong,
  removeSong,
  setSelectedGenre,
} from './songsSlice';
import type { Song } from '../types/song';

const makeSong = (overrides: Partial<Song> = {}): Song => ({
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  genre: 'Jazz',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('songsSlice', () => {
  const initialState = {
    songs: [],
    loading: false,
    error: null,
    selectedGenre: null,
  };

  it('returns initial state', () => {
    expect(songsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('fetchSongsStart', () => {
    it('sets loading to true and clears error', () => {
      const state = songsReducer(
        { ...initialState, error: 'previous error' },
        fetchSongsStart(),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchSongsSuccess', () => {
    it('sets songs and clears loading', () => {
      const songs = [makeSong()];
      const state = songsReducer(
        { ...initialState, loading: true },
        fetchSongsSuccess(songs),
      );
      expect(state.songs).toEqual(songs);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchSongsFailure', () => {
    it('sets error and clears loading', () => {
      const state = songsReducer(
        { ...initialState, loading: true },
        fetchSongsFailure('Network error'),
      );
      expect(state.error).toBe('Network error');
      expect(state.loading).toBe(false);
    });
  });

  describe('addSong', () => {
    it('appends a song to the list', () => {
      const song = makeSong();
      const state = songsReducer(initialState, addSong(song));
      expect(state.songs).toHaveLength(1);
      expect(state.songs[0]).toEqual(song);
    });
  });

  describe('updateSong', () => {
    it('replaces the song with matching _id', () => {
      const original = makeSong({ title: 'Original' });
      const updated = makeSong({ title: 'Updated' });
      const state = songsReducer(
        { ...initialState, songs: [original] },
        updateSong(updated),
      );
      expect(state.songs[0].title).toBe('Updated');
    });

    it('does not change songs when _id does not match', () => {
      const song = makeSong({ _id: 'aaa' });
      const other = makeSong({ _id: 'bbb', title: 'Other' });
      const state = songsReducer(
        { ...initialState, songs: [song] },
        updateSong(other),
      );
      expect(state.songs).toHaveLength(1);
      expect(state.songs[0]._id).toBe('aaa');
    });
  });

  describe('removeSong', () => {
    it('removes the song with matching _id', () => {
      const song = makeSong({ _id: 'abc' });
      const state = songsReducer(
        { ...initialState, songs: [song] },
        removeSong('abc'),
      );
      expect(state.songs).toHaveLength(0);
    });

    it('leaves other songs intact', () => {
      const song1 = makeSong({ _id: 'aaa' });
      const song2 = makeSong({ _id: 'bbb' });
      const state = songsReducer(
        { ...initialState, songs: [song1, song2] },
        removeSong('aaa'),
      );
      expect(state.songs).toHaveLength(1);
      expect(state.songs[0]._id).toBe('bbb');
    });
  });

  describe('setSelectedGenre', () => {
    it('sets the selected genre', () => {
      const state = songsReducer(initialState, setSelectedGenre('Jazz'));
      expect(state.selectedGenre).toBe('Jazz');
    });

    it('clears the selected genre when null is passed', () => {
      const state = songsReducer(
        { ...initialState, selectedGenre: 'Jazz' },
        setSelectedGenre(null),
      );
      expect(state.selectedGenre).toBeNull();
    });
  });
});
