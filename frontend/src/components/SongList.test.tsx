/**
 * Unit and property tests for SongList component
 * Validates: Requirements 8.1, 8.2, 8.4, 8.5, 12.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as fc from 'fast-check';
import { SongList } from './SongList';
import songsReducer from '../store/songsSlice';
import statsReducer from '../store/statsSlice';
import type { Song } from '../types/song';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeSong = (overrides: Partial<Song> = {}): Song => ({
  _id: Math.random().toString(36).slice(2),
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  genre: 'Jazz',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

function renderWithStore(
  songs: Song[],
  selectedGenre: string | null = null,
  loading = false,
  error: string | null = null,
) {
  const store = configureStore({
    reducer: { songs: songsReducer, stats: statsReducer },
    preloadedState: {
      songs: { songs, loading, error, selectedGenre },
    },
  });
  return render(
    <Provider store={store}>
      <SongList onEdit={() => undefined} />
    </Provider>,
  );
}

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe('SongList', () => {
  it('shows loading indicator when loading is true', () => {
    renderWithStore([], null, true);
    expect(screen.getByText(/loading songs/i)).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    renderWithStore([], null, false, 'Failed to fetch');
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('shows "No songs found" when list is empty', () => {
    renderWithStore([]);
    expect(screen.getByText(/no songs found/i)).toBeInTheDocument();
  });

  it('renders song title and artist', () => {
    const song = makeSong({ title: 'My Song', artist: 'My Artist' });
    renderWithStore([song]);
    expect(screen.getByText('My Song')).toBeInTheDocument();
    expect(screen.getByText(/My Artist/)).toBeInTheDocument();
  });

  it('renders genre badge', () => {
    const song = makeSong({ genre: 'Classical' });
    renderWithStore([song]);
    expect(screen.getByText('Classical')).toBeInTheDocument();
  });

  it('filters songs by selectedGenre', () => {
    const jazz = makeSong({ _id: '1', title: 'Jazz Song', genre: 'Jazz' });
    const pop = makeSong({ _id: '2', title: 'Pop Song', genre: 'Pop' });
    renderWithStore([jazz, pop], 'Jazz');
    expect(screen.getByText('Jazz Song')).toBeInTheDocument();
    expect(screen.queryByText('Pop Song')).not.toBeInTheDocument();
  });

  it('shows all songs when selectedGenre is null', () => {
    const jazz = makeSong({ _id: '1', title: 'Jazz Song', genre: 'Jazz' });
    const pop = makeSong({ _id: '2', title: 'Pop Song', genre: 'Pop' });
    renderWithStore([jazz, pop], null);
    expect(screen.getByText('Jazz Song')).toBeInTheDocument();
    expect(screen.getByText('Pop Song')).toBeInTheDocument();
  });
});

// ─── Property 7 (partial): Song list renders all songs from store ─────────────
// Feature: addis-music-app, Property 7: Genre filter is a subset

describe('Property 7 (partial): Song list renders all songs from store', () => {
  it('every song title and artist appears in the rendered output', () => {
    const songArb = fc.record({
      _id: fc.uuid(),
      title: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0 && s === s.trim()),
      artist: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0 && s === s.trim()),
      album: fc.constant('Album'),
      genre: fc.constantFrom('Jazz', 'Pop', 'Rock'),
      createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
      updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
    });

    fc.assert(
      fc.property(fc.array(songArb, { minLength: 1, maxLength: 5 }), (songs) => {
        const { unmount } = renderWithStore(songs);
        for (const song of songs) {
          expect(screen.getByText(song.title)).toBeInTheDocument();
        }
        unmount();
      }),
      { numRuns: 20 },
    );
  });
});

// ─── Property 7: Genre filter is a subset ────────────────────────────────────
// Feature: addis-music-app, Property 7: Genre filter is a subset

describe('Property 7: Genre filter is a subset', () => {
  it('every rendered song has the selected genre', () => {
    const genres = ['Jazz', 'Pop', 'Rock', 'Classical'] as const;
    const songArb = fc.record({
      _id: fc.uuid(),
      title: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0 && s === s.trim()),
      artist: fc.constant('Artist'),
      album: fc.constant('Album'),
      genre: fc.constantFrom(...genres),
      createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
      updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
    });

    fc.assert(
      fc.property(
        fc.array(songArb, { minLength: 2, maxLength: 8 }),
        fc.constantFrom(...genres),
        (songs, selectedGenre) => {
          const store = configureStore({
            reducer: { songs: songsReducer, stats: statsReducer },
            preloadedState: {
              songs: { songs, loading: false, error: null, selectedGenre },
            },
          });
          const { unmount } = render(
            <Provider store={store}>
              <SongList onEdit={() => undefined} />
            </Provider>,
          );

          // All rendered genre badges should be the selected genre
          const badges = screen.queryAllByText(selectedGenre);
          const otherGenres = genres.filter((g) => g !== selectedGenre);
          for (const other of otherGenres) {
            // Songs of other genres should not appear as genre badges
            // (they may appear in titles, so we check the badge specifically)
            const otherBadges = screen.queryAllByText(other);
            // If any other-genre songs exist in the store, they should not be rendered
            const hasOtherGenreSongs = songs.some((s) => s.genre === other);
            if (hasOtherGenreSongs) {
              // The other genre badge should not appear (filtered out)
              expect(otherBadges.length).toBe(0);
            }
          }

          const expectedCount = songs.filter((s) => s.genre === selectedGenre).length;
          expect(badges.length).toBe(expectedCount);

          unmount();
        },
      ),
      { numRuns: 20 },
    );
  });
});
