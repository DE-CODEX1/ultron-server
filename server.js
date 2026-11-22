const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "You are Ultron, a fast, smart personal AI voice assistant for Boss Saheb Naskar. Keep replies concise, natural, and respond in the user's language (Bengali, Hindi, or English)."
});

app.get('/', (req, res) => {
  res.send('Ultron Core Server is Online!');
});

app.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

wss.on('connection', (ws) => {
  console.log('Ultron Client Connected');
  const chat = model.startChat();

  ws.on('message', async (message) => {
    try {
      const text = message.toString();
      const result = await chat.sendMessage(text);
      ws.send(JSON.stringify({ type: 'reply', text: result.response.text() }));
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', text: error.message }));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Ultron Server running on port ${PORT}`);
});
  
