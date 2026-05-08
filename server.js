require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ reply: "Please say something!" });

    const geminiKey = process.env.GEMINI_KEY.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are Aira, a caring, warm, and highly expressive AI companion. Be concise.\nUser: ${userMessage}` }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Error:", data);
      return res.status(response.status).json({ reply: "Aira is having trouble thinking." });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    
    // Just send the text back to the frontend
    res.json({ reply: replyText });

  } catch (error) {
    console.error("Backend Crash:", error);
    res.status(500).json({ reply: "Server offline." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
