import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchSongsStart,
  fetchSongsSuccess,
  fetchSongsFailure,
  addSong,
  updateSong,
  removeSong,
  fetchSongsRequest,
  createSongRequest,
  updateSongRequest,
  deleteSongRequest,
} from '../store/songsSlice';
import { fetchStatsRequest } from '../store/statsSlice';
import { getSongs, createSong, updateSong as apiUpdateSong, deleteSong } from '../services/api';
import type { Song, SongFormData } from '../types/song';

function* fetchSongsWorker(): Generator {
  try {
    yield put(fetchSongsStart());
    const songs = (yield call(getSongs)) as Song[];
    yield put(fetchSongsSuccess(songs));
  } catch (error) {
    yield put(fetchSongsFailure((error as Error).message));
  }
}

function* createSongWorker(action: PayloadAction<SongFormData>): Generator {
  try {
    const song = (yield call(createSong, action.payload)) as Song;
    yield put(addSong(song));
    yield put(fetchStatsRequest()); // keep stats in sync
  } catch (error) {
    yield put(fetchSongsFailure((error as Error).message));
  }
}

function* updateSongWorker(
  action: PayloadAction<{ id: string; data: Partial<SongFormData> }>,
): Generator {
  try {
    const { id, data } = action.payload;
    const song = (yield call(apiUpdateSong, id, data)) as Song;
    yield put(updateSong(song));
    yield put(fetchStatsRequest()); // keep stats in sync
  } catch (error) {
    yield put(fetchSongsFailure((error as Error).message));
  }
}

function* deleteSongWorker(action: PayloadAction<string>): Generator {
  try {
    const id = action.payload;
    yield call(deleteSong, id);
    yield put(removeSong(id));
    yield put(fetchStatsRequest()); // keep stats in sync
  } catch (error) {
    yield put(fetchSongsFailure((error as Error).message));
  }
}

function* watchFetchSongs(): Generator {
  yield takeLatest(fetchSongsRequest.type, fetchSongsWorker);
}

function* watchCreateSong(): Generator {
  yield takeLatest(createSongRequest.type, createSongWorker);
}

function* watchUpdateSong(): Generator {
  yield takeLatest(updateSongRequest.type, updateSongWorker);
}

function* watchDeleteSong(): Generator {
  yield takeEvery(deleteSongRequest.type, deleteSongWorker);
}

export function* watchSongs(): Generator {
  yield all([
    watchFetchSongs(),
    watchCreateSong(),
    watchUpdateSong(),
    watchDeleteSong(),
  ]);
}
