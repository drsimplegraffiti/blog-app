import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
const app = express();
import multer from 'multer';
const port = process.env.PORT || 6089;

import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';

app.use(express.json());
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../client/public/upload');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.clear();
  console.log(`app running on http://localhost:${port}`);
});
