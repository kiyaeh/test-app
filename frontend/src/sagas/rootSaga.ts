import { all } from 'redux-saga/effects';
import { watchSongs } from './songsSaga';
import { watchStats } from './statsSaga';

export default function* rootSaga(): Generator {
  yield all([watchSongs(), watchStats()]);
}
