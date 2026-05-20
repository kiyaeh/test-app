/**
 * Unit and property tests for SongForm component
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as fc from 'fast-check';
import { SongForm } from './SongForm';
import songsReducer, { createSongRequest } from '../store/songsSlice';
import statsReducer from '../store/statsSlice';
import type { Song } from '../types/song';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({
    reducer: { songs: songsReducer, stats: statsReducer },
  });
}

function renderForm(song?: Song, onSuccess?: () => void) {
  const store = makeStore();
  const dispatch = vi.spyOn(store, 'dispatch');
  render(
    <Provider store={store}>
      <SongForm song={song} onSuccess={onSuccess} />
    </Provider>,
  );
  return { store, dispatch };
}

const makeSong = (overrides: Partial<Song> = {}): Song => ({
  _id: '507f1f77bcf86cd799439011',
  title: 'Existing Title',
  artist: 'Existing Artist',
  album: 'Existing Album',
  genre: 'Jazz',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe('SongForm', () => {
  it('renders all four input fields', () => {
    renderForm();
    expect(screen.getByPlaceholderText(/song title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/artist name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/album name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/genre/i)).toBeInTheDocument();
  });

  it('shows "Add Song" button when no song prop', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /add song/i })).toBeInTheDocument();
  });

  it('shows "Update Song" button when song prop is provided', () => {
    renderForm(makeSong());
    expect(screen.getByRole('button', { name: /update song/i })).toBeInTheDocument();
  });

  it('pre-populates fields when song prop is provided', () => {
    const song = makeSong();
    renderForm(song);
    expect(screen.getByDisplayValue('Existing Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Artist')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Album')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jazz')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields on submit', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /add song/i }));
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/artist is required/i)).toBeInTheDocument();
    expect(screen.getByText(/album is required/i)).toBeInTheDocument();
    expect(screen.getByText(/genre is required/i)).toBeInTheDocument();
  });

  it('dispatches createSongRequest with valid data', () => {
    const { dispatch } = renderForm();
    fireEvent.change(screen.getByPlaceholderText(/song title/i), { target: { value: 'My Song' } });
    fireEvent.change(screen.getByPlaceholderText(/artist name/i), { target: { value: 'My Artist' } });
    fireEvent.change(screen.getByPlaceholderText(/album name/i), { target: { value: 'My Album' } });
    fireEvent.change(screen.getByPlaceholderText(/genre/i), { target: { value: 'Pop' } });
    fireEvent.click(screen.getByRole('button', { name: /add song/i }));

    expect(dispatch).toHaveBeenCalledWith(
      createSongRequest({ title: 'My Song', artist: 'My Artist', album: 'My Album', genre: 'Pop' }),
    );
  });

  it('does not dispatch when fields are empty', () => {
    const { dispatch } = renderForm();
    fireEvent.click(screen.getByRole('button', { name: /add song/i }));
    // dispatch is called by the store internally, but createSongRequest should not be dispatched
    const calls = dispatch.mock.calls.map((c) => c[0]);
    const hasSongRequest = calls.some(
      (action) => typeof action === 'object' && action !== null && 'type' in action && (action as { type: string }).type === createSongRequest.type,
    );
    expect(hasSongRequest).toBe(false);
  });
});

// ─── Property 8: Redux Store whitespace validation ────────────────────────────
// Feature: addis-music-app, Property 8: Redux Store whitespace validation

describe('Property 8: Redux Store whitespace validation', () => {
  it('whitespace-only fields show validation errors and no saga action is dispatched', () => {
    const whitespaceArb = fc
      .string({ minLength: 1 })
      .map((s) => s.replace(/\S/g, ' '))
      .filter((s) => s.trim().length === 0 && s.length > 0);

    fc.assert(
      fc.property(
        whitespaceArb,
        whitespaceArb,
        whitespaceArb,
        whitespaceArb,
        (wsTitle, wsArtist, wsAlbum, wsGenre) => {
          const store = makeStore();
          const dispatch = vi.spyOn(store, 'dispatch');

          const { unmount } = render(
            <Provider store={store}>
              <SongForm />
            </Provider>,
          );

          fireEvent.change(screen.getByPlaceholderText(/song title/i), { target: { value: wsTitle } });
          fireEvent.change(screen.getByPlaceholderText(/artist name/i), { target: { value: wsArtist } });
          fireEvent.change(screen.getByPlaceholderText(/album name/i), { target: { value: wsAlbum } });
          fireEvent.change(screen.getByPlaceholderText(/genre/i), { target: { value: wsGenre } });
          fireEvent.click(screen.getByRole('button', { name: /add song/i }));

          // Validation errors should be shown
          expect(screen.getByText(/title is required/i)).toBeInTheDocument();
          expect(screen.getByText(/artist is required/i)).toBeInTheDocument();
          expect(screen.getByText(/album is required/i)).toBeInTheDocument();
          expect(screen.getByText(/genre is required/i)).toBeInTheDocument();

          // createSongRequest should NOT have been dispatched
          const calls = dispatch.mock.calls.map((c) => c[0]);
          const hasSongRequest = calls.some(
            (action) =>
              typeof action === 'object' &&
              action !== null &&
              'type' in action &&
              (action as { type: string }).type === createSongRequest.type,
          );
          expect(hasSongRequest).toBe(false);

          unmount();
        },
      ),
      { numRuns: 20 },
    );
  });
});

// ─── Property 4 (frontend): Form pre-populates for any Song ──────────────────
// Feature: addis-music-app, Property 4: Update preserves unmodified fields

describe('Property 4 (frontend): Form pre-populates for any Song', () => {
  it('each input field value matches the song prop fields', () => {
    const nonEmptyString = fc
      .string({ minLength: 1 })
      .filter((s) => s.trim().length > 0 && s === s.trim());

    fc.assert(
      fc.property(
        fc.record({
          _id: fc.uuid(),
          title: nonEmptyString,
          artist: nonEmptyString,
          album: nonEmptyString,
          genre: nonEmptyString,
          createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
          updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
        }),
        (song) => {
          const store = configureStore({
            reducer: { songs: songsReducer, stats: statsReducer },
          });
          const { container, unmount } = render(
            <Provider store={store}>
              <SongForm song={song} />
            </Provider>,
          );
          // Query by specific input IDs within the container to avoid cross-render pollution
          const titleInput = container.querySelector('#song-title') as HTMLInputElement;
          const artistInput = container.querySelector('#song-artist') as HTMLInputElement;
          const albumInput = container.querySelector('#song-album') as HTMLInputElement;
          const genreInput = container.querySelector('#song-genre') as HTMLInputElement;
          expect(titleInput?.value).toBe(song.title);
          expect(artistInput?.value).toBe(song.artist);
          expect(albumInput?.value).toBe(song.album);
          expect(genreInput?.value).toBe(song.genre);
          unmount();
        },
      ),
      { numRuns: 20 },
    );
  });
});
