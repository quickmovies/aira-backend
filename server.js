require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
  res.send("Aira Backend Running");
});

app.post("/chat", async (req,res)=>{

  try{

    const userMessage = req.body.message;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          contents:[
            {
              parts:[
                {
                  text:`You are Aira, a caring AI assistant.\nUser: ${userMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log(data);

    const reply =
    data.candidates?.[0]
    ?.content?.parts?.[0]
    ?.text;

    res.json({
      reply: reply || "No response from Gemini"
    });

  }catch(err){

    console.log(err);

    res.json({
      reply:"Backend crashed"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("Server running");
});
