import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user_routes";
import authRoutes from "./routes/auth_routes";
import chatRoutes from "./routes/chat_routes";
import analyticsRoutes from './routes/analytics_routes';
import instagramRoutes from "./routes/instagram_routes";
import businessProfileRoutes from "./routes/business_profile_routes";
import bodyParser from "body-parser";
import setupSwagger from "./swagger";
import cors from "cors";
import path from "path";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/analytics", analyticsRoutes);
app.get("/", (req, res) => {
  res.send("Hello world!");
});
app.use("/business-profile", businessProfileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/instagram", instagramRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


setupSwagger(app);

if (!process.env.DB_URL_ENV) {
  console.error('DB_URL_ENV environment variable is not defined');
  process.exit(1);
}

mongoose.connect(process.env.DB_URL_ENV)
  .then(() => {
    console.log('Connected to MongoDB');
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

export { app };

