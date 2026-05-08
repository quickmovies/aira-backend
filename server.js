require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
  res.send("Aira Backend Running");
});

app.post("/chat", async (req,res)=>{

  try{

    const userMessage =
    req.body.message;

    const response =
    await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model:"gpt-4.1-mini",
        messages:[
          {
            role:"system",
            content:
            "You are Aira, a caring emotional AI assistant for Manoj."
          },
          {
            role:"user",
            content:userMessage
          }
        ]
      },
      {
        headers:{
          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${process.env.OPENAI_KEY}`
        }
      }
    );

    const reply =
    response.data.choices[0]
    .message.content;

    res.json({
      reply
    });

  }catch(err){

    console.log(
      err.response?.data ||
      err.message
    );

    res.json({
      reply:
      "OpenAI API failed"
    });

  }

});

const PORT =
process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("Server running");
});
