import express from "express";
import chatController from "../controllers/chat_controller";
import multer from "multer";
import path from "path";

const router = express.Router();

// הגדרת אחסון הקובץ עם multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// הודעת טקסט
router.post("/message", chatController.chatWithAI);

// העלאת תמונה
router.post("/image", upload.single("image"), chatController.uploadImage);

export default router;
