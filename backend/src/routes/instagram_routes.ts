import express from "express";
import multer from "multer";
import { postToInstagram } from "../controllers/instagram_controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/post", upload.single("image"), postToInstagram);

export default router;