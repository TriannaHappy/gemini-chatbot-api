import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const STATIC_PATH = 'public';

// Middleware
app.use(cors());
app.use(express.json());
// root route
app.use(express.static(STATIC_PATH));

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    //validate user message
    // guard clause
    if (!message) {
        return res.status(400).json({ reply: 'Message is required.' });
    }

    try {
        // main response
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `You are a helpful and responsible AI health assistant. Answer the following health-related question in a supportive and informative way:\n\n"${message}"`
                        }
                    ]
                }
            ]
        });
        const text = result.text;
        // return res.status(200).json({ reply:text });
        // res.json(response);

        const emergencyCheck = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Answer with only "Yes" or "No": Does the following message describe a possibly urgent or emergency medical condition?\n\n"${message}"`
                        }
                    ]
                }
            ]
        });

        const emergencyReply = emergencyCheck.text?.trim().toLowerCase();
        let finalReply = text;

        // 🔧 ADDED: append warning if emergency detected
        if (emergencyReply === "yes") {
            finalReply += "\n\n⚠️ *Note: This may be an urgent condition. Please consult a healthcare professional or emergency services immediately.*";
        }

        return res.status(200).json({ reply: finalReply });
    }
    catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate content.' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})