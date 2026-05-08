require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route (Helps Railway confirm the app is awake)
app.get("/", (req, res) => {
  res.send("Aira Backend is Running Properly!");
});

// Main Chat Route
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Prevent empty messages from hitting the API
    if (!userMessage) {
      return res.status(400).json({ reply: "Please say something!" });
    }

    // Safety check: Ensure both API keys exist in the environment
    if (!process.env.GEMINI_KEY || !process.env.ELEVENLABS_KEY) {
      console.error("CRITICAL ERROR: API keys are missing from environment variables.");
      return res.status(500).json({ reply: "Server configuration error." });
    }

    // Clean the API keys to remove accidental spaces or newlines
    const geminiKey = process.env.GEMINI_KEY.trim();
    const elevenKey = process.env.ELEVENLABS_KEY.trim();

    // ==========================================
    // 1. GET TEXT RESPONSE FROM GEMINI 2.5 FLASH
    // ==========================================
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  // System prompt setting Aira's personality
                  text: `You are Aira, a caring, warm, and highly expressive AI companion. Be concise.\nUser: ${userMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const geminiData = await geminiResponse.json();

    // Catch Google API errors
    if (!geminiResponse.ok) {
      console.error("Google API Error:", geminiData.error || geminiData);
      return res.status(geminiResponse.status).json({ 
        reply: "Aira is having trouble connecting to her brain right now." 
      });
    }

    // Extract the text safely
    const replyText =
      geminiData.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text || "I'm not exactly sure how to respond to that.";


    // ==========================================
    // 2. TURN TEXT INTO SPEECH WITH ELEVENLABS
    // ==========================================
    let audioBase64 = null;

    try {
      // Voice ID "21m00Tcm4TlvDq8ikWAM" is Rachel (warm, conversational)
      const elevenResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM?output_format=mp3_44100_128`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenKey
          },
          body: JSON.stringify({
            text: replyText,
            model_id: "eleven_turbo_v2_5", // The fastest model for real-time chat
          })
        }
      );

      if (elevenResponse.ok) {
        // Convert the audio stream into a Base64 string for the frontend
        const arrayBuffer = await elevenResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        audioBase64 = buffer.toString("base64");
      } else {
        // Log the error but don't crash the whole app if voice fails
        console.error("ElevenLabs Error:", await elevenResponse.text());
      }
    } catch (e) {
      console.error("ElevenLabs fetch failed:", e);
    }


    // ==========================================
    // 3. SEND BOTH TEXT AND AUDIO TO FRONTEND
    // ==========================================
    res.json({ 
      reply: replyText,
      audioBase64: audioBase64 
    });

  } catch (error) {
    // Catch total backend crashes
    console.error("Backend Crash:", error);
    res.status(500).json({ reply: "Aira's server is currently offline or experienced a crash." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running beautifully on port ${PORT}`);
});
