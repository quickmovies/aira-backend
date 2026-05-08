require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Aira AI Backend Running");
});

app.post("/chat", async (req, res) => {

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.json({
      reply: "No message received"
    });
  }

  try {

    const openai = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Aira, an emotional AI assistant for Manoj."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_KEY}`
        }
      }
    );

    const reply =
      openai.data.choices[0].message.content;

    return res.json({
      provider: "openai",
      reply
    });

  } catch (err) {

    try {

      const gemini = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: userMessage
                }
              ]
            }
          ]
        }
      );

      const reply =
        gemini.data.candidates[0]
        .content.parts[0].text;

      return res.json({
        provider: "gemini",
        reply
      });

    } catch (e) {

      return res.json({
        reply:
          "Both AI services failed"
      });

    }

  }

});

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
