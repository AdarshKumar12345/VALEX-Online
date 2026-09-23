// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// const storage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//         folder: "marketx/listings",
//         allowed_formats: ["jpg", "jpeg", "png", "webp"],
//     },
// });

// const upload = multer({
//     storage,
//     limits: {
//         fileSize: 8 * 1024 * 1024,
//     },
// });

// export default upload;

import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },

    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${ext}`;

        cb(null, filename);
    },
});

const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});