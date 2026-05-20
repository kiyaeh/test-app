/**
 * Unit and property tests for StatsDashboard component
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as fc from 'fast-check';
import { StatsDashboard } from './StatsDashboard';
import songsReducer from '../store/songsSlice';
import statsReducer from '../store/statsSlice';
import type { StatsResponse } from '../types/song';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderDashboard(
  data: StatsResponse | null,
  loading = false,
  error: string | null = null,
) {
  const store = configureStore({
    reducer: { songs: songsReducer, stats: statsReducer },
    preloadedState: {
      stats: { data, loading, error },
    },
  });
  return render(
    <Provider store={store}>
      <StatsDashboard />
    </Provider>,
  );
}

const makeStats = (overrides: Partial<StatsResponse> = {}): StatsResponse => ({
  totalSongs: 5,
  totalArtists: 3,
  totalAlbums: 2,
  totalGenres: 2,
  songsPerGenre: [{ genre: 'Jazz', count: 3 }, { genre: 'Pop', count: 2 }],
  songsAndAlbumsPerArtist: [{ artist: 'Miles Davis', songCount: 3, albumCount: 2 }],
  songsPerAlbum: [{ album: 'Kind of Blue', count: 3 }],
  ...overrides,
});

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe('StatsDashboard', () => {
  it('shows loading indicator when loading is true', () => {
    renderDashboard(null, true);
    expect(screen.getByText(/loading statistics/i)).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    renderDashboard(null, false, 'Stats fetch failed');
    expect(screen.getByText(/stats fetch failed/i)).toBeInTheDocument();
  });

  it('shows "No statistics available" when data is null', () => {
    renderDashboard(null);
    expect(screen.getByText(/no statistics available/i)).toBeInTheDocument();
  });

  it('displays total counts', () => {
    renderDashboard(makeStats());
    // Use getAllByText since the same number may appear in multiple places
    expect(screen.getAllByText('5').length).toBeGreaterThan(0); // totalSongs
    expect(screen.getAllByText('3').length).toBeGreaterThan(0); // totalArtists
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // totalAlbums / totalGenres
  });

  it('displays songsPerGenre entries', () => {
    renderDashboard(makeStats());
    expect(screen.getByText('Jazz')).toBeInTheDocument();
    expect(screen.getByText('Pop')).toBeInTheDocument();
  });

  it('displays songsAndAlbumsPerArtist entries', () => {
    renderDashboard(makeStats());
    expect(screen.getByText('Miles Davis')).toBeInTheDocument();
  });

  it('displays songsPerAlbum entries', () => {
    renderDashboard(makeStats());
    expect(screen.getByText('Kind of Blue')).toBeInTheDocument();
  });
});

// ─── Property 5: StatsDashboard renders all stats data ───────────────────────
// Feature: addis-music-app, Property 5: Stats counts are consistent with catalog

describe('Property 5: StatsDashboard renders all stats data', () => {
  it('all total counts and breakdown entries appear in the rendered output', () => {
    const genreStatArb = fc.record({
      genre: fc.constantFrom('Jazz', 'Pop', 'Rock', 'Classical'),
      count: fc.integer({ min: 1, max: 20 }),
    });
    const artistStatArb = fc.record({
      artist: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0 && s === s.trim()),
      songCount: fc.integer({ min: 1, max: 10 }),
      albumCount: fc.integer({ min: 1, max: 5 }),
    });
    const albumStatArb = fc.record({
      album: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0 && s === s.trim()),
      count: fc.integer({ min: 1, max: 10 }),
    });

    const statsArb = fc.record({
      totalSongs: fc.integer({ min: 0, max: 100 }),
      totalArtists: fc.integer({ min: 0, max: 50 }),
      totalAlbums: fc.integer({ min: 0, max: 50 }),
      totalGenres: fc.integer({ min: 0, max: 10 }),
      songsPerGenre: fc.array(genreStatArb, { minLength: 1, maxLength: 4 }),
      songsAndAlbumsPerArtist: fc.array(artistStatArb, { minLength: 1, maxLength: 3 }),
      songsPerAlbum: fc.array(albumStatArb, { minLength: 1, maxLength: 3 }),
    });

    fc.assert(
      fc.property(statsArb, (stats) => {
        const { unmount } = renderDashboard(stats);

        // Total counts appear (use getAllByText since the same number may appear multiple times)
        expect(screen.getAllByText(stats.totalSongs.toString()).length).toBeGreaterThan(0);

        // Genre names appear
        for (const { genre } of stats.songsPerGenre) {
          expect(screen.getAllByText(genre).length).toBeGreaterThan(0);
        }

        // Artist names appear
        for (const { artist } of stats.songsAndAlbumsPerArtist) {
          expect(screen.getAllByText(artist).length).toBeGreaterThan(0);
        }

        // Album names appear
        for (const { album } of stats.songsPerAlbum) {
          expect(screen.getAllByText(album).length).toBeGreaterThan(0);
        }

        unmount();
      }),
      { numRuns: 20 },
    );
  });
});
