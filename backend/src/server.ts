import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  process.stderr.write('Error: MONGODB_URI environment variable is not set\n');
  process.exit(1);
}

const PORT = process.env.PORT ?? '5000';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(Number(PORT), () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    process.stderr.write(`Failed to connect to MongoDB: ${err.message}\n`);
    process.exit(1);
  });
