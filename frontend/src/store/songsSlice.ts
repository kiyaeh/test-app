import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Song, SongFormData } from '../types/song';

interface SongsState {
  songs: Song[];
  loading: boolean;
  error: string | null;
  selectedGenre: string | null;
}

const initialState: SongsState = {
  songs: [],
  loading: false,
  error: null,
  selectedGenre: null,
};

const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    // State mutation actions (used by sagas to update store)
    fetchSongsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSongsSuccess(state, action: PayloadAction<Song[]>) {
      state.songs = action.payload;
      state.loading = false;
    },
    fetchSongsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    addSong(state, action: PayloadAction<Song>) {
      state.songs.push(action.payload);
    },
    updateSong(state, action: PayloadAction<Song>) {
      const index = state.songs.findIndex((s) => s._id === action.payload._id);
      if (index !== -1) {
        state.songs[index] = action.payload;
      }
    },
    removeSong(state, action: PayloadAction<string>) {
      state.songs = state.songs.filter((s) => s._id !== action.payload);
    },
    setSelectedGenre(state, action: PayloadAction<string | null>) {
      state.selectedGenre = action.payload;
    },

    // Saga trigger actions (watched by sagas, no reducer logic needed)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchSongsRequest(_state) {
      // handled by saga
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createSongRequest(_state, _action: PayloadAction<SongFormData>) {
      // handled by saga
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateSongRequest(
      _state,
      _action: PayloadAction<{ id: string; data: Partial<SongFormData> }>,
    ) {
      // handled by saga
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteSongRequest(_state, _action: PayloadAction<string>) {
      // handled by saga
    },
  },
});

export const {
  fetchSongsStart,
  fetchSongsSuccess,
  fetchSongsFailure,
  addSong,
  updateSong,
  removeSong,
  setSelectedGenre,
  fetchSongsRequest,
  createSongRequest,
  updateSongRequest,
  deleteSongRequest,
} = songsSlice.actions;

export default songsSlice.reducer;
