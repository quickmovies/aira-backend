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

  const userMessage = req.body.message;

  try{

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents:[
          {
            parts:[
              {
                text:userMessage
              }
            ]
          }
        ]
      }
    );

    const reply =
      response.data.candidates[0]
      .content.parts[0].text;

    res.json({
      reply
    });

  }catch(err){

    console.log(
      err.response?.data || err.message
    );

    res.json({
      reply:"Gemini API failed"
    });

  }

});

const PORT =
process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("Server running");
});
