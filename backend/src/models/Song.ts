import mongoose, { Schema, Model } from 'mongoose';

export interface ISong {
  _id: mongoose.Types.ObjectId;
  title: string;
  artist: string;
  album: string;
  genre: string;
  createdAt: Date;
  updatedAt: Date;
}

const nonEmptyStringValidator = {
  validator: (value: string): boolean => value.trim().length > 0,
  message: (props: { path: string }): string =>
    `${props.path} cannot be an empty or whitespace-only string`,
};

const SongSchema = new Schema<ISong>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    artist: {
      type: String,
      required: [true, 'artist is required'],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    album: {
      type: String,
      required: [true, 'album is required'],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    genre: {
      type: String,
      required: [true, 'genre is required'],
      trim: true,
      validate: nonEmptyStringValidator,
    },
  },
  { timestamps: true }
);

const Song: Model<ISong> = mongoose.model<ISong>('Song', SongSchema);

export default Song;
