import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf", "text/plain", "text/csv"];
    if (allowed.includes(file.mimetype)) {
        console.log("✅ File uploaded:", file.originalname);
        cb(null, true);
    } else {
        cb(new Error("Only .jpeg, .png, .pdf, .txt, and .csv files are allowed"), false);
    }
};

const limits = { fileSize: 5 * 1024 * 1024 };

export const upload = multer({ storage, fileFilter, limits });
