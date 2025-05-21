import express from "express";
import multer from "multer";
import { postToInstagram, getInstagramPosts } from "../controllers/instagram_controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/post", upload.single("image"), postToInstagram);

// ✅ נעדכן כאן את הראוט לשליפת הפוסטים
router.get("/posts", getInstagramPosts);

export default router;
