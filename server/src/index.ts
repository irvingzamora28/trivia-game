import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
dotenv.config();

const openai = new OpenAI();

app.post('/generate-audio', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const speechFile = path.resolve("./speech-alloy.mp3");
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    // Respond with the path or serve the file directly
    res.sendFile(speechFile);
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ message: 'Failed to generate audio' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
