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

    // Safety check: Ensure the API key exists in Railway/Local environment
    if (!process.env.GEMINI_KEY) {
      console.error("CRITICAL ERROR: GEMINI_KEY is missing from environment variables.");
      return res.status(500).json({ reply: "Server configuration error." });
    }

    // Clean the API key to remove accidental spaces or newlines
    const apiKey = process.env.GEMINI_KEY.trim();

    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                  text: `You are Aira, a caring AI assistant.\nUser: ${userMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // Catch Google API errors (e.g., 404 Not Found, 403 Forbidden, 400 Bad Request)
    if (!response.ok) {
      console.error("Google API Error:", data.error || data);
      return res.status(response.status).json({ 
        reply: "Aira is having trouble connecting to her brain right now." 
      });
    }

    // Extract the text safely
    const reply =
      data.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text || "I'm not exactly sure how to respond to that.";

    // Send the reply back to the frontend
    res.json({ reply });

  } catch (error) {
    // Catch total backend crashes (e.g., network failure, syntax errors)
    console.error("Backend Crash:", error);
    res.status(500).json({ reply: "Aira's server is currently offline or experienced a crash." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running beautifully on port ${PORT}`);
});
