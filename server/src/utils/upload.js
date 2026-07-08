import multer from 'multer';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB, matches the frontend

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const name = file.originalname.toLowerCase();
  if (name.endsWith('.pdf') || name.endsWith('.docx')) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF and DOCX files are supported.'));
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});
