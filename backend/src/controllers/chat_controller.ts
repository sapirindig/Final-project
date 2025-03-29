import { Request, Response } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";


dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ✅ שליחת טקסט + תמונה לצ'אט (GPT-4o) ויצירת תמונה עם DALL-E
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
      const filename = path.basename(imageUrl);
      const imagePath = path.join(process.cwd(), "uploads", filename);
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
    
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${base64Image}`,
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

        generatedImageUrl = imageResponse.data[0].url;
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
