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

  try {

    const userMessage =
    req.body.message;

    const response =
    await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text:
                `You are Aira, a caring emotional AI assistant for Manoj.\nUser: ${userMessage}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type":
          "application/json"
        }
      }
    );

    const reply =
    response.data.candidates?.[0]
    ?.content?.parts?.[0]
    ?.text || "No response";

    return res.json({
      reply
    });

  } catch (err) {

    console.log(
      err.response?.data ||
      err.message
    );

    return res.json({
      reply:
      "Gemini server error"
    });

  }

});

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});
