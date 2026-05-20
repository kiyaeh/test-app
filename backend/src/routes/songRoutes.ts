import { Router } from 'express';
import { getAllSongs, createSong, updateSong, deleteSong } from '../controllers/songController';
import { validateObjectId } from '../middleware/validateObjectId';

const router = Router();

router.get('/', getAllSongs);
router.post('/', createSong);
router.put('/:id', validateObjectId, updateSong);
router.delete('/:id', validateObjectId, deleteSong);

export default router;
