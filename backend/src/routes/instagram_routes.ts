import express from "express";
import multer from "multer";
import { postToInstagram, getInstagramPosts, getPopularInstagramPosts  } from "../controllers/instagram_controller";
import { getMonthlyStats } from "../controllers/instagram_controller";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/post", upload.single("image"), postToInstagram);

// ✅ נעדכן כאן את הראוט לשליפת הפוסטים
router.get("/posts", getInstagramPosts);

router.get("/popular", getPopularInstagramPosts);

router.get("/monthly", getMonthlyStats);


export default router;
