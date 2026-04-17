import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter to only accept PDFs
const fileFilter = (req, file, cb) => {
  console.log("file:  ", file);
  if (file.mimetype === "application/pdf") {
    cb(null, true); // Allow PDFs
  } else {
    cb(new Error("Only PDF files are allowed"), false); // Reject non-PDFs
  }
};

// Configure multer middleware
const upload = multer({
  storage,
  fileFilter,
  limits: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB limit
});

export default upload;
