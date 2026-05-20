export interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  createdAt: string;
  updatedAt: string;
}

export interface SongFormData {
  title: string;
  artist: string;
  album: string;
  genre: string;
}

export interface GenreStat { genre: string; count: number; }
export interface ArtistStat { artist: string; songCount: number; albumCount: number; }
export interface AlbumStat  { album: string; count: number; }

export interface StatsResponse {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalGenres: number;
  songsPerGenre: GenreStat[];
  songsAndAlbumsPerArtist: ArtistStat[];
  songsPerAlbum: AlbumStat[];
}
