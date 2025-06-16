import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getImageDescription(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe the image in detail." },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 100
    });

    // מניחים שהתיאור נמצא ב-response.choices[0].message.content
    const description = response.choices?.[0]?.message?.content || "";

    return description;
  } catch (error) {
    console.error("Error getting image description:", error);
    return "";
  }
}
