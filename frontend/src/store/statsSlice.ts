import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StatsResponse } from '../types/song';

interface StatsState {
  data: StatsResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  data: null,
  loading: false,
  error: null,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    // State mutation actions (used by sagas to update store)
    fetchStatsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchStatsSuccess(state, action: PayloadAction<StatsResponse>) {
      state.data = action.payload;
      state.loading = false;
    },
    fetchStatsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    // Saga trigger action (watched by saga, no reducer logic needed)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchStatsRequest(_state) {
      // handled by saga
    },
  },
});

export const {
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchStatsRequest,
} = statsSlice.actions;

export default statsSlice.reducer;
