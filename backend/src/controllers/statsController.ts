import { RequestHandler } from 'express';
import Song from '../models/Song';

interface GenreStat {
  genre: string;
  count: number;
}

interface ArtistStat {
  artist: string;
  songCount: number;
  albumCount: number;
}

interface AlbumStat {
  album: string;
  count: number;
}

interface StatsResponse {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalGenres: number;
  songsPerGenre: GenreStat[];
  songsAndAlbumsPerArtist: ArtistStat[];
  songsPerAlbum: AlbumStat[];
}

export const getStats: RequestHandler = async (_req, res, next): Promise<void> => {
  try {
    const [
      totalSongs,
      distinctArtists,
      distinctAlbums,
      distinctGenres,
      songsPerGenre,
      songsAndAlbumsPerArtist,
      songsPerAlbum,
    ] = await Promise.all([
      Song.countDocuments(),
      Song.distinct('artist'),
      Song.distinct('album'),
      Song.distinct('genre'),
      Song.aggregate<GenreStat>([
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $project: { _id: 0, genre: '$_id', count: 1 } },
        { $sort: { genre: 1 } },
      ]),
      Song.aggregate<ArtistStat>([
        {
          $group: {
            _id: '$artist',
            songCount: { $sum: 1 },
            albums: { $addToSet: '$album' },
          },
        },
        {
          $project: {
            _id: 0,
            artist: '$_id',
            songCount: 1,
            albumCount: { $size: '$albums' },
          },
        },
        { $sort: { artist: 1 } },
      ]),
      Song.aggregate<AlbumStat>([
        { $group: { _id: '$album', count: { $sum: 1 } } },
        { $project: { _id: 0, album: '$_id', count: 1 } },
        { $sort: { album: 1 } },
      ]),
    ]);

    const stats: StatsResponse = {
      totalSongs,
      totalArtists: distinctArtists.length,
      totalAlbums: distinctAlbums.length,
      totalGenres: distinctGenres.length,
      songsPerGenre,
      songsAndAlbumsPerArtist,
      songsPerAlbum,
    };

    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};
