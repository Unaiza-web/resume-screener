import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { connectDB } from './config/db.js';
import analysisRoutes from './routes/analysis.js';
import interviewRoutes from './routes/interview.js';

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ai-resume-screener-api' });
});

app.use('/api', analysisRoutes);
app.use('/api/interview', interviewRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ detail: 'File must be under 10 MB.' });
    }
    return res.status(400).json({ detail: err.message || 'Invalid file upload.' });
  }
  console.error(err);
  res.status(500).json({ detail: 'Something went wrong on the server.' });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`AI Resume Screener API listening on http://localhost:${PORT}`);
  });
}

start();