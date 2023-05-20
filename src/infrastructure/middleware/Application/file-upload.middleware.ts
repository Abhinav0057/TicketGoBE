import multer from "multer";

const storage = multer.memoryStorage();
const whitelist = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
export const fileUpload = multer({
  storage: storage,
  fileFilter: (_, file, cb) => {
    if (!whitelist.includes(file.mimetype)) {
      return cb(new Error("file is not allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 2e6 },
});
