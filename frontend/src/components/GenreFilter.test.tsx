/**
 * Unit and property tests for GenreFilter component
 * Validates: Requirements 12.1, 12.2, 12.4
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as fc from 'fast-check';
import { GenreFilter } from './GenreFilter';
import songsReducer from '../store/songsSlice';
import statsReducer from '../store/statsSlice';
import type { Song } from '../types/song';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeSong = (genre: string, id: string): Song => ({
  _id: id,
  title: 'Song',
  artist: 'Artist',
  album: 'Album',
  genre,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

function renderFilter(songs: Song[], selectedGenre: string | null = null) {
  const store = configureStore({
    reducer: { songs: songsReducer, stats: statsReducer },
    preloadedState: {
      songs: { songs, loading: false, error: null, selectedGenre },
    },
  });
  render(
    <Provider store={store}>
      <GenreFilter />
    </Provider>,
  );
  return store;
}

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe('GenreFilter', () => {
  it('renders "All" button', () => {
    renderFilter([]);
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
  });

  it('renders a button for each distinct genre', () => {
    const songs = [
      makeSong('Jazz', '1'),
      makeSong('Pop', '2'),
      makeSong('Jazz', '3'),
    ];
    renderFilter(songs);
    expect(screen.getByRole('button', { name: /^jazz$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^pop$/i })).toBeInTheDocument();
    // Only one Jazz button (distinct)
    expect(screen.getAllByRole('button', { name: /^jazz$/i })).toHaveLength(1);
  });

  it('dispatches setSelectedGenre when a genre button is clicked', () => {
    const songs = [makeSong('Rock', '1')];
    const store = renderFilter(songs);
    fireEvent.click(screen.getByRole('button', { name: /^rock$/i }));
    expect(store.getState().songs.selectedGenre).toBe('Rock');
  });

  it('dispatches setSelectedGenre(null) when "All" is clicked', () => {
    const songs = [makeSong('Rock', '1')];
    const store = renderFilter(songs, 'Rock');
    fireEvent.click(screen.getByRole('button', { name: /^all$/i }));
    expect(store.getState().songs.selectedGenre).toBeNull();
  });
});

// ─── Property 7: GenreFilter shows all distinct genres ───────────────────────
// Feature: addis-music-app, Property 7: Genre filter is a subset

describe('Property 7: GenreFilter shows all distinct genres', () => {
  it('every distinct genre in the song array appears as a button option', () => {
    const genreArb = fc.constantFrom('Jazz', 'Pop', 'Rock', 'Classical', 'Hip-Hop', 'Blues');
    const songArb = fc.record({
      _id: fc.uuid(),
      title: fc.constant('Song'),
      artist: fc.constant('Artist'),
      album: fc.constant('Album'),
      genre: genreArb,
      createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
      updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
    });

    fc.assert(
      fc.property(fc.array(songArb, { minLength: 1, maxLength: 10 }), (songs) => {
        const { unmount } = (() => {
          const store = configureStore({
            reducer: { songs: songsReducer, stats: statsReducer },
            preloadedState: {
              songs: { songs, loading: false, error: null, selectedGenre: null },
            },
          });
          return render(
            <Provider store={store}>
              <GenreFilter />
            </Provider>,
          );
        })();

        const distinctGenres = [...new Set(songs.map((s) => s.genre))];
        for (const genre of distinctGenres) {
          expect(screen.getByRole('button', { name: new RegExp(`^${genre}$`, 'i') })).toBeInTheDocument();
        }

        unmount();
      }),
      { numRuns: 20 },
    );
  });
});
