require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

app.get("/", (req,res)=>{
  res.send("Aira Backend Running");
});

app.post("/chat", async (req,res)=>{

  try{

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents:[
          {
            parts:[
              {
                text:req.body.message
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

    console.log(err.response?.data);

    res.json({
      reply:"Gemini API failed"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("Server running");
});
