import { Request, Response, NextFunction } from 'express';
import Song from '../models/Song';

export const getAllSongs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const songs = await Song.find();
    res.status(200).json(songs);
  } catch (err) {
    next(err);
  }
};

export const createSong = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, artist, album, genre } = req.body as {
      title?: unknown;
      artist?: unknown;
      album?: unknown;
      genre?: unknown;
    };

    // Explicit presence check for each required field (returns 400 immediately)
    if (title === undefined || title === null || title === '') {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    if (artist === undefined || artist === null || artist === '') {
      res.status(400).json({ error: 'artist is required' });
      return;
    }
    if (album === undefined || album === null || album === '') {
      res.status(400).json({ error: 'album is required' });
      return;
    }
    if (genre === undefined || genre === null || genre === '') {
      res.status(400).json({ error: 'genre is required' });
      return;
    }

    // Whitespace-only strings pass the above check but will fail Mongoose validation —
    // let that bubble to the errorHandler.
    const song = await new Song({ title, artist, album, genre }).save();
    res.status(201).json(song);
  } catch (err) {
    next(err);
  }
};

export const updateSong = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!song) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }

    res.status(200).json(song);
  } catch (err) {
    next(err);
  }
};

export const deleteSong = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }

    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (err) {
    next(err);
  }
};
