import { Request, Response } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import axios from "axios";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// פונקציה להורדת תמונה ושמירתה בשרת
async function downloadImageToUploads(imageUrl: string): Promise<string> {
  const filename = path.basename(new URL(imageUrl).pathname);
  const filepath = path.join(process.cwd(), "uploads", filename);

  // אם כבר יש קובץ כזה, לא יוריד שוב
  if (fs.existsSync(filepath)) {
    return filename;
  }

  const response = await axios.get(imageUrl, { responseType: "stream" });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filepath);
    (response.data as NodeJS.ReadableStream).pipe(writer);

    writer.on("finish", () => resolve(filename));
    writer.on("error", reject);
  });
}

const chatWithAI = async (req: Request, res: Response): Promise<void> => {
  const { message, imageUrl } = req.body;

  if (!message && !imageUrl) {
    res.status(400).json({ message: "Message or image is required" });
    return;
  }

  try {
    const userContent: any[] = [];

    if (message) {
      userContent.push({ type: "text", text: message });
    }

    if (imageUrl) {
      // במקרה שיש תמונת משתמש, אפשר להוסיף כאן טיפול מתאים, לדוגמה:
      userContent.push({
        type: "image_url",
        image_url: {
          url: imageUrl, // שלח URL ישיר לתמונה שהמשתמש העלה
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            'את עוזרת אישית יצירתית לרשתות חברתיות. תני מענה קצר וחכם למשתמש. אם יש צורך בתמונות לפוסט, תארי במדויק איזו תמונה יכולה להתאים. למשל: "image: תיאור התמונה."',
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    let aiResponse = completion.choices[0].message?.content;
    let generatedImageUrl = null;

    if (aiResponse && aiResponse.includes("image:")) {
      const imageDescription = aiResponse.match(/image:\s*(.*)/)?.[1]?.trim();

      if (imageDescription) {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: imageDescription,
          n: 1,
          size: "1024x1024",
        });

        if (imageResponse.data && imageResponse.data.length > 0) {
          const externalUrl = imageResponse.data[0].url;

          if (externalUrl) {
            // הורדת התמונה ושמירתה בתיקיית uploads
            const savedFilename = await downloadImageToUploads(externalUrl);

            // החזרת URL מקומי לתמונה
            generatedImageUrl = `http://localhost:3000/uploads/${savedFilename}`;
          }
        }
      }
    }

    res.status(200).json({ response: aiResponse, imageUrl: generatedImageUrl });
  } catch (error: any) {
    console.error("OpenAI API error:", error.response?.data || error.message || error);
    res.status(500).json({ message: "Error chatting with AI" });
  }
};

const uploadImage = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: "No image uploaded" });
    return;
  }

  const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
};

export default { chatWithAI, uploadImage };
