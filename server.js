require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Aira Backend Running");
});

app.post("/chat", async (req, res) => {

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.json({
      reply: "No message"
    });
  }

  try {

    const response = await axios({
      method: "POST",
      url:
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                `You are Aira, a caring AI assistant.\nUser: ${userMessage}`
              }
            ]
          }
        ]
      }
    });

    const reply =
      response.data.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text || "No reply";

    return res.json({
      reply
    });

  } catch (err) {

    console.log(
      err.response?.data || err.message
    );

    return res.json({
      reply:
      "AI temporarily unavailable"
    });

  }

});

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});
