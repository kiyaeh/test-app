import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchStatsRequest,
} from '../store/statsSlice';
import { getStats } from '../services/api';
import type { StatsResponse } from '../types/song';

function* fetchStatsWorker(): Generator {
  try {
    yield put(fetchStatsStart());
    const data = (yield call(getStats)) as StatsResponse;
    yield put(fetchStatsSuccess(data));
  } catch (error) {
    yield put(fetchStatsFailure((error as Error).message));
  }
}

export function* watchStats(): Generator {
  yield takeLatest(fetchStatsRequest.type, fetchStatsWorker);
}
